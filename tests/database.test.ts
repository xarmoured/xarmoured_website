import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
let db: PGlite;
const owner = '00000000-0000-4000-8000-000000000001',
  editor = '00000000-0000-4000-8000-000000000002',
  recruiter = '00000000-0000-4000-8000-000000000003',
  viewer = '00000000-0000-4000-8000-000000000004';
const job = '10000000-0000-4000-8000-000000000001',
  lead = '10000000-0000-4000-8000-000000000002',
  draft = '10000000-0000-4000-8000-000000000003';
async function role(role: string, id = '') {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${id}',false);set role ${role};`
  );
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema public,auth,storage to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`
  );
  for (const file of [
    '001_platform.sql',
    '002_workflows.sql',
    '003_validation.sql',
    '004_public_settings.sql',
    '005_role_scope.sql',
    '006_ordering.sql',
  ]) {
    const sql = await readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8');
    await db.exec(sql.replace('create extension if not exists pgcrypto;', ''));
  }
  await db.exec(
    `grant select on all tables in schema public to anon,authenticated;grant insert on public.internal_notes to authenticated;grant select,insert,delete on storage.objects to authenticated,anon;grant all on all tables in schema public to service_role;grant all on all sequences in schema public to service_role;insert into auth.users values('${owner}'),('${editor}'),('${recruiter}'),('${viewer}');insert into profiles(id,name,role) values('${owner}','Owner','owner'),('${editor}','Editor','editor'),('${recruiter}','Recruiter','recruiter'),('${viewer}','Viewer','viewer');insert into records(id,module,title,slug,status,data) values('${job}','jobs','Researcher','researcher','open','{"accept_applications":true}'),('${lead}','leads','Private Client','private-client','new','{"email":"private@example.com"}'),('${draft}','research','Private Research','private-research','draft','{"disclosure":"private"}');insert into storage.objects(bucket_id,name) values('private-applications','secret.pdf'),('public-assets','public.png');`
  );
});
afterAll(async () => {
  await db.close();
});
describe.sequential('Actual PostgreSQL security and workflows', () => {
  it('reorders content atomically and rejects unauthorized or stale updates', async () => {
    await role('authenticated', owner);
    const ids = ['50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002'];
    for (const [index, id] of ids.entries())
      await db.query(`select save_record($1,'services',$2,$3,'draft','{}',null)`, [
        id,
        `Service ${index}`,
        `service-${index}`,
      ]);
    const { rows } = await db.query<{ id: string; updated_at: string }>(
      `select id,updated_at::text from records where id in ($1,$2) order by id desc`,
      ids
    );
    await db.query(`select reorder_records('services',$1)`, [JSON.stringify(rows)]);
    const result = await db.query<{ id: string }>(
      `select id from records where module='services' order by (data->>'order')::int`
    );
    expect(result.rows.map((r) => r.id)).toEqual([...ids].reverse());
    await expect(
      db.query(`select reorder_records('services',$1)`, [JSON.stringify(rows)])
    ).rejects.toThrow('conflict');
    await role('authenticated', recruiter);
    await expect(db.query(`select reorder_records('services','[]')`)).rejects.toThrow('Forbidden');
  });
  it('limits viewers to aggregate insights and protects private records', async () => {
    await role('authenticated', viewer);
    expect(
      (await db.query(`select * from records where module in ('leads','applications')`)).rows
    ).toHaveLength(0);
    expect(
      (await db.query(`select * from storage.objects where bucket_id='private-applications'`)).rows
    ).toHaveLength(0);
    const { rows } = await db.query<{ counts: { new_leads: number } }>(
      `select dashboard_counts() as counts`
    );
    expect(rows[0].counts.new_leads).toBe(1);
    await role('anon');
    await expect(db.query('select dashboard_counts()')).rejects.toThrow();
  });

  it('keeps email templates private and only exposes projected company settings', async () => {
    await role('service_role');
    await db.exec(
      `insert into records(module,title,slug,status,data) values('settings','Website settings','site','published','{"company":"Xarmoured","interview_invitation":"Internal instructions"}')`
    );
    await role('anon');
    expect((await db.query(`select * from records where module='settings'`)).rows).toHaveLength(0);
    const { rows } = await db.query<{ settings: Record<string, string> }>(
      `select public_site_settings() as settings`
    );
    expect(rows[0].settings.company).toBe('Xarmoured');
    expect(rows[0].settings.interview_invitation).toBeUndefined();
  });
  it('rejects direct role escalation', async () => {
    await role('authenticated', viewer);
    await expect(
      db.query(`update profiles set role='owner' where id='${viewer}'`)
    ).rejects.toThrow();
  });
  it('validates URLs and private media in the database', async () => {
    await role('authenticated', owner);
    await expect(
      db.query(
        `select save_record(gen_random_uuid(),'navigation','Injected link','injected-link','published','{"destination":"javascript:alert(1)"}',null)`
      )
    ).rejects.toThrow('Unsafe URL');
    await expect(
      db.query(
        `select save_record(gen_random_uuid(),'media','Internal PDF','internal-pdf','published','{"bucket":"private-internal"}',null)`
      )
    ).rejects.toThrow();
  });
  it('denies anonymous private records and resumes', async () => {
    await role('anon');
    expect((await db.query('select * from records')).rows).toHaveLength(1);
    expect((await db.query('select * from storage.objects')).rows).toHaveLength(1);
    await expect(
      db.exec(`insert into records(module,title,slug,status) values('leads','Bad','bad','new')`)
    ).rejects.toThrow();
  });
  it('requires authentication and prevents viewer writes', async () => {
    await role('anon');
    await expect(
      db.query(`select save_record(gen_random_uuid(),'jobs','No','no','open','{}',null)`)
    ).rejects.toThrow();
    await role('authenticated', viewer);
    await expect(
      db.query(`select save_record(gen_random_uuid(),'jobs','No','no','open','{}',null)`)
    ).rejects.toThrow('Forbidden');
  });
  it('enforces role permissions in SQL, independent of client checks', async () => {
    await role('authenticated', recruiter);
    expect((await db.query(`select * from records where module='leads'`)).rows).toHaveLength(0);
    await expect(
      db.query(`select save_record(gen_random_uuid(),'research','No','no','draft','{}',null)`)
    ).rejects.toThrow('Forbidden');
    expect(
      (await db.query(`select * from storage.objects where bucket_id='private-applications'`)).rows
    ).toHaveLength(1);
    await role('authenticated', editor);
    expect(
      (await db.query(`select * from storage.objects where bucket_id='private-applications'`)).rows
    ).toHaveLength(0);
  });
  it('blocks confidential research even for the owner', async () => {
    await role('authenticated', owner);
    await expect(
      db.query(
        `select save_record(gen_random_uuid(),'research','Confidential','confidential','published','{"disclosure":"embargoed"}',null)`
      )
    ).rejects.toThrow('Disclosure is not public');
  });
  it('publishes a job and records an audit event atomically', async () => {
    await role('authenticated', recruiter);
    await db.query(
      `select save_record('20000000-0000-4000-8000-000000000001','jobs','New role','new-role','open','{"accept_applications":true}',null)`
    );
    expect(
      (
        await db.query(
          `select * from audit_logs where entity_id='20000000-0000-4000-8000-000000000001'`
        )
      ).rows
    ).toHaveLength(1);
    await role('anon');
    expect((await db.query(`select * from records where slug='new-role'`)).rows).toHaveLength(1);
  });
  it('saves leads privately through the server-only intake', async () => {
    await role('service_role');
    await db.query(
      `select receive_submission('30000000-0000-4000-8000-000000000001','leads','Real request','{"email":"client@example.com"}')`
    );
    await role('anon');
    expect(
      (await db.query(`select * from records where id='30000000-0000-4000-8000-000000000001'`)).rows
    ).toHaveLength(0);
    await expect(
      db.query(`select receive_submission(gen_random_uuid(),'leads','Bypass','{}')`)
    ).rejects.toThrow();
  });
  it('accepts open-job applications and rejects closed jobs transactionally', async () => {
    await role('service_role');
    await db.query(
      `select receive_submission('40000000-0000-4000-8000-000000000001','applications','Candidate','{"job_id":"${job}","resume_path":"private/file.pdf"}')`
    );
    await role('authenticated', recruiter);
    const { rows } = await db.query<{ updated_at: string }>(
      `select updated_at::text from records where id='${job}'`
    );
    await db.query(
      `select save_record($1,'jobs','Researcher','researcher','closed','{"accept_applications":false}',$2)`,
      [job, rows[0].updated_at]
    );
    await role('service_role');
    await expect(
      db.query(
        `select receive_submission('40000000-0000-4000-8000-000000000002','applications','Late Candidate','{"job_id":"${job}"}')`
      )
    ).rejects.toThrow('closed');
    expect(
      (await db.query(`select * from records where id='40000000-0000-4000-8000-000000000002'`)).rows
    ).toHaveLength(0);
  });
  it('protects internal notes and detects concurrent edits', async () => {
    await role('authenticated', owner);
    await db.query(
      `insert into internal_notes(record_id,body,created_by) values('${lead}','Private sales strategy','${owner}')`
    );
    await expect(
      db.query(
        `select save_record('${job}','jobs','Changed','researcher','open','{}','2000-01-01')`
      )
    ).rejects.toThrow('conflict');
    await role('anon');
    expect((await db.query('select * from internal_notes')).rows).toHaveLength(0);
  });
});
