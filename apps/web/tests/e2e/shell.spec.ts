import { expect, test } from '@playwright/test';

import { expectNoA11yViolations } from './a11y';

test('sign-in page is accessible and leads to the demo tenant in mock mode', async ({ page }) => {
  await page.goto('/sign-in?invite=mock-invite-token-smartvend-0001');
  await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  await expect(page.getByText('สมาร์ทเวนด์')).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByRole('link', { name: 'เข้าสู่ระบบด้วย LINE' }).click();
  await expect(page).toHaveURL(/\/smartvend$/);
});

test('sign-in never reveals a company without a valid invitation (decision D15)', async ({
  page,
}) => {
  await page.goto('/sign-in?tenant=smartvend&invite=not-a-valid-invitation-token-xx');
  await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('สมาร์ทเวนด์')).toHaveCount(0);
  await expect(page.getByText('เปลี่ยนบริษัท')).toHaveCount(0);
});

test('account menu: profile, sign out, sign out everywhere; no notification bell', async ({
  page,
}) => {
  await page.goto('/smartvend');
  await expect(page.getByRole('button', { name: /การแจ้งเตือน/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'บัญชีของฉัน: นภา วงศ์ดี' }).click();
  const menu = page.getByRole('menu');
  await expect(menu.getByText('napa@smartvend.example')).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'ออกจากระบบทุกอุปกรณ์' })).toBeVisible();
  await menu.getByRole('menuitem', { name: 'ออกจากระบบ', exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
});

test('dashboard shell: every menu item opens a page (none 404)', async ({ page }) => {
  await page.goto('/smartvend');
  const nav = page.getByRole('navigation', { name: 'เมนูหลัก' });
  await expect(nav.getByRole('link', { name: 'ภาพรวม' })).toHaveAttribute('aria-current', 'page');
  await expectNoA11yViolations(page);

  for (const label of [
    'เครื่อง / อุปกรณ์',
    'ฐานความรู้',
    'LINE OA',
    'รายงาน',
    'ทีมงานและสิทธิ์',
    'ตั้งค่า',
  ]) {
    await nav.getByRole('link', { name: label }).click();
    await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await expect(page.getByRole('tab', { name: 'ข้อมูลบริษัท' })).toBeVisible();
  await expect(page.getByText('เร็ว ๆ นี้')).toBeVisible();
});

test('unknown tenant shows a not-a-member state, not another company data', async ({ page }) => {
  await page.goto('/someone-else');
  await expect(page.getByRole('status', { name: 'ไม่พบบริษัทนี้ในบัญชีของคุณ' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'เมนูหลัก' })).toHaveCount(0);
});
