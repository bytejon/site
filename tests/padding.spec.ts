import { choose } from './choices';
import { test, expect } from '@playwright/test';
async function comfortable(locator: import('@playwright/test').Locator, inlinePadding?: number) {
  const metrics = await locator.evaluate(el => { const c = getComputedStyle(el); return { height: el.getBoundingClientRect().height, left: parseFloat(c.paddingLeft), right: parseFloat(c.paddingRight) }; });
  expect(metrics.height).toBeGreaterThanOrEqual(44);
  if (inlinePadding) { expect(metrics.left).toBeGreaterThanOrEqual(inlinePadding); expect(metrics.right).toBeGreaterThanOrEqual(inlinePadding); }
}
test('controls and list interiors have comfortable spacing', async ({ page }) => {
  await page.goto('');
  await comfortable(page.locator('header .wordmark'));
  await comfortable(page.locator('header .theme-picker'));
  await comfortable(page.locator('.section-row').first(), 16);
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  if (await menu.isVisible()) {
    await comfortable(menu); await menu.click();
    await comfortable(page.getByRole('navigation', { name: 'Site menu', exact: true }).getByRole('link').first(), 16);
    await page.keyboard.press('Escape');
  } else await comfortable(page.locator('header .nav-links a').first(), 16);
  const homeX = (await page.locator('main').boundingBox())!.x;
  await page.goto('about/');
  expect((await page.locator('main').boundingBox())!.x).toBe(homeX);
  await comfortable(page.locator('.accounts a').first(), 16);
  await page.goto('articles/');
  await comfortable(page.locator('.writing-filters .filter-toggle'), 12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (process.env.TEST_DEMOS !== 'true') return;
  await page.goto('projects/demo-project/reference/api/');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Search', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  const docsMenu = page.getByRole('button', { name: 'Documentation', exact: true });
  if (await docsMenu.isVisible()) await docsMenu.click();
  await comfortable(page.locator('.project-navigation a').first(), 12);
  await comfortable(page.getByRole('button', { name: 'Search', exact: true }));
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Search', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
});
test('authoring components retain internal padding', async ({ page }) => {
  test.skip(process.env.TEST_DEMOS !== 'true', 'Local unpublished component fixtures');
  await page.goto('articles/demo-component-tutorial/');
  const padding = await page.locator('.note').first().evaluate(el => { const c = getComputedStyle(el); return [c.paddingTop, c.paddingLeft]; });
  expect(padding.map(parseFloat).every(value=>value>=16)).toBe(true);
  await comfortable(page.locator('.expressive-code button').first());
  await page.goto('articles/demo-article-series/first/');
  const reveal=page.getByRole('button',{name:'Pages',exact:true});if(await reveal.isVisible())await reveal.click();
  await comfortable(page.getByRole('navigation', { name: 'Article pages', exact: true }).getByRole('link').first(), 12);
  await page.goto('articles/');
  await choose(page, 'Tags', 'article');
  await expect(page.locator('.writing-list')).toBeVisible();
});
