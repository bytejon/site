import { test, expect } from '@playwright/test';

test('icon-only theme control defaults to Auto and supports keyboard selection', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  const picker = page.locator('header [data-theme-picker]');
  await expect(picker).toHaveValue('auto');
  expect(await picker.locator('option').allTextContents()).toEqual(['Auto', 'Dark', 'Light']);
  await expect(page.locator('header .theme-picker')).toHaveCSS('width', '36px');
  await picker.focus();
  await page.keyboard.press('ArrowDown');
  await expect(picker).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Alt+ArrowDown');
  await page.keyboard.press('Escape');
  await expect(picker).toBeFocused();
  await page.reload();
  await expect(picker).toHaveValue('dark');
});

test('About contains six requested accounts and no invented bio', async ({ page }) => {
  await page.goto('about/');
  await expect(page.locator('h1')).toHaveText('About');
  await expect(page.locator('.accounts li')).toHaveCount(6);
  await expect(page.locator('.accounts svg')).toHaveCount(6);
  await expect(page.getByRole('link', { name: 'Roblox: @jonbyte', exact: true })).toHaveAttribute('href', 'https://www.roblox.com/users/45851993/profile');
  await expect(page.locator('.accounts li').last()).toHaveText('Discord@jonbyte');
  await expect(page.locator('.accounts li').last().locator('a')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
