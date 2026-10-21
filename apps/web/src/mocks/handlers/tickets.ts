import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { users } from '../fixtures/people';
import { uuid } from '../fixtures/time';
import { idempotent, ifMatchVersion, paginate, path, problem } from '../utils';

const OPEN: Schemas['TicketStatus'][] = ['new', 'assigned', 'in_progress', 'waiting'];

function matchesView(t: Schemas['Ticket'], view: string | null) {
  switch (view) {
    case 'unassigned':
      return t.assignee === null && OPEN.includes(t.status);
    case 'sla_breached':
      return t.sla.state === 'breached';
    case 'waiting':
      return t.status === 'waiting';
    case 'closed':
      return t.status === 'resolved';
    case 'open':
    case null:
      return OPEN.includes(t.status);
    default:
      return true;
  }
}

function findTicket(id: string) {
  return db.tickets.find((t) => t.id === id);
}

function save(ticket: Schemas['Ticket']) {
  const next = { ...ticket, version: ticket.version + 1, updatedAt: new Date().toISOString() };
  db.tickets = db.tickets.map((t) => (t.id === next.id ? next : t));
  return next;
}

function withEtag(ticket: Schemas['Ticket'], status = 200) {
  return HttpResponse.json(ticket, { status, headers: { ETag: `"${ticket.version}"` } });
}

/** Optimistic locking (plan §7.2): missing If-Match → 428-like 400, stale → 412. */
function checkVersion(request: Request, ticket: Schemas['Ticket']) {
  const version = ifMatchVersion(request);
  if (version === null) return problem(400, 'ต้องส่ง If-Match');
  if (version !== ticket.version)
    return problem(412, 'มีคนแก้ไขงานนี้ก่อนหน้า', 'โหลดข้อมูลล่าสุดแล้วลองอีกครั้ง');
  return null;
}

export const ticketHandlers = [
  http.get(path('/tickets'), ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim().toLowerCase();
    const status = url.searchParams.get('status')?.split(',');
    const priority = url.searchParams.get('priority')?.split(',');
    const assignee = url.searchParams.get('assignee');
    const sla = url.searchParams.get('sla');
    const view = url.searchParams.get('view');

    let items = db.tickets.filter((t) =>
      status ? status.includes(t.status) : matchesView(t, view),
    );
    if (priority) items = items.filter((t) => priority.includes(t.priority));
    if (sla) items = items.filter((t) => t.sla.state === sla);
    if (assignee === 'none') items = items.filter((t) => t.assignee === null);
    else if (assignee === 'me') items = items.filter((t) => t.assignee?.id === db.me.user.id);
    else if (assignee) items = items.filter((t) => t.assignee?.id === assignee);
    if (q) {
      items = items.filter((t) =>
        [t.number, t.title, t.asset?.code, t.customerName].some((v) =>
          v?.toLowerCase().includes(q),
        ),
      );
    }
    return HttpResponse.json(paginate(items, url));
  }),

  http.get(path('/tickets/counts'), () =>
    HttpResponse.json<Schemas['TicketCounts']>({
      open: db.tickets.filter((t) => matchesView(t, 'open')).length,
      unassigned: db.tickets.filter((t) => matchesView(t, 'unassigned')).length,
      slaBreached: db.tickets.filter((t) => matchesView(t, 'sla_breached')).length,
      waiting: db.tickets.filter((t) => matchesView(t, 'waiting')).length,
      closed: db.tickets.filter((t) => matchesView(t, 'closed')).length,
      receivedThisMonth: db.tickets.length,
    }),
  ),

  http.get(path('/tickets/export'), () => {
    const header = 'number,title,status,priority,assignee';
    const lines = db.tickets.map((t) =>
      [t.number, t.title, t.status, t.priority, t.assignee?.displayName ?? ''].join(','),
    );
    return new HttpResponse([header, ...lines].join('\n'), {
      headers: { 'Content-Type': 'text/csv' },
    });
  }),

  http.post(path('/tickets'), async ({ request }) => {
    const body = (await request.json()) as Schemas['CreateTicketRequest'];
    const created = idempotent(request, () => {
      const n = Math.max(...db.tickets.map((t) => Number(t.number.slice(3)))) + 1;
      const now = new Date().toISOString();
      const ticket: Schemas['Ticket'] = {
        id: uuid('ticket', n),
        number: `SF-${String(n).padStart(6, '0')}`,
        title: body.title,
        status: 'new',
        waitingReason: null,
        priority: body.priority ?? 'normal',
        category: db.categories.find((c) => c.id === body.categoryId) ?? null,
        asset: null,
        assignee: null,
        customerName: null,
        source: 'web',
        sla: { dueAt: null, pausedAt: null, state: 'on_track' },
        aiSummary: null,
        distanceKm: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        description: body.description ?? null,
        customer: null,
        acceptedAt: null,
        resolvedAt: null,
        requirePhotoOnResolve: false,
        assetLocation: null,
        relatedOpenTickets: [],
      };
      db.tickets = [ticket, ...db.tickets];
      return ticket;
    });
    return withEtag(created, 201);
  }),

  http.post(path('/tickets/bulk-assign'), async ({ request }) => {
    const { ticketIds, assigneeId } = (await request.json()) as {
      ticketIds: string[];
      assigneeId: string;
    };
    const assignee = Object.values(users).find((u) => u.id === assigneeId);
    if (!assignee)
      return problem(422, 'ไม่พบช่าง', undefined, [{ field: 'assigneeId', message: 'ไม่พบช่าง' }]);
    const results = ticketIds.map((id) => {
      const t = findTicket(id);
      if (!t) return { ticketId: id, ok: false };
      save({ ...t, assignee, status: t.status === 'new' ? 'assigned' : t.status });
      return { ticketId: id, ok: true };
    });
    return HttpResponse.json({ results });
  }),

  http.get(path('/tickets/:id'), ({ params }) => {
    const t = findTicket(String(params.id));
    return t ? withEtag(t) : problem(404, 'ไม่พบ Ticket');
  }),

  http.patch(path('/tickets/:id'), async ({ request, params }) => {
    const t = findTicket(String(params.id));
    if (!t) return problem(404, 'ไม่พบ Ticket');
    const conflict = checkVersion(request, t);
    if (conflict) return conflict;
    const body = (await request.json()) as Schemas['UpdateTicketRequest'];
    return withEtag(save({ ...t, ...body, category: t.category }));
  }),

  http.post(path('/tickets/:id/transitions'), async ({ request, params }) => {
    const t = findTicket(String(params.id));
    if (!t) return problem(404, 'ไม่พบ Ticket');
    const conflict = checkVersion(request, t);
    if (conflict) return conflict;
    const body = (await request.json()) as Schemas['TransitionRequest'];
    if (body.to === t.status) return problem(409, 'งานอยู่ในสถานะนี้แล้ว');
    if (body.to === 'waiting' && !body.waitingReason) {
      return problem(422, 'ต้องระบุเหตุผลที่รอ', undefined, [
        { field: 'waitingReason', message: 'เลือกรอลูกค้าหรือรออะไหล่' },
      ]);
    }
    if (body.to === 'resolved' && t.requirePhotoOnResolve && !db.attachmentsByTicket.get(t.id)) {
      return problem(422, 'ต้องแนบรูปหลังซ่อมก่อนปิดงาน', undefined, [
        { field: 'photo', message: 'แนบรูปอย่างน้อย 1 รูป' },
      ]);
    }
    const next = idempotent(request, () =>
      save({
        ...t,
        status: body.to,
        waitingReason: body.to === 'waiting' ? (body.waitingReason ?? null) : null,
        resolvedAt: body.to === 'resolved' ? new Date().toISOString() : null,
      }),
    );
    return withEtag(next);
  }),

  http.post(path('/tickets/:id/assign'), async ({ request, params }) => {
    const t = findTicket(String(params.id));
    if (!t) return problem(404, 'ไม่พบ Ticket');
    const conflict = checkVersion(request, t);
    if (conflict) return conflict;
    const { assigneeId } = (await request.json()) as { assigneeId: string };
    const assignee = Object.values(users).find((u) => u.id === assigneeId);
    if (!assignee)
      return problem(422, 'ไม่พบช่าง', undefined, [{ field: 'assigneeId', message: 'ไม่พบช่าง' }]);
    return withEtag(
      idempotent(request, () =>
        save({ ...t, assignee, status: t.status === 'new' ? 'assigned' : t.status }),
      ),
    );
  }),

  http.get(path('/tickets/:id/assignee-suggestions'), () =>
    HttpResponse.json({
      data: [
        { user: users.somchai, openTickets: 1, reason: 'ใกล้สุด · มีงานที่เครื่องนี้' },
        { user: users.wichai, openTickets: 2, reason: null },
        { user: users.anan, openTickets: 2, reason: null },
      ] satisfies Schemas['AssigneeSuggestion'][],
    }),
  ),

  http.get(path('/tickets/:id/events'), ({ params, request }) => {
    const t = findTicket(String(params.id));
    if (!t) return problem(404, 'ไม่พบ Ticket');
    const events: Schemas['TicketEvent'][] = [
      {
        id: uuid('event', 1),
        type: 'message_in',
        actorType: 'customer',
        actor: null,
        body: t.title,
        attachments: [],
        createdAt: t.createdAt,
      },
    ];
    return HttpResponse.json(paginate(events, new URL(request.url)));
  }),

  http.post(path('/tickets/:id/events'), async ({ request }) => {
    const { body } = (await request.json()) as { body: string };
    const event: Schemas['TicketEvent'] = {
      id: crypto.randomUUID(),
      type: 'note',
      actorType: 'user',
      actor: db.me.user,
      body,
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(
      idempotent(request, () => event),
      { status: 201 },
    );
  }),

  http.post(path('/tickets/:id/messages'), async ({ request }) => {
    const { body } = (await request.json()) as { body: string };
    const event: Schemas['TicketEvent'] = {
      id: crypto.randomUUID(),
      type: 'message_out',
      actorType: 'user',
      actor: db.me.user,
      body,
      attachments: [],
      deliveryStatus: 'queued',
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(
      idempotent(request, () => event),
      { status: 202 },
    );
  }),

  http.post(path('/tickets/:id/reply-suggestions'), () =>
    HttpResponse.json({
      data: [
        {
          id: uuid('misc', 1),
          body: 'ขออภัยในความไม่สะดวกค่ะ ทีมช่างกำลังเดินทางไปตรวจเครื่อง และจะคืนเงินส่วนต่างให้หลังตรวจสอบ',
          confidence: 0.86,
          sources: [{ documentId: uuid('doc', 1), title: 'วิธีรีเซ็ตเครื่อง', excerpt: null }],
        },
      ] satisfies Schemas['AiSuggestion'][],
    }),
  ),

  http.post(path('/tickets/:id/attachments'), ({ params }) => {
    const id = String(params.id);
    db.attachmentsByTicket.set(id, (db.attachmentsByTicket.get(id) ?? 0) + 1);
    return HttpResponse.json<Schemas['UploadTarget']>(
      {
        uploadUrl: `${new URL('/mock-upload', 'http://localhost').toString()}/${crypto.randomUUID()}`,
        method: 'PUT',
        headers: {},
        expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
        objectKey: `tickets/${id}/${crypto.randomUUID()}`,
      },
      { status: 201 },
    );
  }),

  http.post(path('/tickets/:id/claim'), ({ request, params }) => {
    const t = findTicket(String(params.id));
    if (!t) return problem(404, 'ไม่พบ Ticket');
    if (t.assignee && t.assignee.id !== db.me.user.id) return problem(409, 'มีช่างรับงานนี้แล้ว');
    return withEtag(
      idempotent(request, () =>
        save({
          ...t,
          assignee: db.me.user,
          status: 'in_progress',
          acceptedAt: new Date().toISOString(),
        }),
      ),
    );
  }),

  http.post(path('/tickets/:id/release'), ({ request, params }) => {
    const t = findTicket(String(params.id));
    if (!t) return problem(404, 'ไม่พบ Ticket');
    return withEtag(idempotent(request, () => save({ ...t, assignee: null, status: 'new' })));
  }),

  http.get(path('/tickets/:id/checklist'), () =>
    HttpResponse.json<Schemas['Checklist']>({
      sourceDocument: {
        documentId: uuid('doc', 2),
        title: 'คู่มือแก้สินค้าติดช่อง',
        excerpt: null,
      },
      items: [
        { id: uuid('misc', 11), label: 'เปิดตู้ ตรวจช่อง 12', done: true },
        { id: uuid('misc', 12), label: 'นำสินค้าที่ติดออก คืนให้ลูกค้า', done: false },
        { id: uuid('misc', 13), label: 'ทดสอบหมุนสปริงช่อง 12 สามรอบ', done: false },
      ],
    }),
  ),

  http.patch(path('/tickets/:id/checklist'), async ({ request }) => {
    const { items } = (await request.json()) as { items: { id: string; done: boolean }[] };
    const labels: Record<string, string> = {
      [uuid('misc', 11)]: 'เปิดตู้ ตรวจช่อง 12',
      [uuid('misc', 12)]: 'นำสินค้าที่ติดออก คืนให้ลูกค้า',
      [uuid('misc', 13)]: 'ทดสอบหมุนสปริงช่อง 12 สามรอบ',
    };
    return HttpResponse.json<Schemas['Checklist']>({
      sourceDocument: {
        documentId: uuid('doc', 2),
        title: 'คู่มือแก้สินค้าติดช่อง',
        excerpt: null,
      },
      items: items.map((i) => ({ ...i, label: labels[i.id] ?? '' })),
    });
  }),
];
