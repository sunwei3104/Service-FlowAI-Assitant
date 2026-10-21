import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { idempotent, path, problem } from '../utils';

export const teamHandlers = [
  http.get(path('/members'), () => HttpResponse.json({ data: db.members })),
  http.patch(path('/members/:userId'), async ({ request, params }) => {
    const m = db.members.find((x) => x.user.id === params.userId);
    if (!m) return problem(404, 'ไม่พบสมาชิก');
    const body = (await request.json()) as { role?: Schemas['TenantRole']; area?: string | null };
    const next: Schemas['Member'] = {
      ...m,
      role: body.role ?? m.role,
      area: body.area === undefined ? m.area : body.area,
    };
    db.members = db.members.map((x) => (x.user.id === m.user.id ? next : x));
    return HttpResponse.json(next);
  }),
  http.delete(path('/members/:userId'), ({ params }) => {
    db.members = db.members.filter((x) => x.user.id !== params.userId);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(path('/invitations'), () => HttpResponse.json({ data: db.invitations })),
  http.post(path('/invitations'), async ({ request }) => {
    const body = (await request.json()) as { role: Schemas['TenantRole']; email?: string };
    const invitation = idempotent(request, () => {
      const created: Schemas['Invitation'] = {
        id: crypto.randomUUID(),
        email: body.email ?? null,
        role: body.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString(),
        link: 'http://localhost:3000/invite/mock-token',
      };
      // The link is shown once on creation and never returned again.
      db.invitations = [...db.invitations, { ...created, link: null }];
      return created;
    });
    return HttpResponse.json(invitation, { status: 201 });
  }),
  http.delete(path('/invitations/:id'), ({ params }) => {
    db.invitations = db.invitations.filter((x) => x.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(path('/tenant/security'), () => HttpResponse.json(db.security)),
  http.put(path('/tenant/security'), async ({ request }) => {
    db.security = (await request.json()) as Schemas['TenantSecurity'];
    return HttpResponse.json(db.security);
  }),

  http.get(path('/support-access/requests'), ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    return HttpResponse.json({
      data: status ? db.supportRequests.filter((r) => r.status === status) : db.supportRequests,
    });
  }),
  ...(['approve', 'deny'] as const).map((decision) =>
    http.post(path(`/support-access/requests/:id/${decision}`), ({ params }) => {
      const r = db.supportRequests.find((x) => x.id === params.id);
      if (!r) return problem(404, 'ไม่พบคำขอ');
      if (r.status !== 'pending') return problem(409, 'คำขอนี้ถูกตัดสินแล้ว');
      const next: Schemas['SupportAccessRequest'] =
        decision === 'approve'
          ? {
              ...r,
              status: 'active',
              expiresAt: new Date(Date.now() + r.durationMinutes * 60_000).toISOString(),
            }
          : { ...r, status: 'denied' };
      db.supportRequests = db.supportRequests.map((x) => (x.id === r.id ? next : x));
      return HttpResponse.json(next);
    }),
  ),
  http.post(path('/support-access/grants/:id/revoke'), ({ params }) => {
    const r = db.supportRequests.find((x) => x.id === params.id);
    if (!r) return problem(404, 'ไม่พบสิทธิ์');
    if (r.status !== 'active') return problem(409, 'สิทธิ์นี้ไม่ได้ใช้งานอยู่');
    const next: Schemas['SupportAccessRequest'] = { ...r, status: 'revoked' };
    db.supportRequests = db.supportRequests.map((x) => (x.id === r.id ? next : x));
    return HttpResponse.json(next);
  }),
];
