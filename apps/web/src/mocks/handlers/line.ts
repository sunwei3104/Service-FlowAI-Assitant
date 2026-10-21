import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { idempotent, path, problem } from '../utils';

const categoryDetail = (c: { id: string; name: string }): Schemas['ProblemCategory'] => ({
  id: c.id,
  name: c.name,
  keywords: [],
  defaultPriority: 'normal',
  ackSlaMinutes: 30,
  resolveSlaMinutes: 240,
  requiredFields: ['asset_code'],
  requirePhotoOnResolve: c.name === 'สินค้า',
});

export const lineHandlers = [
  http.get(path('/line/channel'), () => HttpResponse.json(db.lineChannel)),
  http.put(path('/line/channel'), async ({ request }) => {
    const body = (await request.json()) as Schemas['LineChannelInput'];
    db.lineChannel = { ...db.lineChannel, channelId: body.channelId };
    return HttpResponse.json(db.lineChannel);
  }),
  http.post(path('/line/channel/verify'), () => {
    const checkedAt = new Date().toISOString();
    db.lineChannel = { ...db.lineChannel, lastVerifiedAt: checkedAt };
    return HttpResponse.json<Schemas['LineVerifyResult']>({ ok: true, checkedAt, errorCode: null });
  }),

  http.get(path('/line/settings'), () => HttpResponse.json(db.lineSettings)),
  http.put(path('/line/settings'), async ({ request }) => {
    db.lineSettings = (await request.json()) as Schemas['LineSettings'];
    return HttpResponse.json(db.lineSettings);
  }),

  http.get(path('/problem-categories'), () =>
    HttpResponse.json({ data: db.categories.map(categoryDetail) }),
  ),
  http.post(path('/problem-categories'), async ({ request }) => {
    const body = (await request.json()) as Schemas['ProblemCategoryInput'];
    const created = idempotent(request, () => {
      const c = { id: crypto.randomUUID(), name: body.name };
      db.categories = [...db.categories, c];
      return { ...body, id: c.id };
    });
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch(path('/problem-categories/:id'), async ({ request, params }) => {
    const c = db.categories.find((x) => x.id === params.id);
    if (!c) return problem(404, 'ไม่พบประเภทปัญหา');
    const body = (await request.json()) as Schemas['ProblemCategoryInput'];
    db.categories = db.categories.map((x) => (x.id === c.id ? { ...x, name: body.name } : x));
    return HttpResponse.json({ ...body, id: c.id });
  }),
  http.delete(path('/problem-categories/:id'), ({ params }) => {
    db.categories = db.categories.filter((x) => x.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
