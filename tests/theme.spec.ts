import { choose } from './choices';
import { test, expect } from '@playwright/test';

test('theme persists between custom and documentation layouts and reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await choose(page, 'Color theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('starlight-theme'))).toBe('dark');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(20, 23, 28)');
  await page.screenshot({ path: `test-results/${test.info().project.name}-home-dark.png`, fullPage: true });
  expect(await page.locator('body').innerText()).not.toMatch(/bytejon|A place for things/);
  const homeMenu = page.getByRole('button', { name: 'Menu', exact: true });
  if (await homeMenu.isVisible()) await homeMenu.click();
  await page.locator('a:visible').filter({ hasText: /^Projects$/ }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: `test-results/${test.info().project.name}-docs-dark.png`, fullPage: true });
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  await choose(page, 'Color theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goto('articles/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(245, 239, 227)');
  await choose(page, 'Color theme', 'auto');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('about/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('starlight-theme'))).toBe('');
});

test('Luau code follows the selected theme', async ({ page }) => {
  test.skip(process.env.TEST_DEMOS !== 'true', 'Only for local draft verification');
  await page.goto('articles/demo-component-tutorial/');
  await choose(page, 'Color theme', 'dark');
  const token = page.locator('pre[data-language="luau"] span[style]').first();
  const darkColor = await token.evaluate(el => getComputedStyle(el).color);
  await page.screenshot({ path: `test-results/${test.info().project.name}-luau-dark.png`, fullPage: true });
  await choose(page, 'Color theme', 'light');
  const lightColor = await token.evaluate(el => getComputedStyle(el).color);
  expect(lightColor).not.toBe(darkColor);
  await expect(page.getByRole('complementary', { name: 'Demo component' })).toBeVisible();
});
