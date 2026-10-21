import { expect, test } from '@playwright/test';

import { expectNoA11yViolations } from './a11y';

test('technician bottom nav works on a phone', async ({ page }) => {
  await page.goto('/smartvend/jobs');
  const nav = page.getByRole('navigation', { name: 'เมนูช่าง' });
  await expect(nav.getByRole('link', { name: 'งานของฉัน' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expectNoA11yViolations(page);

  for (const label of ['สแกน QR เครื่อง', 'ประวัติ', 'บัญชี']) {
    await nav.getByRole('link', { name: label }).click();
    await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByText('เร็ว ๆ นี้')).toBeVisible();
  }
});
