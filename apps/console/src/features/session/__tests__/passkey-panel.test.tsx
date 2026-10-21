import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { db } from '@/mocks/db';
import { server } from '@/mocks/server';
import { path } from '@/mocks/utils';
import { renderWithProviders } from '@/test-utils';

import { PasskeyPanel } from '../components/passkey-panel';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

afterEach(() => replace.mockReset());

describe('PasskeyPanel (decision D17)', () => {
  it('verifies and returns to the requested page', async () => {
    renderWithProviders(<PasskeyPanel returnTo="/tenants" />);
    await userEvent.click(await screen.findByRole('button', { name: 'ยืนยันด้วย Passkey' }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/tenants'));
  });

  it('first time: requires a bootstrap code before registering', async () => {
    db.passkey.registered = false;
    renderWithProviders(<PasskeyPanel returnTo="/" />);
    await userEvent.click(await screen.findByRole('button', { name: 'ลงทะเบียน Passkey' }));
    expect(await screen.findByText('กรอก bootstrap code')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Bootstrap code'), 'WRONG-CODE');
    await userEvent.click(screen.getByRole('button', { name: 'ลงทะเบียน Passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'bootstrap code ไม่ถูกต้องหรือถูกใช้ไปแล้ว',
    );

    await userEvent.clear(screen.getByLabelText('Bootstrap code'));
    await userEvent.type(screen.getByLabelText('Bootstrap code'), 'MOCK-BOOTSTRAP');
    await userEvent.click(screen.getByRole('button', { name: 'ลงทะเบียน Passkey' }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });

  it('shows attempts left after a failure, then the lock after 3', async () => {
    server.use(
      http.post(path('/auth/passkey/verify'), async () => {
        db.passkey.failures += 1;
        if (db.passkey.failures >= 3) {
          db.passkey.lockedUntil = new Date(Date.now() + 15 * 60_000).toISOString();
          return HttpResponse.json(
            { type: 'about:blank', title: 'locked', status: 423 },
            { status: 423 },
          );
        }
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'bad',
            status: 401,
            attemptsRemaining: 3 - db.passkey.failures,
          },
          { status: 401 },
        );
      }),
    );
    renderWithProviders(<PasskeyPanel returnTo="/" />);
    const button = await screen.findByRole('button', { name: 'ยืนยันด้วย Passkey' });
    await userEvent.click(button);
    expect(
      await screen.findByText('ยืนยันไม่สำเร็จ เหลืออีก 2 ครั้งก่อนถูกล็อก'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันด้วย Passkey' }));
    await userEvent.click(await screen.findByRole('button', { name: 'ยืนยันด้วย Passkey' }));
    expect(await screen.findByRole('heading', { name: 'ล็อกชั่วคราว' })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
