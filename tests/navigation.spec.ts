import { test, expect } from '@playwright/test';

for (const path of ['', 'projects/']) {
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
    await expect(page.getByRole('navigation', { name: 'Site', exact: true }).getByRole('link', { name: 'Writing', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await button.click();
    await page.getByRole('navigation', { name: 'Site menu', exact: true }).getByRole('link', { name: 'About', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('About');
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('topbar shares centered content bounds', async ({ page }) => {
  for (const width of [390, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['', 'writing/', 'about/', 'projects/']) {
      await page.goto(path);
      const header = await page.locator('body.personal-site > header, .page > header').boundingBox();
      const content = await page.locator('body.personal-site > main, .page').boundingBox();
      expect(Math.abs(header!.x - content!.x)).toBeLessThan(1);
      expect(Math.abs(header!.width - content!.width)).toBeLessThan(1);
      expect(Math.abs(header!.x + header!.width / 2 - width / 2)).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('active navigation uses a contrasting blue rectangle', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('writing/');
    await page.locator('header [data-theme-picker]').selectOption(theme);
    await page.setViewportSize({ width: 1440, height: 1000 });
    const active = page.locator('header a[aria-current]:visible');
    await expect(active).toHaveText('Writing');
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(active).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(active).toHaveCSS('background-color', 'rgb(49, 95, 204)');
    await expect(active).toHaveCSS('border-radius', '6px');
    await active.focus(); await expect(active).toBeFocused();
    const channel = (value: number) => { value /= 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; };
    const blue = .2126 * channel(49) + .7152 * channel(95) + .0722 * channel(204);
    expect(1.05 / (blue + .05)).toBeGreaterThan(4.5);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.locator(':popover-open a[aria-current]')).toHaveText('Writing');
    await expect(page.locator(':popover-open a[aria-current]')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.keyboard.press('Escape');
  }
});
