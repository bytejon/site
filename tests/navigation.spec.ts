import { test, expect } from '@playwright/test';

for (const path of ['', 'tutorials/']) {
  test(`responsive keyboard menu ${path || 'home'}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const button = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('header a[href*="github.com"]')).toHaveCount(0);
    await expect(page.locator('header [data-theme-picker]:visible')).toHaveCount(1);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Site menu', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Site menu', exact: true }).getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(page.locator(':popover-open a[href*="github.com"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(button).toBeHidden();
    await expect(page.locator(':popover-open')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Site', exact: true }).getByRole('link', { name: 'Blog', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await button.click();
    await page.getByRole('navigation', { name: 'Site menu', exact: true }).getByRole('link', { name: 'About', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('Jon');
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
