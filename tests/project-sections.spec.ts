import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local section fixtures'));
test('optional sections coexist with ordered root pages and real nested page links',async({page},info)=>{
 for(const theme of ['light','dark']) {
  await page.goto('projects/demo-sectioned/');await choose(page,'Color theme',theme);
  const reveal=page.getByRole('button',{name:'Documentation',exact:true});if(await reveal.isVisible())await reveal.click();
  const nav=page.getByRole('navigation',{name:'Documentation',exact:true});
  expect(await nav.locator('.top-level > li').evaluateAll(items=>items.map(item=>item.querySelector(':scope > a, :scope > .tree-branch > .branch-row .branch-label')!.textContent!.trim()))).toEqual(['Overview','Getting started','Guides','Root sibling','Reference','Open examples']);
  await expect(nav.locator('.top-level > li').first().locator('button')).toHaveCount(0);
  await expect(nav).not.toContainText('Empty section must stay absent');await expect(nav).not.toContainText('unpublished section entry');await expect(nav).not.toContainText('hidden navigation entry');
  const guides=nav.getByRole('button',{name:'Toggle Guides section',exact:true});await expect(guides).toHaveAttribute('aria-expanded','false');
  await expect(guides.locator('.branch-label')).toHaveCSS('font-weight','700');await expect(guides.locator('path')).toHaveAttribute('fill','currentColor');
  const icon=(await guides.locator('svg').boundingBox())!,label=(await guides.locator('.branch-label').boundingBox())!;expect(icon.x+icon.width).toBeLessThan(label.x);
  await guides.hover();await expect(guides).toHaveCSS('background-color','rgba(0, 0, 0, 0)');await expect(guides).toHaveCSS('border-top-width','0px');
  await guides.focus();await page.keyboard.press('Space');await expect(guides).toHaveAttribute('aria-expanded','true');await expect(page).toHaveURL(/demo-sectioned\/$/);
  await expect(nav.getByRole('link',{name:'Components',exact:true})).toBeVisible();
  await guides.locator('.branch-label').click();await expect(guides).toHaveAttribute('aria-expanded','false');
  await guides.focus();await page.keyboard.press('Enter');await expect(guides).toHaveAttribute('aria-expanded','true');
  await expect(nav.getByRole('button',{name:'Toggle Open examples section',exact:true})).toHaveAttribute('aria-expanded','true');
  await page.screenshot({path:`test-results/sections-root-${info.project.name}-${theme}.png`});
  await nav.getByRole('link',{name:'Components',exact:true}).click();await expect(page.getByRole('complementary',{name:'Sectioned MDX component',exact:true})).toBeVisible();await expect(page.locator('.katex math')).not.toHaveCount(0);
  await page.goto('projects/demo-sectioned/reference/api/parameters/value/');if(await reveal.isVisible())await reveal.click();
  for(const name of ['Toggle Reference section','Toggle API subpages','Toggle Parameters subpages'])await expect(nav.getByRole('button',{name,exact:true})).toHaveAttribute('aria-expanded','true');
  await expect(nav.getByRole('link',{name:'Value',exact:true})).toHaveAttribute('aria-current','page');
  expect(await nav.locator('a').evaluateAll(links=>links.every(link=>(link as HTMLAnchorElement).pathname.startsWith('/projects/demo-sectioned/')))).toBe(true);
  expect(await page.locator('.pagination-links a').evaluateAll(links=>links.every(link=>(link as HTMLAnchorElement).pathname.startsWith('/projects/demo-sectioned/')))).toBe(true);
  await page.screenshot({path:`test-results/sections-nested-${info.project.name}-${theme}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
