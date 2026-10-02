import { test, expect } from '@playwright/test';
import { choose } from './choices';
test('shared search opens, returns focus, and aligns with theme on every layout', async ({ page }) => {
  for (const path of ['', 'articles/', 'projects/', 'about/', ...(process.env.TEST_DEMOS === 'true' ? ['articles/demo-math-and-markdown/', 'projects/demo-project/guides/components/'] : [])]) {
    await page.goto(path);
    const search = page.locator('header button[data-open-modal]');
    await expect(search).toBeEnabled();
    const a = (await search.boundingBox())!;
    const b = (await page.locator('header .theme-picker').boundingBox())!;
    expect(a.width).toBe(44); expect(a.height).toBe(44);
    expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(1);
    expect(a.x + a.width).toBeLessThan(b.x);
    await search.click();
    await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
    const dialog = (await page.getByRole('dialog', { name: 'Search' }).boundingBox())!;
    expect(Math.abs(dialog.x + dialog.width / 2 - page.viewportSize()!.width / 2)).toBeLessThan(1);
    const input = page.locator('.pagefind-ui__search-input');
    await expect(input).toBeVisible(); await expect(input).toBeFocused();
    await input.fill('About');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(search).toBeFocused();
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator('header button[data-open-modal]').click();
  await page.locator('.pagefind-ui__search-input').fill('About');
  await page.locator('.pagefind-ui__result-link[href$="/about/"]').first().click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();
});
test('article and project trees keep page links separate from keyboard disclosures', async ({ page }) => {
  test.skip(process.env.TEST_DEMOS !== 'true');
  for (const theme of ['light', 'dark']) {
    for (const route of ['articles/demo-article-series/first/', 'projects/demo-project/reference/api/']) {
      await page.goto(route); await choose(page, 'Color theme', theme);
      const project = route.startsWith('projects');
      const reveal = page.getByRole('button', {name: project ? 'Documentation' : 'Pages', exact:true});
      if (await reveal.isVisible()) { await reveal.focus(); await page.keyboard.press('Enter'); }
      const nav = page.locator(project ? '.project-navigation' : '#article-pages');
      const branch = nav.locator('.tree-branch').filter({has: page.locator('a[aria-current="page"]')}).last();
      const toggle = branch.locator(':scope > .branch-row > button');
      await expect(toggle).toHaveAttribute('aria-expanded','true');
      const buttonBounds = (await toggle.boundingBox())!;
      const labelBounds = (await branch.locator(':scope > .branch-row > a, :scope > .branch-row > .branch-label').boundingBox())!;
      expect(buttonBounds.x + buttonBounds.width).toBeLessThanOrEqual(labelBounds.x);
      expect(buttonBounds.width).toBe(44); expect(buttonBounds.height).toBe(44);
      await expect(toggle).toHaveCSS('border-top-width','0px');
      await toggle.hover();
      await expect(toggle).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
      await expect(toggle).toHaveCSS('outline-style','none');
      const url = page.url(); await toggle.focus();
      await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
      await expect(toggle).toBeFocused(); await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-expanded','false'); expect(page.url()).toBe(url);
      await expect(branch.locator(':scope > .branch-children')).toBeHidden();
      await page.keyboard.press('Enter'); await expect(toggle).toHaveAttribute('aria-expanded','true');
      await expect(toggle).toBeFocused();
      await expect(toggle).toHaveCSS('outline-style','solid');
      await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
      const leaf = nav.locator('a').filter({hasText: project ? 'Getting started' : 'Nested details'}).last();
      await leaf.click();
      await expect(page).toHaveURL(project ? /getting-started\/$/ : /details\/$/);
      await page.goBack(); await expect(page).toHaveURL(new RegExp(route + '$'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
test('project sidebar is deterministic, scoped, and Overview comes first', async ({ page }) => {
  test.skip(process.env.TEST_DEMOS !== 'true');
  let links: string[] | undefined;
  for (const path of ['projects/demo-project/', 'projects/demo-project/guides/components/', 'projects/demo-project/reference/api/']) {
    await page.goto(path);
    const toggle = page.getByRole('button', { name: 'Documentation', exact: true });
    if (await toggle.isVisible()) await toggle.click();
    const nav = page.locator('.project-navigation');
    await expect(nav.getByRole('link').first()).toHaveText('Overview');
    await expect(nav.locator('.top-level > li').first().locator('button')).toHaveCount(0);
    await expect(nav.locator('.branch-label')).toHaveCount(0);
    const hrefs = await nav.locator('a').evaluateAll(els => els.map(el => el.getAttribute('href')!));
    expect(hrefs.every(href => href.startsWith('/projects/demo-project/'))).toBe(true);
    links ||= hrefs; expect(hrefs).toEqual(links);
    await page.reload();
    expect(await nav.locator('a').evaluateAll(els => els.map(el => el.getAttribute('href')!))).toEqual(links);
  }
  await page.goto('projects/demo-project/reference/api/parameters/value/');
  const nested = page.locator('.project-navigation');
  await expect(nested.locator('.branch-toggle[aria-expanded="true"]')).toHaveCount(2);
  await expect(nested.locator('a[aria-current="page"]')).toHaveText('Value');
  for (const project of ['demo-no-overview', 'demo-zz-minimal']) {
    await page.goto(`projects/${project}/`);
    const nav = page.locator('.project-navigation');
    await expect(nav.locator('a')).toHaveCount(1);
    await expect(nav.locator('a')).toHaveText('Overview');
    await expect(nav.locator('a')).toHaveAttribute('href', `/projects/${project}/`);
  }
});


