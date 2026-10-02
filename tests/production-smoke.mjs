import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const base = 'http://localhost:3100';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3100'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    XARMOURED_DEMO: 'true',
    NEXT_PUBLIC_SUPABASE_URL: '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
server.stdout.on('data', (d) => (output += d));
server.stderr.on('data', (d) => (output += d));
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(base + '/admin/login');
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert(ready, 'Production server did not start: ' + output);
  const admin = await fetch(base + '/admin', { redirect: 'manual' });
  assert([303, 307].includes(admin.status));
  assert(admin.headers.get('location')?.includes('/admin/login'));
  const mutation = await fetch(base + '/api/admin/jobs', {
    method: 'POST',
    headers: { origin: base, 'Content-Type': 'application/json' },
    body: JSON.stringify({ record: { title: 'Bypass', slug: 'bypass', status: 'open', data: {} } }),
  });
  assert.equal(mutation.status, 401);
  const resume = await fetch(base + '/api/admin/resume/unknown');
  assert.equal(resume.status, 403);
  const csv = await fetch(base + '/api/admin/export?module=leads');
  assert.equal(csv.status, 403);
  const login = await (await fetch(base + '/admin/login')).text();
  assert(!login.includes('Enter development demo'));
  assert(login.includes('Welcome back.'));
  const signup = await fetch(base + '/admin/register', {redirect:'manual'});
  assert([303, 307, 404].includes(signup.status));
  const home = await (await fetch(base)).text();
  assert(home.includes('Find the cracks.'));
  assert(!home.includes('DEVELOPMENT DEMO'));
  console.log(
    'PASS: production blocks demo bypass, anonymous admin access, mutations, resumes, exports, and public registration; public SSR content remains visible.'
  );
} finally {
  server.kill('SIGTERM');
}
