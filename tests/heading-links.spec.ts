import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local heading fixture'));
test('heading permalink icon is small, centered, and retains a usable target',async({page},info)=>{
 for(const theme of ['light','dark']) {
  await page.goto('projects/demo-sectioned/loose/root-sibling/');await choose(page,'Color theme',theme);
  const heading=page.getByRole('heading',{name:'Folder compatibility',exact:true});const wrapper=heading.locator('..'),link=wrapper.locator('.sl-anchor-link'),icon=link.locator('svg');
  await heading.hover();await link.focus();await expect(link).toBeFocused();await expect(icon).toHaveCSS('width','16px');await expect(icon).toHaveCSS('height','16px');
  const geometry=await wrapper.evaluate(el=>{const heading=el.querySelector('h2')!,range=document.createRange();range.selectNodeContents(heading);const text=range.getBoundingClientRect(),icon=el.querySelector('svg')!.getBoundingClientRect(),target=getComputedStyle(el.querySelector('.sl-anchor-link')!,'::after');return{difference:Math.abs(text.y+text.height/2-icon.y-icon.height/2),width:target.width,height:target.height};});
  expect(geometry.difference).toBeLessThan(4);expect(geometry.width).toBe('44px');expect(geometry.height).toBe('44px');
  await page.screenshot({path:`test-results/heading-link-${info.project.name}-${theme}.png`});
  await page.keyboard.press('Enter');await expect(page).toHaveURL(/#folder-compatibility$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
