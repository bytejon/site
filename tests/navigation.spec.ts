import { choose } from './choices';
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

test('topbar has identical centered bounds across layout families', async ({ page }) => {
  const paths = ['', 'writing/', 'about/', 'projects/'];
  if (process.env.TEST_AUTHORING === 'true') paths.push('writing/single-article/', 'writing/single-tutorial/', 'writing/series-article/chapter/', 'writing/series-tutorial/chapter/', 'projects/example-project/reference/api/');
  for (const width of [390, 700, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    let reference: { x: number; width: number; logoX: number; right: number; height: number; writingX: number; themeX: number } | undefined;
    for (const path of paths) {
      await page.goto(path);
      const header = (await page.locator('body.personal-site > header, .page > header').boundingBox())!;
      const logo = (await page.locator('header .site-logo').boundingBox())!;
      const menu = page.getByRole('button', { name: 'Menu', exact: true });
      const end = (await (await menu.isVisible() ? menu : page.locator('header .theme-picker')).boundingBox())!;
      const bounds = { x: header.x, width: header.width, logoX: logo.x, right: end.x + end.width, height: header.height, writingX: width >= 800 ? (await page.locator('header .nav-links a').first().boundingBox())!.x : 0, themeX: (await page.locator('header .theme-picker').boundingBox())!.x };
      reference ||= bounds;
      expect(Math.abs(bounds.x - reference.x)).toBeLessThan(1);
      expect(Math.abs(bounds.width - reference.width)).toBeLessThan(1);
      expect(Math.abs(bounds.logoX - reference.logoX)).toBeLessThan(1);
      expect(Math.abs(bounds.right - reference.right)).toBeLessThan(1);
      expect(Math.abs(bounds.height - reference.height)).toBeLessThan(1);
      expect(Math.abs(bounds.writingX - reference.writingX)).toBeLessThan(1);
      expect(Math.abs(bounds.themeX - reference.themeX)).toBeLessThan(1);
      expect(Math.abs(header.x + header.width / 2 - width / 2)).toBeLessThan(1);
      expect(header.width).toBe(Math.min(width, 896));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('active navigation uses a contrasting blue rectangle', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    for (const section of ['Writing', 'Projects']) {
    await page.goto(`${section.toLowerCase()}/`);
    await choose(page, 'Color theme', theme);
    await page.setViewportSize({ width: 1440, height: 1000 });
    const active = page.locator('header a[aria-current]:visible');
    await expect(active).toHaveText(section);
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
    await expect(page.getByRole('navigation', { name: 'Site menu', exact: true }).locator('a[aria-current]')).toHaveText(section);
    await expect(page.getByRole('navigation', { name: 'Site menu', exact: true }).locator('a[aria-current]')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.keyboard.press('Escape');
    }
  }
});
