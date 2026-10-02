import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local enhancement fixtures'));
test('tag links are separate accessible links and dates/related roots are author controlled',async({page})=>{
 await page.goto('articles/');await expect(page.locator('a a')).toHaveCount(0);
 const row=page.locator('.entry-row').filter({hasText:'Test article: math, Markdown, and Luau'}).first();
 await expect(row.locator('.updated-date')).toContainText('October 2, 2026');
 await row.locator('.entry-title-link').click();const tag=page.locator('.article-tags').getByRole('link',{name:'math',exact:true});await tag.focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/tag=math/);await expect(page.locator('.writing-list > li:visible')).toHaveCount(process.env.TEST_FEATURE_DRAFTS==='true'?2:1);
 await row.locator('.entry-title-link').click();await expect(page.locator('.post-meta .updated-date')).toContainText('October 2, 2026');
 const related=page.getByRole('region',{name:'Related articles',exact:true});await expect(related).toBeVisible();
 await expect(related.locator('.entry-row')).toHaveCount(3);expect(await related.locator('.entry-title-link').evaluateAll(links=>links.every(link=>!(link as HTMLAnchorElement).pathname.includes('/demo-math-and-markdown/')&&!(link as HTMLAnchorElement).pathname.includes('/details/')))).toBe(true);
 await page.goto('articles/demo-component-tutorial/');await expect(page.locator('.post-meta .updated-date')).toHaveCount(0);
 await page.goto('articles/demo-article-series/');await expect(page.locator('.post-meta .updated-date')).toHaveCount(0);
 await page.goto('articles/demo-article-series/details/');await expect(page.locator('.post-meta .updated-date')).toContainText('October 2, 2026');
});
test('returning restores filters and scroll without overriding tag links/direct navigation',async({page})=>{
 for(const theme of ['light','dark']){
  await page.goto('articles/');await choose(page,'Color theme',theme);await choose(page,'Tags','testing');await page.keyboard.press('Escape');
  const target=page.locator('.writing-list > li:visible').last().locator('.entry-title-link');await target.scrollIntoViewIfNeeded();
  const y=await page.evaluate(()=>scrollY);const listURL=page.url();await target.click();
  await page.getByRole('navigation',{name:'Breadcrumb',exact:true}).getByRole('link',{name:'Articles',exact:true}).click();await expect(page).toHaveURL(listURL);
  await expect(page.locator('.filter-chip')).toHaveCount(1);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(y,0);
  await target.click();await page.goBack();await expect(page).toHaveURL(listURL);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(y,0);
  await target.click();await page.goBack();await page.goForward();await page.getByRole('navigation',{name:'Breadcrumb',exact:true}).getByRole('link',{name:'Articles',exact:true}).click();
  await page.goto('articles/demo-math-and-markdown/');await page.locator('.tags').getByRole('link',{name:'math',exact:true}).click();await expect(page).toHaveURL(/tag=math/);
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(process.env.TEST_FEATURE_DRAFTS==='true'?2:1);expect(await page.evaluate(()=>scrollY)).toBeLessThan(100);
  await page.goto('articles/#main');await expect(page.locator('.filter-chip')).toHaveCount(0);expect(await page.evaluate(()=>location.hash)).toBe('#main');
  await page.goto('articles/');await expect(page.locator('.filter-chip')).toHaveCount(0);
 }
});
test('project overview renders only supplied metadata with copyable installation',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 for(const theme of ['light','dark']){
  await page.goto('projects/demo-project/');await choose(page,'Color theme',theme);const overview=page.getByRole('region',{name:'Project overview',exact:true});
  await expect(overview).toContainText('Local-only metadata demonstration');await expect(overview.getByRole('link',{name:'Source',exact:true})).toHaveAttribute('href','https://github.com/bytejon/site');
  await expect(overview.getByRole('link',{name:'Documentation',exact:true})).toHaveAttribute('href','/projects/demo-project/getting-started/');
  await overview.locator('.copy button').click();expect((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n')).toContain('local overview demo');
  await page.screenshot({path:`test-results/overview-${test.info().project.name}-${theme}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('projects/demo-no-overview/');await expect(page.getByRole('region',{name:'Project overview',exact:true})).toHaveCount(0);await expect(page.locator('pre')).toHaveCount(0);
});
test('generic tags and earlier updated dates show no related or Updated section',async({page})=>{
 test.skip(process.env.TEST_FEATURE_DRAFTS!=='true','Explicit local draft edge-case build');
 await page.goto('articles/demo-reader-edge/');await expect(page.getByRole('region',{name:'Related articles',exact:true})).toHaveCount(0);await expect(page.locator('.post-meta .updated-date')).toHaveCount(0);
});

test('article footers omit the return control and separate pagination from related entries',async({page})=>{
 for(const theme of ['light','dark']) {
  for(const path of ['articles/demo-math-and-markdown/','articles/demo-article-series/first/']) {
   await page.goto(path);await choose(page,'Color theme',theme);
   await expect(page.getByRole('link',{name:'Back to articles',exact:true})).toHaveCount(0);
   await expect(page.locator('.article-return')).toHaveCount(0);
   const related=page.locator('.related-articles');await expect(related).toBeVisible();
   const pagination=page.locator('.chapter-pagination');
   if(path.includes('/first/')) {
    const nav=(await pagination.boundingBox())!;const section=(await related.boundingBox())!;
    expect(section.y-nav.y-nav.height).toBeGreaterThanOrEqual(55);
   } else {await expect(pagination).toHaveCount(0);await expect(related).toHaveCSS('margin-top','32px');}
  }
 }
});
test('entry tags are static and public edit links are absent',async({page})=>{
 for(const path of ['articles/','articles/demo-math-and-markdown/','']) {
  await page.goto(path);await expect(page.locator('.entry-row .tag-link')).toHaveCount(0);
  await expect(page.locator('.entry-row a a')).toHaveCount(0);
 }
 await page.goto('projects/demo-project/');await expect(page.getByRole('link',{name:/edit (this )?page/i})).toHaveCount(0);
});
