import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local code fixtures'));
test('compact gutter aligns one/two/three-digit numbers and remains stable while folding',async({page})=>{
 await page.goto('writing/demo-code-tools/');
 for(const theme of ['light','dark']) {
  await choose(page,'Color theme',theme);
  for(const title of ['scopes.luau','gutter.luau']) {
   const frame=page.locator('[data-code-tools]').filter({has:page.locator('figcaption',{hasText:title})}).first();
   await expect(frame).toBeVisible();
   await frame.locator('pre').evaluate(el=>el.scrollLeft=0);
   const geometry=await frame.locator('.ec-line').evaluateAll(lines=>lines.slice(0,15).map(el=>{
    const ln=el.querySelector('.ln')!,code=el.querySelector('.code')!,range=document.createRange();range.selectNodeContents(ln);const box=range.getBoundingClientRect();
    const style=getComputedStyle(code);return {right:box.right,gap:code.getBoundingClientRect().left+parseFloat(style.paddingLeft)+parseFloat(style.textIndent)-box.right,align:getComputedStyle(ln).textAlign,height:el.getBoundingClientRect().height};
   }));
   expect(Math.max(...geometry.map(g=>g.right))-Math.min(...geometry.map(g=>g.right))).toBeLessThan(.5);
   geometry.forEach(g=>{expect(g.align).toBe('right');expect(g.gap).toBeLessThanOrEqual(28);expect(g.gap).toBeGreaterThan(18);expect(g.height).toBeCloseTo(22,0);});
   const before=await frame.locator('.code').first().boundingBox();const fold=frame.locator('.scope-toggle').first();await fold.click();await fold.click();const after=await frame.locator('.code').first().boundingBox();expect(after!.x).toBe(before!.x);
   if(title==='gutter.luau'){expect(await frame.locator('.ln').allTextContents()).toEqual(['98','99','100','101','102']);const pre=frame.locator('pre');await pre.evaluate(el=>el.scrollLeft=el.scrollWidth);expect(await pre.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);}
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
