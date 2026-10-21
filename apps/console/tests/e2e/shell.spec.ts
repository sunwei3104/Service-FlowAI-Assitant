import { expect, test } from '@playwright/test';

import { expectNoA11yViolations } from './a11y';

test('console shell: every menu item opens a page (none 404)', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'เมนูคอนโซล' });
  await expect(nav.getByRole('link', { name: 'ภาพรวมแพลตฟอร์ม' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByText('Production · สิงคโปร์')).toBeVisible();
  await expectNoA11yViolations(page);

  for (const label of [
    'บริษัทลูกค้า',
    'สุขภาพระบบ',
    'AI และต้นทุน',
    'การเข้าช่วยเหลือ',
    'Audit log',
  ]) {
    await nav.getByRole('link', { name: new RegExp(`^${label}`) }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('passkey page (decision D17) is accessible', async ({ page }) => {
  await page.goto('/passkey');
  await expect(page.getByRole('heading', { name: 'ยืนยันด้วย Passkey' })).toBeVisible();
  await expectNoA11yViolations(page);
  await page.getByRole('button', { name: 'ยืนยันด้วย Passkey' }).click();
  await expect(page).toHaveURL(/\/$/);
});
