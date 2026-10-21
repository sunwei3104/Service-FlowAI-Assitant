import { expect, test } from '@playwright/test';

import { expectNoA11yViolations } from './a11y';

test('overview (Main.html): alert, KPIs, attention table, panels — accessible', async ({
  page,
}) => {
  await page.goto('/smartvend');
  await expect(page.getByRole('heading', { level: 1, name: 'ภาพรวมวันนี้' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'งานเกินเวลา SLA' })).toBeVisible();
  await expect(page.getByRole('link', { name: /งานใหม่ \(ยังไม่มอบหมาย\)/ })).toBeVisible();
  const table = page.getByRole('table');
  await expect(table.getByRole('link', { name: 'SF-000148' })).toBeVisible();
  await expect(page.getByRole('img', { name: /จำนวน Ticket ต่อวัน/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ความเคลื่อนไหวล่าสุด' })).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByRole('button', { name: '7 วัน' }).click();
  await expect(page.getByRole('button', { name: '7 วัน' })).toHaveAttribute('aria-pressed', 'true');
});
