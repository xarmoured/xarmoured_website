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
  const signup = await fetch(base + '/admin/register', { redirect: 'manual' });
  assert([303, 307, 404].includes(signup.status));
  const home = await (await fetch(base)).text();
  assert(home.includes('Security that survives'));
  assert(!home.includes('Web Application VAPT'));
  const csp = (await fetch(base)).headers.get('content-security-policy');
  assert(csp.includes("'nonce-"));
  assert(!csp.split('script-src')[1].split(';')[0].includes('unsafe-inline'));
  const security = await fetch(base + '/.well-known/security.txt');
  assert.equal(security.status, 503);
  assert(!(await security.text()).includes('mailto:'));
  assert(!home.includes('DEVELOPMENT DEMO'));
  assert.equal((await fetch(base + '/security')).status, 200);
  const contact = await fetch(base + '/contact', { redirect: 'manual' });
  assert([200, 303, 307, 308].includes(contact.status));
  if (contact.status === 200) assert((await contact.text()).includes('url=/assessment'));
  else assert(contact.headers.get('location')?.endsWith('/assessment'));
  const robots = await (await fetch(base + '/robots.txt')).text();
  assert(robots.includes('/admin'));
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  assert(sitemap.includes('/methodology'));
  assert(!sitemap.includes('/services/web-application'));
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      headless: true,
    });
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      await page.goto(base + '/contact');
      await page.waitForURL(base + '/assessment');
      await page.goto(base);
      await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
      await page.getByRole('button', { name: '04 Verified', exact: true }).click();
      assert(
        await page.getByText('The original path no longer holds.', { exact: true }).isVisible()
      );
      await page.screenshot({
        path: 'test-results/production-home-dark-desktop.png',
        fullPage: true,
      });
      await page.screenshot({ path: 'test-results/production-hero-dark-desktop.png' });
      await page.getByRole('combobox', { name: 'Color theme' }).selectOption('light');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: 'test-results/production-home-light-mobile.png',
        fullPage: true,
      });
      await page.screenshot({ path: 'test-results/production-hero-light-mobile.png' });
      await page
        .locator('.xa-boundary-map')
        .screenshot({ path: 'test-results/production-diagram-light-mobile.png' });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(base);
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await page
        .getByRole('dialog', { name: 'Mobile navigation' })
        .waitFor({ state: 'visible' })
        .catch(async (error) => {
          console.error('Mobile menu diagnostic:', {
            expanded: await page
              .getByRole('button', { name: 'Open navigation', exact: true })
              .getAttribute('aria-expanded'),
            dialogOpen: await page.locator('dialog').evaluate((el) => el.open),
            errors,
          });
          throw error;
        });
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        assert(
          await page.evaluate(() => !!document.activeElement?.closest('dialog')),
          `Mobile dialog focus escaped after Tab ${i + 1}`
        );
      }
      await page.keyboard.press('Escape');
      await page.getByRole('dialog', { name: 'Mobile navigation' }).waitFor({ state: 'hidden' });
      assert(
        await page
          .getByRole('button', { name: 'Open navigation', exact: true })
          .evaluate((el) => el === document.activeElement)
      );
      await page.goto(base + '/assessment');
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');

      const { default: AxeBuilder } = await import('@axe-core/playwright');
      await page.setViewportSize({ width: 1440, height: 1000 });
      const accessibilityIssues = [];
      for (const theme of ['dark', 'light']) {
        for (const route of [
          '/',
          '/services',
          '/research',
          '/resources',
          '/methodology',
          '/assessment',
          '/careers',
          '/about',
          '/security',
          '/sample-report',
        ]) {
          await page.goto(base + route);
          assert.equal(
            await page.locator('#__next_error__').count(),
            0,
            `${route} server render failed`
          );
          await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
          const result = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          accessibilityIssues.push(
            ...result.violations.map((v) => ({
              route,
              theme,
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            }))
          );
        }
      }
      assert.deepEqual(accessibilityIssues, [], 'Public accessibility');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const route of ['/', '/research', '/methodology', '/assessment', '/sample-report']) {
          await page.goto(base + route);
          assert.equal(await page.locator('h1').count(), 1, `${route} heading hierarchy`);
          assert(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${route} ${width} overflow`
          );
        }
      }
      console.log(
        'PASS: axe on ten public routes in both themes; eight responsive widths; reduced motion; mobile keyboard focus.'
      );
      assert.deepEqual(errors, [], 'Production hydration/CSP errors');
      console.log(
        'PASS: production browser hydrates under nonce CSP; diagram and persistent theme work.'
      );
    } finally {
      await browser.close();
    }
  }

  console.log(
    'PASS: production blocks demo bypass, anonymous admin access, mutations, resumes, exports, and public registration; public SSR content remains visible.'
  );
} finally {
  server.kill('SIGTERM');
}
