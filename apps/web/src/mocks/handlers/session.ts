import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { TENANT } from '../fixtures/people';
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

  http.get(path('/workspaces/:slug/public'), ({ params }) =>
    params.slug === TENANT.slug
      ? HttpResponse.json({ slug: TENANT.slug, displayName: 'สมาร์ทเวนด์' })
      : problem(404, 'ไม่พบพื้นที่ทำงาน'),
  ),

  http.post(path('/auth/logout'), () => new HttpResponse(null, { status: 204 })),
];
