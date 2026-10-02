import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { modules, recordSchema, can } from '@/lib/modules';
import { currentUser, isDemo, demoChange, listRecords, supabase } from '@/lib/server';
export async function POST(req: Request, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!modules[module] || modules[module].readOnly || !can(user.role, `${module}:update`))
    return NextResponse.json({ error: 'This action is not permitted.' }, { status: 403 });
  const origin = req.headers.get('origin');
  if (origin !== new URL(req.url).origin)
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  try {
    const body = await req.json();
    const existing = body.id
      ? (await listRecords(module)).find((r) => r.id === body.id)
      : undefined;
    if (body.id && !existing) throw new Error('Record not found.');
    if (body.action === 'note') {
      if (!['leads', 'applications'].includes(module) || !existing)
        throw new Error('Notes are only available on saved business records.');
      const note = String(body.note || '').trim();
      if (note.length < 1 || note.length > 5000)
        throw new Error('Enter a note of up to 5,000 characters.');
      if (isDemo) {
        await demoChange((db) => {
          const r = db[module].find((r) => r.id === body.id)!;
          r.data.notes = [
            ...(r.data.notes || []),
            { text: note, actor: user.name, at: new Date().toISOString() },
          ];
        });
      } else {
        const db = await supabase();
        const { error } = await db
          .from('internal_notes')
          .insert({ record_id: body.id, body: note, created_by: user.id });
        if (error) throw new Error('Unable to save note.');
      }
      revalidatePath('/admin');
      return NextResponse.json({ ok: true, id: body.id });
    }
    if (body.action === 'archive') body.record = { ...existing, status: 'archived' };
    const parsed = recordSchema(module).safeParse(body.record);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message, fields: parsed.error.flatten() },
        { status: 422 }
      );
    const record = parsed.data;
    if (module === 'pages' && existing?.slug === 'home' && record.slug !== 'home')
      throw new Error('The homepage slug is fixed. Edit its content instead.');
    if (module === 'media' && existing) {
      for (const key of ['bucket', 'path', 'mime', 'size']) record.data[key] = existing.data[key];
      if (record.data.bucket === 'private-internal' && record.status === 'published')
        throw new Error('Private internal assets cannot be published.');
    }

    if (record.status === 'published' || record.status === 'open') {
      if (!can(user.role, `${module}:publish`)) throw new Error('You cannot publish this content.');
      if (['research', 'jobs', 'services', 'pages'].includes(module) && !body.previewed)
        throw new Error('Preview this version before publishing.');
    }
    const all = await listRecords(module);
    if (all.some((r) => r.slug === record.slug && r.id !== body.id))
      throw new Error('That slug is already in use.');
    if (module === 'redirects') {
      const redirects = all.filter((r) => r.id !== body.id && r.status === 'published');
      let next = record.data.to;
      const seen = new Set([record.data.from]);
      for (let i = 0; i <= redirects.length; i++) {
        if (seen.has(next)) throw new Error('This redirect would create a loop.');
        seen.add(next);
        const edge = redirects.find((r) => r.data.from === next);
        if (!edge) break;
        next = edge.data.to;
      }
    }
    const id = body.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const publication = ['published', 'open'].includes(record.status);
    if (isDemo) {
      await demoChange((db) => {
        const rows = (db[module] ??= []);
        const index = rows.findIndex((r) => r.id === id);
        const saved = {
          ...record,
          id,
          data: { ...record.data, ...(existing?.data.notes ? { notes: existing.data.notes } : {}) },
          created_at: existing?.created_at || now,
          updated_at: now,
        };
        if (index < 0) rows.unshift(saved);
        else rows[index] = saved;
        (db.activity ??= []).unshift({
          id: crypto.randomUUID(),
          title: `${modules[module].singular} ${body.action === 'archive' ? 'archived' : publication ? 'published' : 'saved'}`,
          slug: id,
          status: 'recorded',
          data: { actor: user.name, entity: module, entity_id: id },
          created_at: now,
          updated_at: now,
        });
        if (
          existing &&
          existing.slug !== record.slug &&
          body.createRedirect &&
          modules[module].publicPath
        ) {
          (db.redirects ??= []).push({
            id: crypto.randomUUID(),
            title: `${existing.slug} → ${record.slug}`,
            slug: crypto.randomUUID(),
            status: 'published',
            data: {
              from: `${modules[module].publicPath === '/' ? '' : modules[module].publicPath}/${existing.slug}`,
              to: `${modules[module].publicPath === '/' ? '' : modules[module].publicPath}/${record.slug}`,
              code: '301',
            },
            created_at: now,
            updated_at: now,
          });
        }
      });
    } else {
      const db = await supabase();
      const { error } = await db.rpc('save_record', {
        p_id: id,
        p_module: module,
        p_title: record.title,
        p_slug: record.slug,
        p_status: record.status,
        p_data: record.data,
        p_expected_updated_at: existing ? body.expectedUpdatedAt || existing.updated_at : null,
      });
      if (error)
        throw new Error(
          error.message.includes('conflict')
            ? 'Someone else updated this record. Refresh before saving.'
            : 'Unable to save. Check your permissions and database configuration.'
        );
      if (
        existing &&
        existing.slug !== record.slug &&
        body.createRedirect &&
        modules[module].publicPath
      ) {
        const { error: redirectError } = await db.rpc('save_record', {
          p_id: crypto.randomUUID(),
          p_module: 'redirects',
          p_title: `Redirect ${existing.slug}`,
          p_slug: crypto.randomUUID(),
          p_status: 'published',
          p_data: {
            from: `${modules[module].publicPath === '/' ? '' : modules[module].publicPath}/${existing.slug}`,
            to: `${modules[module].publicPath === '/' ? '' : modules[module].publicPath}/${record.slug}`,
            code: '301',
          },
          p_expected_updated_at: null,
        });
        if (redirectError)
          return NextResponse.json({
            ok: true,
            id,
            warning: 'Content saved. Redirect could not be created; add it in Redirects.',
          });
      }
    }
    const saved = (await listRecords(module)).find((r) => r.id === id);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, id, updatedAt: saved?.updated_at });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : 'Unable to save. Your changes remain in the editor.',
      },
      { status: 400 }
    );
  }
}
