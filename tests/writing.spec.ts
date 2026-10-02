import { choose } from './choices';
import { test, expect } from '@playwright/test';
test('legacy index URLs lead to Writing with the tutorial filter', async ({ page }) => {
  await page.goto('blog/'); await expect(page).toHaveURL(/\/articles\/$/);
  await page.goto('tutorials/'); await expect(page).toHaveURL(/\/articles\/\?tag=tutorial$/);
  await expect(page.locator('[name="tag"]')).toHaveValue('tutorial');
});
test('single and multi-page entries adapt to hierarchy independently of tags', async ({ page }) => {
  test.skip(process.env.TEST_AUTHORING !== 'true', 'Local unpublished authoring fixtures');
  for (const type of ['article', 'tutorial']) {
    await page.goto(`articles/single-${type}/`);
    await expect(page.getByRole('navigation', { name: 'Article pages', exact: true })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'On this page', exact: true })).toBeVisible();
    await expect(page.locator('pre[data-language="luau"]')).toBeVisible();
    await page.goto(`articles/series-${type}/`);
    const chapters = page.getByRole('navigation', { name: 'Article pages', exact: true });
    const reveal=page.getByRole('button',{name:'Pages',exact:true}); if(await reveal.isVisible()) await reveal.click(); await expect(chapters.locator('a')).toHaveCount(4);
    await chapters.getByRole('link', { name: `Example ${type} chapter`, exact: true }).click();
    await expect(page.locator('a[rel="prev"]')).toContainText(`Example series ${type}`);
    await page.locator('a[rel="next"]').click();
    await expect(page.locator('h1')).toHaveText(`Example ${type} nested`);
    const header = await page.locator('.site-header').boundingBox();
    expect(header!.width).toBe(Math.min(page.viewportSize()!.width, 896));
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) await menu.click();
    const active = page.locator('a[aria-current="location"]:visible');
    await expect(active).toHaveText('Articles');
    await expect(active).toHaveCSS('color', 'rgb(255, 255, 255)');
    if (await menu.isVisible()) await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await choose(page, 'Color theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: `test-results/${test.info().project.name}-series-${type}.png`, fullPage: true });
  }
});
test('Pagefind indexes new Writing routes', async ({ page }) => {
  test.skip(process.env.TEST_AUTHORING !== 'true', 'Local authoring search fixture');
  await page.goto('projects/');
  const urls = await page.evaluate(async () => {
    const modulePath = '/pagefind/pagefind.js';
    const pagefind = await import(modulePath);
    const result = await pagefind.search('Writing');
    return Promise.all(result.results.map(async (item: { data: () => Promise<{ url: string }> }) => (await item.data()).url));
  });
  expect(urls.some(url => url.endsWith('/articles/'))).toBe(true);
  expect(urls.some(url => /\/(blog|tutorials)\//.test(url))).toBe(false);
});
