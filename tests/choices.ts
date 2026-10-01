import { type Page } from '@playwright/test';
export async function choose(page: Page, label: string, value: string) {
  const trigger = page.getByRole('button', { name: label, exact: true }).first();
  await trigger.click();
  const panel = page.getByRole('listbox', { name: label, exact: true });
  await panel.locator(`[role="option"][data-value="${value}"]`).click();
}
