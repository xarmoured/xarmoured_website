import type { FullConfig } from '@playwright/test';
// Compile shared route bundles before launching Chromium on constrained development hosts.
// This runs only against the local, isolated E2E server.
export default async function setup(config: FullConfig) {
  const base = config.projects[0].use.baseURL!;
  for (const route of [
    '/',
    '/admin',
    '/admin/jobs/new',
    '/research',
    '/assessment',
    '/api/admin/jobs',
    '/api/admin/reorder',
    '/api/admin/record-action',
    '/api/submit',
    '/api/events',
  ]) {
    const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(600000) });
    if (!response.ok && response.status !== 405)
      throw new Error(`E2E warmup failed: ${route} (${response.status})`);
    const html = await response.text();
    const assets = [...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)];
    for (const [, asset] of assets) {
      const bundle = await fetch(new URL(asset.replaceAll('&amp;', '&'), base), {
        signal: AbortSignal.timeout(600000),
      });
      if (!bundle.ok) throw new Error(`E2E bundle warmup failed: ${asset}`);
      await bundle.arrayBuffer();
    }
  }
}
