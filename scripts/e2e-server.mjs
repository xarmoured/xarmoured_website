import { rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
// This path belongs only to the test harness. The owner's demo data is untouched.
await rm('.demo-data/e2e-records.json', { force: true });
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--webpack'], {
  env: { ...process.env, XARMOURED_DEMO: 'true', XARMOURED_DEMO_NAMESPACE: 'e2e' },
  stdio: 'inherit',
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code || 0));
