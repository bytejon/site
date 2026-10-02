import { type Page } from '@playwright/test';
export async function choose(page: Page, label: string, value: string) {
  if (label === 'Type' || label === 'Topic') {
    const toggle = page.getByRole('button', { name: 'Filters', exact: true });
    if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
    const options = page.locator(`input[name="filter-${label.toLowerCase()}"]`);
    for (const option of await options.all()) {
      if (await option.getAttribute('value') === value) { await option.check(); return; }
    }
    throw new Error('Missing filter choice');
  }
  const trigger = page.getByRole('button', { name: label, exact: true }).first();
  await trigger.click();
  const panel = page.getByRole('listbox', { name: label, exact: true });
  await panel.locator(`[role="option"][data-value="${value}"]`).click();
}
