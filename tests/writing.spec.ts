import { choose } from './choices';
import { test, expect } from '@playwright/test';
test('legacy index URLs lead to Writing with the tutorial filter', async ({ page }) => {
  await page.goto('blog/'); await expect(page).toHaveURL(/\/writing\/$/);
  await page.goto('tutorials/'); await expect(page).toHaveURL(/\/writing\/\?type=tutorial$/);
  await expect(page.locator('[name="type"]')).toHaveValue('tutorial');
});
test('single and multi-page entries adapt to hierarchy, not type', async ({ page }) => {
  test.skip(process.env.TEST_AUTHORING !== 'true', 'Local unpublished authoring fixtures');
  for (const type of ['article', 'tutorial']) {
    await page.goto(`writing/single-${type}/`);
    await expect(page.getByRole('navigation', { name: 'Chapters', exact: true })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'On this page', exact: true })).toBeVisible();
    await expect(page.locator('pre[data-language="luau"]')).toBeVisible();
    await page.goto(`writing/series-${type}/`);
    const chapters = page.getByRole('navigation', { name: 'Chapters', exact: true });
    await expect(chapters.getByRole('link')).toHaveCount(4);
    await chapters.getByRole('link', { name: `Example ${type} chapter`, exact: true }).click();
    await expect(page.locator('a[rel="prev"]')).toContainText(`Example series ${type}`);
    await page.locator('a[rel="next"]').click();
    await expect(page.locator('h1')).toHaveText(`Example ${type} nested`);
    const header = await page.locator('.site-header').boundingBox();
    expect(header!.width).toBe(Math.min(page.viewportSize()!.width, 896));
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) await menu.click();
    const active = page.locator('a[aria-current="location"]:visible');
    await expect(active).toHaveText('Writing');
    await expect(active).toHaveCSS('color', 'rgb(255, 255, 255)');
    if (await menu.isVisible()) await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await choose(page, 'Color theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: `test-results/${test.info().project.name}-series-${type}.png`, fullPage: true });
  }
});
test('Writing type and topic filters compose and survive reload', async ({ page }) => {
  test.skip(process.env.TEST_AUTHORING !== 'true', 'Local unpublished authoring fixtures');
  await page.goto('writing/');
  await choose(page, 'Type', 'tutorial');
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(2);
  await choose(page, 'Topic', 'article');
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(0);
  await expect(page.locator('[data-empty]')).toBeVisible();
  await choose(page, 'Topic', 'tutorial'); await page.reload();
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(2);
  await expect(page.locator('[name="type"]')).toHaveValue('tutorial');
  await expect(page.locator('[name="topic"]')).toHaveValue('tutorial');
  await page.goto('blog/authoring-example/');
  await expect(page).toHaveURL(/\/writing\/authoring-example\/$/);
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
  expect(urls.some(url => url.endsWith('/writing/'))).toBe(true);
  expect(urls.some(url => /\/(blog|tutorials)\//.test(url))).toBe(false);
});
