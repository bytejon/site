import { test, expect } from '@playwright/test';
import { choose } from './choices';
test.beforeEach(() => test.skip(process.env.TEST_DEMOS !== 'true', 'Local feature demonstration content'));

test('math renders in Markdown and MDX with accessible output and both themes', async ({ page }) => {
  for (const path of ['articles/demo-math-and-markdown/', 'articles/demo-component-tutorial/', 'projects/demo-project/reference/math/', 'projects/demo-project/guides/components/']) {
    await page.goto(path);
    await expect(page.locator('h1')).toContainText('Test');
    await expect(page.locator('.katex:visible').first()).toBeVisible();
    expect(await page.locator('.katex math').count()).toBeGreaterThan(1);
    expect(await page.locator('.katex annotation[encoding="application/x-tex"]').count()).toBeGreaterThan(1);
    await expect(page.locator('.katex-error')).toHaveCount(0);
    for (const theme of ['dark', 'light']) {
      await choose(page, 'Color theme', theme);
      const color = await page.locator('.katex-html:visible').first().evaluate(el => getComputedStyle(el).color);
      expect(color).toBe(theme === 'dark' ? 'rgb(232, 233, 237)' : 'rgb(37, 44, 53)');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({path:`test-results/${test.info().project.name}-${theme}-${path.replaceAll('/','-')}.png`,fullPage:true});
    }
    await page.screenshot({path:`test-results/${test.info().project.name}-${path.replaceAll('/','-')}.png`,fullPage:true});
  }
});

test('Luau copy, Markdown anchors, tables, tasks, and footnotes work', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('articles/demo-math-and-markdown/');
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(2);
  await expect(page.locator('[data-footnote-ref]')).toHaveCount(1);
  const outline=page.locator('.reader-outline details');if(!await outline.evaluate(el=>(el as HTMLDetailsElement).open))await outline.locator('summary').click();
  await page.getByRole('navigation',{name:'On this page',exact:true}).getByRole('link',{name:'Inline and display math',exact:true}).click();
  await expect(page).toHaveURL(/#inline-and-display-math$/);
  expect((await page.locator('#inline-and-display-math').boundingBox())!.y).toBeGreaterThanOrEqual(80);
  const frame=page.locator('.expressive-code').filter({has:page.locator('pre[data-language="luau"]')});
  await frame.locator('.copy button').click();
  const copied=await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('export type Vector'); expect(copied).toContain('continue'); expect(copied).toContain('`Length:');
  expect(await page.locator('pre[data-language="luau"] span[style]').count()).toBeGreaterThan(10);
});

test('single entries and article/tutorial chapter trees have appropriate navigation', async ({ page }) => {
  await page.goto('articles/demo-component-tutorial/');
  await expect(page.getByRole('navigation',{name:'Article pages',exact:true})).toHaveCount(0);
  await expect(page.getByRole('complementary',{name:'Demo component',exact:true})).toBeVisible();
  for (const kind of ['article','tutorial']) {
    await page.goto(`articles/demo-${kind}-series/`);
    const chapters=page.getByRole('navigation',{name:'Article pages',exact:true});
    const reveal=page.getByRole('button',{name:'Pages',exact:true}); if(await reveal.isVisible()) await reveal.click(); await expect(chapters.locator('a')).toHaveCount(4);
    await page.locator('a[rel="next"]').click();
    await expect(page.locator('h1')).toHaveText(`Test ${kind}: first chapter`);
    await page.locator('a[rel="next"]').click();
    await expect(page.locator('h1')).toHaveText(`Test ${kind}: nested details`);
    await page.locator('a[rel="next"]').click();
    await expect(page.locator('h1')).toHaveText(`Test ${kind}: final chapter`);
    await expect(page.locator('a[rel="next"]')).toHaveCount(0);
    await expect(page.locator('a[rel="prev"]')).toContainText(/nested details/i);
  }
});

test('demo filters compose, survive reload, and root dates and RSS remain correct', async ({ page }) => {
  await page.goto('articles/');
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(5);
  await choose(page,'Tags','math');
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(1);
  await choose(page,'Tags','components'); await page.reload();
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(2);
  await expect(page.locator('[name="tag"]')).toHaveValue('components');
  await page.goto('articles/demo-article-series/details/');
  await expect(page.locator('.post-meta > time')).toHaveAttribute('datetime','2026-10-01T00:00:00.000Z');
  const rss=await (await page.request.get('rss.xml')).text();
  expect((rss.match(/<item>/g)||[]).length).toBe(5);
  expect(rss).toContain('Test article: math, Markdown, and Luau');
  expect(rss).not.toContain('hidden-draft'); expect(rss).not.toContain('/details/');
});

test('project nested navigation, MDX tabs, and search work; draft sentinels stay absent', async ({ page }) => {
  await page.goto('projects/');
  await page.getByRole('link',{name:/Test project: documentation playground/}).click();
  const menu=page.getByRole('button',{name:'Documentation',exact:true});if(await menu.isVisible())await menu.click();
  await page.getByRole('navigation',{name:'Documentation',exact:true}).getByRole('link',{name:'Components',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Project MDX component',exact:true})).toBeVisible();
  await expect(page.locator('.pagination-links a').first()).toHaveAttribute('href','/projects/demo-project/getting-started/');
  await expect(page.locator('.pagination-links a').last()).toHaveAttribute('href','/projects/demo-project/reference/api/');
  await page.getByRole('tab',{name:'Math',exact:true}).click();
  await expect(page.getByRole('tabpanel')).toContainText('inline expression');
  await page.getByRole('tab',{name:'Luau',exact:true}).click();
  await expect(page.locator('pre[data-language="luau"]')).toBeVisible();
  await page.keyboard.press('Control+k');
  const dialog=page.getByRole('dialog',{name:'Search',exact:true});
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox').fill('documentation playground');
  await expect(dialog.getByRole('link',{name:/Test project: documentation playground/}).first()).toBeVisible();
  await page.keyboard.press('Escape');
  const search=await page.evaluate(async () => {
    const path='/pagefind/pagefind.js'; const index=await import(path);
    const result=await index.search('draft sentinel'); return result.results.length;
  });
  expect(search).toBe(0);
  const sitemap=await (await page.request.get('sitemap.xml')).text();
  expect(sitemap).not.toContain('hidden-draft');
  for(const path of ['articles/demo-hidden-draft/','articles/demo-hidden-draft/child/','projects/demo-project/hidden-draft/']) expect((await page.request.get(path)).status()).toBe(404);
});
