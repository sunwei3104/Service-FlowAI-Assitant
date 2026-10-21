import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { minutesAgo, uuid } from '../fixtures/time';
import { idempotent, paginate, path, problem } from '../utils';

export const knowledgeHandlers = [
  http.get(path('/knowledge/documents'), ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase();
    const items = q ? db.documents.filter((d) => d.title.toLowerCase().includes(q)) : db.documents;
    return HttpResponse.json(paginate(items, url));
  }),

  http.post(path('/knowledge/documents'), async ({ request }) => {
    const body = (await request.json()) as Schemas['CreateKnowledgeDocumentRequest'];
    const document = idempotent(request, () => {
      const created: Schemas['KnowledgeDocument'] = {
        id: crypto.randomUUID(),
        kind: body.kind,
        title: body.kind === 'faq' ? body.question : body.title,
        category: body.category ?? null,
        status: body.kind === 'manual' ? 'processing' : 'published',
        audience: body.audience ?? (body.kind === 'faq' ? 'customers' : 'internal'),
        timesUsed: 0,
        helpfulRate: null,
        updatedAt: new Date().toISOString(),
      };
      db.documents = [created, ...db.documents];
      return created;
    });
    return HttpResponse.json({ document }, { status: 201 });
  }),

  http.delete(path('/knowledge/documents/:id'), ({ params }) => {
    db.documents = db.documents.filter((d) => d.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(path('/knowledge/search'), async ({ request }) => {
    const { query } = (await request.json()) as { query: string };
    if (!query.trim()) return problem(422, 'กรุณาพิมพ์คำถาม');
    const hit = db.documents.find((d) => query.includes('รีเซ็ต') && d.title.includes('รีเซ็ต'));
    return HttpResponse.json<Schemas['KnowledgeAnswer']>(
      hit
        ? {
            grounded: true,
            answer: 'กดปุ่มรีเซ็ตด้านหลังตู้ค้างไว้ 5 วินาที แล้วรอไฟสีเขียว',
            confidence: 0.88,
            sources: [{ documentId: hit.id, title: hit.title, excerpt: null }],
          }
        : { grounded: false, answer: null, confidence: 0.32, sources: [] },
    );
  }),

  http.get(path('/knowledge/gaps'), () =>
    HttpResponse.json({
      totalCount: 23,
      data: [
        {
          id: uuid('misc', 201),
          question: 'เครื่องกินเหรียญ 10 บาท ทำยังไง',
          count: 6,
          lastAskedAt: minutesAgo(30),
        },
        {
          id: uuid('misc', 202),
          question: 'ขอใบเสร็จได้ไหม',
          count: 4,
          lastAskedAt: minutesAgo(120),
        },
      ] satisfies Schemas['KnowledgeGap'][],
    }),
  ),

  http.get(path('/ai/settings'), () => HttpResponse.json(db.aiSettings)),
  http.put(path('/ai/settings'), async ({ request }) => {
    db.aiSettings = (await request.json()) as Schemas['AiSettings'];
    return HttpResponse.json(db.aiSettings);
  }),
];
