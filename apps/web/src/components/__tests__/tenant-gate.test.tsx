import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { db } from '@/mocks/db';
import { server } from '@/mocks/server';
import { path } from '@/mocks/utils';
import { renderWithProviders } from '@/test-utils';

import { useTenant } from '../tenant-context';
import { TenantGate } from '../tenant-gate';

function TenantName() {
  return <p>{useTenant().membership.tenantName}</p>;
}

describe('TenantGate', () => {
  it('renders children for a tenant the user belongs to', async () => {
    renderWithProviders(
      <TenantGate slug="smartvend" fallback={<p>loading</p>}>
        <TenantName />
      </TenantGate>,
    );
    expect(await screen.findByText('บริษัท สมาร์ทเวนด์ จำกัด')).toBeInTheDocument();
  });

  it('blocks a tenant slug that is not in the memberships', async () => {
    renderWithProviders(
      <TenantGate slug="other-company" fallback={<p>loading</p>}>
        <TenantName />
      </TenantGate>,
    );
    expect(
      await screen.findByRole('status', { name: 'ไม่พบบริษัทนี้ในบัญชีของคุณ' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('บริษัท สมาร์ทเวนด์ จำกัด')).not.toBeInTheDocument();
  });

  it('switches the session tenant before rendering when they differ', async () => {
    db.me = { ...db.me, activeTenantId: null };
    let switched = false;
    server.use(
      http.post(path('/me/active-tenant'), async ({ request }) => {
        switched = true;
        const { tenantId } = (await request.json()) as { tenantId: string };
        db.me = { ...db.me, activeTenantId: tenantId };
        return HttpResponse.json(db.me);
      }),
    );
    renderWithProviders(
      <TenantGate slug="smartvend" fallback={<p>loading</p>}>
        <TenantName />
      </TenantGate>,
    );
    expect(await screen.findByText('บริษัท สมาร์ทเวนด์ จำกัด')).toBeInTheDocument();
    expect(switched).toBe(true);
  });

  it('shows an error state with retry when /me fails', async () => {
    server.use(
      http.get(path('/me'), () =>
        HttpResponse.json({ type: 'about:blank', title: 'x', status: 500 }, { status: 500 }),
      ),
    );
    renderWithProviders(
      <TenantGate slug="smartvend" fallback={<p>loading</p>}>
        <TenantName />
      </TenantGate>,
    );
    expect(await screen.findByRole('alert', { name: 'โหลดข้อมูลไม่สำเร็จ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลองอีกครั้ง' })).toBeInTheDocument();
  });
});
