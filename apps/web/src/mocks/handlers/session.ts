import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { MOCK_INVITE_TOKEN } from '../fixtures/people';
import { path, problem } from '../utils';

export const sessionHandlers = [
  http.get(path('/me'), () => HttpResponse.json<Schemas['Me']>(db.me)),

  http.post(path('/me/active-tenant'), async ({ request }) => {
    const { tenantId } = (await request.json()) as { tenantId: string };
    if (!db.me.memberships.some((m) => m.tenantId === tenantId)) {
      return problem(404, 'ไม่พบบริษัท');
    }
    db.me = { ...db.me, activeTenantId: tenantId };
    return HttpResponse.json<Schemas['Me']>(db.me);
  }),

  http.put(path('/me/availability'), async ({ request }) => {
    const { available } = (await request.json()) as { available: boolean };
    db.me = { ...db.me, user: { ...db.me.user, available } };
    return HttpResponse.json({ available });
  }),

  // Only a valid invitation token reveals the company name (decision D15).
  http.post(path('/invitation-preview'), async ({ request }) => {
    const { token } = (await request.json()) as { token: string };
    if (token !== MOCK_INVITE_TOKEN) return problem(404, 'Not found');
    return HttpResponse.json({
      tenantName: 'สมาร์ทเวนด์',
      role: 'agent' as const,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString(),
    });
  }),

  http.post(path('/auth/logout'), () => new HttpResponse(null, { status: 204 })),
];
