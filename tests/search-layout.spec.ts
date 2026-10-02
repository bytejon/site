import { test, expect } from '@playwright/test';
import { choose } from './choices';
test('expanded search separates icon, input, clear, and cancel on custom and docs layouts', async ({page}, info) => {
  for (const theme of ['light','dark']) for (const path of ['', 'articles/', ...(process.env.TEST_DEMOS==='true' ? ['projects/demo-project/'] : [])]) {
    await page.goto(path); await choose(page,'Color theme',theme);
    const open=page.locator('header button[data-open-modal]'); await open.click();
    const dialog=page.getByRole('dialog',{name:'Search',exact:true});const input=page.locator('.pagefind-ui__search-input');
    await expect(input).toBeFocused();await expect(page.locator('.dialog-frame')).toHaveCSS('display','flex');
    const cancel=page.locator('button[data-close-modal]');
    const bounds=(await input.boundingBox())!;
    const icon=await input.evaluate(el=>{const c=getComputedStyle(el);const p=getComputedStyle(el.closest('form')!,'::before');return{padding:parseFloat(c.paddingLeft),end:parseFloat(p.left)+parseFloat(p.width)};});
    expect(icon.padding-icon.end).toBeGreaterThanOrEqual(8);
    const placeholder=await input.evaluate(el=>({opacity:getComputedStyle(el,'::placeholder').opacity})); expect(placeholder.opacity).toBe('1');
    if(page.viewportSize()!.width<800) {await expect(cancel).toBeVisible();const c=(await cancel.boundingBox())!;expect(c.x-bounds.x-bounds.width).toBeGreaterThanOrEqual(8);expect(c.height).toBeGreaterThanOrEqual(44);}
    else await expect(cancel).toBeHidden();
    await page.screenshot({path:`test-results/search-empty-${path.replaceAll('/','-')||'home'}-${info.project.name}-${theme}.png`});
    await input.fill('About');await expect(page.locator('.pagefind-ui__result-link[href$="/about/"]').first()).toBeVisible();
    const clear=page.locator('.pagefind-ui__search-clear');await expect(clear).toBeVisible();
    const c=(await clear.boundingBox())!;expect(c.width).toBeGreaterThanOrEqual(44);expect(c.height).toBeGreaterThanOrEqual(44);expect(c.x).toBeGreaterThan(bounds.x+bounds.width/2);expect(c.x+c.width).toBeLessThanOrEqual(bounds.x+bounds.width+1);
    await page.screenshot({path:`test-results/search-results-${path.replaceAll('/','-')||'home'}-${info.project.name}-${theme}.png`});
    await clear.click();await expect(input).toHaveValue('');await expect(input).toBeFocused();
    await input.fill('qzxvnoresultqzxv');await expect(page.locator('.pagefind-ui__message')).toContainText(/no results/i);
    expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await page.keyboard.press('Escape');await expect(open).toBeFocused();
    await page.keyboard.press('Control+k');await expect(input).toBeFocused();
    if(await cancel.isVisible()) {await cancel.focus();await page.keyboard.press('Enter');} else await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();await expect(open).toBeFocused();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('delayed search results retain a usable loading layout', async ({page},info) => {
  for(const theme of ['light','dark']) {
    await page.route('**/pagefind/*.pf_meta',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});
    await page.goto('/');await choose(page,'Color theme',theme);await page.locator('header button[data-open-modal]').click();
    const input=page.locator('.pagefind-ui__search-input');await input.fill('About');
    await expect(page.locator('.pagefind-ui__message')).toContainText(/searching/i);
    await page.screenshot({path:`test-results/search-loading-${info.project.name}-${theme}.png`});
    await expect(page.locator('.pagefind-ui__result-link[href$="/about/"]').first()).toBeVisible();
    expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await page.keyboard.press('Escape');await page.unrouteAll({behavior:'wait'});
  }
});
