import { test, expect } from '@playwright/test';
import { choose } from './choices';
test.beforeEach(() => test.skip(process.env.TEST_DEMOS !== 'true', 'Local article fixtures'));
test('detail tags precede dates, wrap safely, and retain additive filters', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    for (const path of ['demo-math-and-markdown', 'demo-article-series/details']) {
      await page.goto(`articles/${path}/`); await choose(page, 'Color theme', theme);
      const tags = page.locator('article.prose > .article-tags');
      await expect(page.locator('article.prose > .tags')).toHaveCount(1);
      await expect(page.locator('article.prose > h1 + .article-tags + .post-meta')).toHaveCount(1);
      const geometry = await tags.evaluate(el => {
        const title = el.previousElementSibling!.getBoundingClientRect();
        const box = el.getBoundingClientRect(); const date = el.nextElementSibling!.getBoundingClientRect();
        return { title: title.bottom, top: box.top, bottom: box.bottom, date: date.top, font: parseFloat(getComputedStyle(el).fontSize), targets: [...el.querySelectorAll('a')].every(a => a.getBoundingClientRect().height >= 32) };
      });
      expect(geometry.top - geometry.title).toBeGreaterThanOrEqual(8); expect(geometry.date).toBeGreaterThanOrEqual(geometry.bottom);
      expect(geometry.font).toBeLessThan(14); expect(geometry.targets).toBe(true);
      await page.screenshot({ path: `test-results/article-tags-${path}-${info.project.name}-${theme}.png` });
      await tags.locator('li').first().evaluate(el => { el.after(...Array.from({length: 12}, () => el.cloneNode(true))); });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('.post-meta .updated-date')).toContainText('October 2, 2026');
      await expect(page.locator('.post-meta svg[aria-hidden="true"]')).toHaveCount(2);
      await expect(page.locator('.post-meta .date-separator')).toHaveText('·');
      expect(await tags.locator('a').allTextContents()).toEqual((await tags.locator('a').allTextContents()).map(label => label.toLowerCase()));
    }
    await page.goto('articles/?tag=math');
    await page.locator('.entry-title-link').filter({hasText:'Test article: math, Markdown, and Luau'}).click();
    await page.locator('.article-tags').getByRole('link', {name:'luau',exact:true}).click();
    expect(new URL(page.url()).searchParams.getAll('tag')).toEqual(['math','luau']);
    await page.getByRole('button', {name:'Remove tag filter: math',exact:true}).click();
    expect(new URL(page.url()).searchParams.getAll('tag')).toEqual(['luau']);
    await page.goto('articles/demo-component-tutorial/');
    await expect(page.locator('.post-meta .updated-date,.post-meta .date-separator')).toHaveCount(0);
  }
});
