import { test, expect } from '@playwright/test';
test.describe.serial('Owner workflows in explicitly isolated development demo', () => {
  let jobUrl = '';
  test('creates, previews, and publishes a job without source changes', async ({ page }) => {
    await page.goto('/admin/jobs/new');
    await page.getByLabel('Title', { exact: true }).fill('DEMO · Browser workflow researcher');
    await page.getByLabel('Short summary', { exact: true }).fill('Development-only test role.');
    await page.getByRole('button', { name: 'Hiring', exact: true }).click();
    await page.getByLabel('Accept applications', { exact: true }).check();
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/jobs\/(?!new)[^/]+$/);
    jobUrl = page.url();
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.getByRole('button', { name: 'Mark preview reviewed' }).click();
    await page.getByRole('button', { name: 'Open applications', exact: true }).click();
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('published successfully');
    await page.goto('/careers');
    await expect(
      page.getByRole('heading', { name: 'DEMO · Browser workflow researcher' })
    ).toBeVisible();
  });
  test('accepts an application and keeps the resume private', async ({ page }) => {
    await page.goto('/careers/demo-browser-workflow-researcher');
    await page.getByLabel('Your name').fill('DEMO · Browser Candidate');
    await page.getByLabel('Work email').fill('browser-applicant@example.com');
    await page
      .getByLabel('Introduce yourself')
      .fill('I work on application security and enjoy investigating authorization boundaries.');
    await page.locator('input[name="resume"]').setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\nDemo resume for browser testing only.\n%%EOF'),
    });
    await page.getByRole('button', { name: 'Submit application' }).click();
    await expect(page.getByRole('heading', { name: 'Application received.' })).toBeVisible();
    await page.goto('/admin/applications');
    await page.getByRole('link').filter({ hasText: 'DEMO · Browser Candidate' }).first().click();
    await expect(page.getByLabel('Candidate name', { exact: true })).toHaveValue(
      'DEMO · Browser Candidate'
    );
    await expect(page.getByRole('link', { name: 'View private resume' })).toHaveCount(0);
  });
  test('closes applications and updates the public role', async ({ page }) => {
    await page.goto(jobUrl);
    await page.getByRole('button', { name: 'Close applications', exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Close applications', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('saved successfully');
    await page.goto('/careers/demo-browser-workflow-researcher');
    await expect(page.getByRole('heading', { name: 'Applications are closed.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit application' })).toHaveCount(0);
  });
  test('captures a lead, changes its stage, and saves an internal note', async ({ page }) => {
    await page.goto('/assessment');
    await page.getByLabel('Your name').fill('DEMO · Browser Contact');
    await page.getByLabel('Work email').fill('browser-lead@example.com');
    await page.getByLabel('Company', { exact: false }).fill('DEMO · Browser Company');
    await page.getByLabel('What would you like tested?').selectOption('API Security Testing');
    await page.getByRole('button', { name: 'Request an assessment' }).click();
    await expect(page.getByRole('heading', { name: 'Let’s start a conversation.' })).toBeVisible();
    await page.goto('/admin/leads');
    await page.getByRole('link').filter({ hasText: 'DEMO · Browser Company' }).first().click();
    await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('qualified');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('status')).toContainText('saved successfully');
    await page.getByLabel('Add an internal note').fill('Private scoping note from browser test.');
    await page.getByRole('button', { name: 'Add note', exact: true }).click();
    await expect(
      page.getByText('Private scoping note from browser test.', { exact: true })
    ).toBeVisible();
  });
  test('blocks research publication before disclosure is public', async ({ page }) => {
    await page.goto('/admin/research/new');
    await page.getByLabel('Title', { exact: true }).fill('DEMO · Confidential Browser Research');
    await page.getByRole('button', { name: 'Disclosure', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Disclosure status', exact: true })
      .selectOption('embargoed');
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.getByRole('button', { name: 'Mark preview reviewed' }).click();
    await page.getByRole('button', { name: 'Publish content', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Only PUBLIC disclosure research' })
    ).toContainText('Only PUBLIC disclosure research can be published.');
    await expect(page.locator('.editor-meta .status')).toHaveText('draft');
    await page
      .getByRole('combobox', { name: 'Disclosure status', exact: true })
      .selectOption('public');
    await page.getByRole('button', { name: 'Overview', exact: true }).click();
    await page
      .getByLabel('Summary', { exact: true })
      .fill('DEMO · Responsible-disclosure publication test.');
    await page.getByRole('button', { name: 'Content', exact: true }).click();
    await page
      .getByLabel('Research content')
      .fill(
        '## DEMO advisory\nThis is fictional development content used to verify the publishing workflow.'
      );
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.getByRole('button', { name: 'Mark preview reviewed' }).click();
    await page.getByRole('button', { name: 'Publish content', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('published successfully');
    await page.goto('/research');
    await expect(
      page.getByRole('heading', { name: 'DEMO · Confidential Browser Research' })
    ).toBeVisible();
  });
  test('command palette locates actions and records', async ({ page }) => {
    await page.goto('/admin');
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('What would you like to do?').fill('Browser Company');
    await expect(
      page.getByRole('dialog').getByRole('link').filter({ hasText: 'DEMO · Browser Company' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
test('responsive public and admin screens remain within the viewport', async ({ page }) => {
  test.setTimeout(600000);
  for (const width of [375, 768, 1280, 1440, 1920])
    for (const route of [
      '/',
      '/services',
      '/careers',
      '/assessment',
      '/admin',
      '/admin/leads',
      '/admin/jobs/new',
      '/admin/settings',
      '/admin/analytics',
      '/research',
      '/methodology',
      '/about',
      '/sample-report',
      '/admin/applications',
      '/admin/research',
      '/admin/services',
      '/admin/pages',
      '/admin/faqs',
      '/admin/team',
      '/admin/media',
      '/admin/reports',
      '/admin/navigation',
      '/admin/seo',
      '/admin/announcements',
      '/admin/redirects',
      '/admin/activity',
      '/admin/account',
      '/admin/notifications',
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(150);
      await expect(page.locator('h1').first()).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        `${route} at ${width}px overflows`
      ).toBe(true);
    }
});
test('reorders services with accessible controls and saves public ordering', async ({ page }) => {
  await page.goto('/admin/services');
  await page.getByRole('button', { name: 'Reorder', exact: true }).click();
  const items = page.locator('.content-order li');
  const first = await items.first().locator('strong').innerText();
  await items
    .first()
    .getByRole('button', { name: `Move ${first} down`, exact: true })
    .click();
  await expect(items.nth(1).locator('strong')).toHaveText(first);
  await page.getByRole('button', { name: 'Save order', exact: true }).click();
  await expect(page.locator('.content-order')).toHaveCount(0);
  await page.goto('/services');
  await expect(page.locator('.service-item h3').nth(1)).toHaveText(first);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/admin');
  await expect(page.locator('h1').first()).toBeVisible();
  await page.screenshot({ path: '/tmp/xarmoured-admin-mobile-final.png', fullPage: true });
  await page.goto('/');
  await page.screenshot({ path: '/tmp/xarmoured-home-mobile-final.png', fullPage: true });
});
