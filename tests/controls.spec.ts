import { test, expect } from '@playwright/test';

test('theme popover supports keyboard selection, Escape, and outside dismissal', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  const picker = page.locator('header [data-theme-picker]');
  const trigger = picker.getByRole('button', { name: 'Color theme', exact: true });
  await expect(picker).toHaveAttribute('data-value', 'auto');
  await expect(trigger).toHaveCSS('width', '44px');
  await trigger.focus(); await page.keyboard.press('ArrowDown');
  await expect(picker.getByRole('listbox')).toBeVisible();
  await expect(picker.getByRole('option', { name: 'Auto', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(picker).toHaveAttribute('data-value', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await trigger.click(); await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click(); await page.locator('h1').click();
  await expect(picker.getByRole('listbox')).toBeHidden();
  await page.reload(); await expect(picker).toHaveAttribute('data-value', 'dark');
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

test('filter disclosure and toggle selection support keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('writing/');
  const trigger = page.getByRole('button', { name: 'Filters', exact: true });
  await expect(page.locator('.filter-options')).toBeHidden();
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.filter-options')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'All tags', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Tutorial', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\?tag=tutorial$/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.filter-options')).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Remove tag filter: Tutorial' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/\/writing\/$/);
});

test('nested docs keep the shared theme popover and search', async ({ page }) => {
  test.skip(process.env.TEST_AUTHORING !== 'true', 'Local unpublished project fixture');
  await page.goto('projects/example-project/reference/api/');
  await page.locator('header .theme-picker').click();
  await page.getByRole('listbox', { name: 'Color theme', exact: true }).getByRole('option', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Search', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
});
