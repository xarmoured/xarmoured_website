import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('boundary states, lifecycle and report anatomy are operable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Security that survives');
  await page.getByRole('button', { name: '04 Verified', exact: true }).click();
  await expect(page.getByText('The original path no longer holds.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '07 Retest', exact: true }).click();
  await expect(page.getByText('Output: a documented verification result')).toBeVisible();
  await page.getByRole('button', { name: '04 Evidence & reproduction', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Make the behavior reproducible.' })
  ).toBeVisible();
});
test('theme persists and mobile modal contains keyboard focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeVisible();
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
});
test('desktop services menu exposes published services and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Services', exact: true });
  await button.click();
  await expect(
    page.locator('#xa-services-menu').getByRole('link', { name: 'API Security Testing' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});
test('journal filters and empty resources remain useful', async ({ page }) => {
  await page.goto('/research');
  await page.getByRole('searchbox').fill('no-matching-publication');
  await expect(page.getByRole('status')).toContainText('0 entries');
  await page.goto('/resources');
  await expect(page.getByRole('heading', { name: 'Useful work. Shared openly.' })).toBeVisible();
  await page.goto('/services/web-application');
  await expect(
    page.getByRole('heading', { name: 'Common attack paths', exact: true })
  ).toBeVisible();
  await page.goto('/services/web-application/unmapped');
  await expect(page.getByRole('heading', { name: 'This page isn’t here.' })).toBeVisible();
});
test('public pages have no serious accessibility violations in both themes', async ({ page }) => {
  test.setTimeout(600000);
  for (const theme of ['dark', 'light'])
    for (const route of [
      '/',
      '/services',
      '/services/web-application',
      '/research',
      '/resources',
      '/methodology',
      '/assessment',
      '/careers',
      '/security',
      '/sample-report',
    ]) {
      await page.goto(route);
      await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations,
        `${route} ${theme}: ${JSON.stringify(results.violations.map((x) => ({ id: x.id, nodes: x.nodes.map((n) => n.target) })))}`
      ).toEqual([]);
    }
});
test('responsive public layouts and reduced motion', async ({ page }) => {
  test.setTimeout(600000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1920])
    for (const route of ['/', '/research', '/methodology', '/assessment', '/sample-report']) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${route} ${width} overflows`
      ).toBe(true);
    }
  expect(errors).toEqual([]);
  await page.goto('/');
  await page.screenshot({ path: 'test-results/xarmoured-home-dark-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('light');
  await page.screenshot({ path: 'test-results/xarmoured-home-light-desktop.png', fullPage: true });
});
