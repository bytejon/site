import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_FEATURE_DRAFTS!=='true','Separate local draft preview build'));
test('draft and ancestor previews stay absent from feeds, sitemap, and search',async({page})=>{
 for(const path of ['authoring-example','demo-hidden-draft','demo-hidden-draft/child','demo-no-tags','demo-long-tags']){
  await page.goto(`articles/${path}/`);await expect(page.locator('main')).toHaveAttribute('data-pagefind-ignore');
  await expect(page.getByText('Unpublished authoring example',{exact:true})).toBeVisible();
 }
 const feed=await(await page.request.get('rss.xml')).text(),sitemap=await(await page.request.get('sitemap.xml')).text();
 for(const word of ['authoring-example','hidden-draft','demo-no-tags','demo-long-tags']){expect(feed).not.toContain(word);expect(sitemap).not.toContain(word);}
 const results=await page.evaluate(async()=>{const path='/pagefind/pagefind.js';const index=await import(path);return(await index.search('draft sentinel')).results.length;});expect(results).toBe(0);
});
test('real absent metadata and long lowercase tags remain usable in draft preview',async({page},info)=>{
 for(const theme of ['light','dark']){
  await page.goto('articles/demo-no-tags/');await choose(page,'Color theme',theme);await expect(page.locator('.article-tags,.updated-date,.related-articles,.reader-outline')).toHaveCount(0);await expect(page.locator('.post-meta .published-date')).toHaveCount(1);
  await page.goto('articles/demo-long-tags/');await choose(page,'Color theme',theme);const labels=await page.locator('.article-tags a').allTextContents();expect(labels).toEqual(['article','luau','testing','a-long-lowercase-filter-label-that-needs-to-wrap-on-small-screens']);
  await page.locator('.article-tags a').last().click();const chip=page.locator('.filter-chip');await expect(chip).toHaveCount(1);await expect(chip.locator('svg')).toBeVisible();
  const difference=await chip.evaluate(el=>{const a=el.querySelector('span')!.getBoundingClientRect(),b=el.querySelector('svg')!.getBoundingClientRect();return Math.abs(a.y+a.height/2-b.y-b.height/2);});expect(difference).toBeLessThan(.6);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/draft-real-long-tags-${info.project.name}-${theme}.png`});
  await chip.click();await expect(page.locator('.filter-chip')).toHaveCount(0);
 }
});
