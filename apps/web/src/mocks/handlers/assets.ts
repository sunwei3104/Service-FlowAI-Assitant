import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { uuid } from '../fixtures/time';
import { idempotent, paginate, path, problem } from '../utils';

export const assetHandlers = [
  http.get(path('/assets'), ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase();
    const condition = url.searchParams.get('condition');
    let items = db.assets.filter((a) => a.active);
    if (q)
      items = items.filter(
        (a) => a.code.toLowerCase().includes(q) || a.branch.toLowerCase().includes(q),
      );
    if (condition) items = items.filter((a) => a.condition === condition);
    return HttpResponse.json(paginate(items, url));
  }),

  http.post(path('/assets'), async ({ request }) => {
    const body = (await request.json()) as Schemas['AssetInput'];
    if (db.assets.some((a) => a.code === body.code)) {
      return problem(409, 'รหัสเครื่องซ้ำ', undefined, [
        { field: 'code', message: `มีรหัส ${body.code} แล้ว` },
      ]);
    }
    const asset = idempotent(request, () => {
      const created: Schemas['Asset'] = {
        id: crypto.randomUUID(),
        code: body.code,
        branch: body.branch,
        locationDetail: body.locationDetail ?? null,
        model: body.model ?? null,
        condition: 'operational',
        openTickets: 0,
        tickets30d: 0,
        installedAt: body.installedAt ?? null,
        note: body.note ?? null,
        active: true,
        location: null,
      };
      db.assets = [created, ...db.assets];
      return created;
    });
    return HttpResponse.json(asset, { status: 201 });
  }),

  http.get(path('/assets/:id'), ({ params }) => {
    const a = db.assets.find((x) => x.id === params.id);
    return a ? HttpResponse.json(a) : problem(404, 'ไม่พบเครื่อง');
  }),

  http.patch(path('/assets/:id'), async ({ request, params }) => {
    const a = db.assets.find((x) => x.id === params.id);
    if (!a) return problem(404, 'ไม่พบเครื่อง');
    const body = (await request.json()) as Schemas['AssetInput'];
    const next: Schemas['Asset'] = {
      ...a,
      code: body.code,
      branch: body.branch,
      locationDetail: body.locationDetail ?? a.locationDetail,
      model: body.model ?? a.model,
      installedAt: body.installedAt ?? a.installedAt,
      note: body.note ?? a.note,
    };
    db.assets = db.assets.map((x) => (x.id === a.id ? next : x));
    return HttpResponse.json(next);
  }),

  http.delete(path('/assets/:id'), ({ params }) => {
    db.assets = db.assets.map((x) => (x.id === params.id ? { ...x, active: false } : x));
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(path('/assets/qr-sheet'), () =>
    HttpResponse.json<Schemas['DownloadLink']>({
      url: 'http://localhost/mock-download/qr-sheet.pdf',
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    }),
  ),

  http.post(path('/imports'), async ({ request }) => {
    const { file } = (await request.json()) as { file: Schemas['UploadRequest'] };
    db.importJob = {
      id: uuid('misc', 100),
      kind: 'assets',
      status: 'mapping',
      fileName: file.fileName,
      columns: [
        { header: 'Machine ID', suggested: 'code' },
        { header: 'Location', suggested: 'location' },
        { header: 'Model', suggested: 'model' },
        { header: 'Install date', suggested: 'installedAt' },
        { header: 'Remark', suggested: 'note' },
      ],
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      duplicateRows: 0,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(
      {
        job: db.importJob,
        upload: {
          uploadUrl: 'http://localhost/mock-upload/import.csv',
          method: 'PUT' as const,
          headers: {},
          expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
          objectKey: 'imports/mock.csv',
        },
      },
      { status: 202 },
    );
  }),

  http.get(path('/imports/:id'), () =>
    db.importJob ? HttpResponse.json(db.importJob) : problem(404, 'ไม่พบงานนำเข้า'),
  ),

  http.put(path('/imports/:id/mapping'), () => {
    if (!db.importJob) return problem(404, 'ไม่พบงานนำเข้า');
    db.importJob = {
      ...db.importJob,
      status: 'ready',
      totalRows: 120,
      validRows: 117,
      errorRows: 2,
      duplicateRows: 1,
    };
    return HttpResponse.json(db.importJob, { status: 202 });
  }),

  http.post(path('/imports/:id/confirm'), () => {
    if (!db.importJob) return problem(404, 'ไม่พบงานนำเข้า');
    db.importJob = { ...db.importJob, status: 'completed' };
    return HttpResponse.json(db.importJob, { status: 202 });
  }),

  http.get(path('/imports/:id/errors'), ({ request }) =>
    HttpResponse.json(
      paginate<Schemas['ImportRowError']>(
        [
          { rowNo: 14, field: 'code', message: 'ไม่มีรหัสเครื่อง' },
          { rowNo: 87, field: 'installedAt', message: 'วันที่ไม่ถูกรูปแบบ วว/ดด/ปปปป' },
        ],
        new URL(request.url),
      ),
    ),
  ),
];
