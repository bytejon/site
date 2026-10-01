import {test,expect} from '@playwright/test';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local demonstration content'));
test('articles use a right outline and a collapsible outline on narrow screens',async({page})=>{
 await page.goto('writing/demo-math-and-markdown/');
 await expect(page.getByRole('navigation',{name:'Chapters',exact:true})).toHaveCount(0);
 const details=page.locator('.reader-outline details');const summary=details.locator('summary');
 if(test.info().project.name==='mobile') {await expect(details).not.toHaveAttribute('open');await summary.focus();await page.keyboard.press('Enter');}
 else {const article=await page.locator('article').boundingBox();const outline=await details.boundingBox();expect(outline!.x).toBeGreaterThan(article!.x+article!.width);}
 const nav=page.getByRole('navigation',{name:'On this page',exact:true});
 const link=nav.getByRole('link',{name:'Inline and display math',exact:true});
 await link.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#inline-and-display-math$/);
 expect((await page.locator('#inline-and-display-math').boundingBox())!.y).toBeGreaterThanOrEqual(80);
 await expect(link).toHaveAttribute('aria-current','location');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('writing/demo-article-series/details/');await expect(page.getByRole('navigation',{name:'Chapters',exact:true})).toBeVisible();
});
