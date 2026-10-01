import { test, expect } from '@playwright/test';

for (const path of ['', 'blog/', 'about/', 'tutorials/', 'projects/']) {
  test(`page ${path || 'home'} is navigable and fits the viewport`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Site', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `test-results/${test.info().project.name}-${path.replaceAll('/', '') || 'home'}.png`, fullPage: true });
  });
}

test('home navigation opens blog and return link works', async ({ page }) => {
  await page.goto('');
  await page.getByRole('navigation', { name: 'Site', exact: true }).getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Blog');
  await page.getByRole('link', { name: 'Jon', exact: true }).click();
  await expect(page.locator('h1')).toContainText('A place for things');
});

test('draft MDX and nested docs authoring fixtures', async ({ page }) => {
  test.skip(process.env.TEST_AUTHORING !== 'true', 'Only for a local authoring fixture build');
  await page.goto('blog/authoring-example/');
  await expect(page.getByRole('complementary', { name: 'Custom component example' })).toBeVisible();
  await expect(page.locator('pre[data-language="luau"]')).toBeVisible();
  const code = page.locator('pre[data-language="luau"]');
  if (await code.evaluate(el => el.scrollWidth > el.clientWidth)) {
    await expect(code).toHaveAttribute('tabindex', '0');
    await code.focus();
    await expect(code).toBeFocused();
  }
  await page.goto('tutorials/example-guide/first-chapter/');
  await expect(page.locator('h1')).toHaveText('First chapter');
  await expect(page.locator('pre[data-language="luau"]')).toBeVisible();
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  const sidebar = page.locator('nav.sidebar');
  await expect(sidebar.getByRole('link', { name: 'First chapter', exact: true })).toBeVisible();
  await sidebar.getByRole('link', { name: 'API reference', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('API reference');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
