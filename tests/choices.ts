import { type Page } from '@playwright/test';
export async function choose(page: Page, label: string, value: string) {
  if (label === 'Tags') {
    const toggle = page.getByRole('button', { name: 'Filters', exact: true });
    if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
    const group = page.getByRole('group', {name:'Tags',exact:true});
    await group.locator('.filter-choice[data-value=""]').click();
    if (value) {
      for (const option of await group.locator('.filter-choice').all()) {
        if (await option.getAttribute('data-value') === value) { await option.click(); return; }
      }
      throw new Error('Missing filter choice');
    }
    return;
  }
  const trigger = page.getByRole('button', { name: label, exact: true }).first();
  await trigger.click();
  const panel = page.getByRole('listbox', { name: label, exact: true });
  await panel.locator(`[role="option"][data-value="${value}"]`).click();
}
