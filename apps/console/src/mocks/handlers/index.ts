import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { daysAgo, minutesAgo } from '../fixtures/time';
import { idempotent, paginate, path, problem } from '../utils';

const MAX_PASSKEY_FAILURES = 3;
const LOCK_MINUTES = 15;
const passkeyLocked = () =>
  db.passkey.lockedUntil !== null && new Date(db.passkey.lockedUntil) > new Date();
const lockedProblem = () =>
  new Response(
    JSON.stringify({
      type: 'about:blank',
      title: 'ล็อกชั่วคราว',
      status: 423,
      lockedUntil: db.passkey.lockedUntil,
    }),
    { status: 423, headers: { 'Content-Type': 'application/problem+json' } },
  );

const findTenant = (id: unknown) => db.tenants.find((t) => t.id === id);

export const handlers = [
  // Passkey (decision D17). Mock bootstrap code: MOCK-BOOTSTRAP. Body {fail:true} simulates a wrong key.
  http.get(path('/auth/passkey/status'), () =>
    HttpResponse.json<Schemas['PasskeyStatus']>({
      email: 'sun@serviceflow.example',
      registered: db.passkey.registered,
      lockedUntil: db.passkey.lockedUntil,
      attemptsRemaining: Math.max(MAX_PASSKEY_FAILURES - db.passkey.failures, 0),
    }),
  ),
  http.post(path('/auth/passkey/register/options'), async ({ request }) => {
    const { bootstrapCode } = (await request.json()) as { bootstrapCode: string };
    if (bootstrapCode !== 'MOCK-BOOTSTRAP') return problem(422, 'bootstrap code ไม่ถูกต้อง');
    return HttpResponse.json({ challenge: 'mock' });
  }),
  http.post(path('/auth/passkey/register/verify'), () => {
    db.passkey = { registered: true, failures: 0, lockedUntil: null };
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(path('/auth/passkey/options'), () =>
    passkeyLocked() ? lockedProblem() : HttpResponse.json({ challenge: 'mock' }),
  ),
  http.post(path('/auth/passkey/verify'), async ({ request }) => {
    if (passkeyLocked()) return lockedProblem();
    const body = (await request.json()) as { fail?: boolean };
    if (body.fail) {
      db.passkey.failures += 1;
      if (db.passkey.failures >= MAX_PASSKEY_FAILURES) {
        db.passkey.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
        return lockedProblem();
      }
      return new Response(
        JSON.stringify({
          type: 'about:blank',
          title: 'Passkey ไม่ถูกต้อง',
          status: 401,
          attemptsRemaining: MAX_PASSKEY_FAILURES - db.passkey.failures,
        }),
        { status: 401, headers: { 'Content-Type': 'application/problem+json' } },
      );
    }
    db.passkey.failures = 0;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(path('/me'), () => HttpResponse.json(db.operator)),
  http.get(path('/overview'), () => HttpResponse.json(db.overview)),
  http.get(path('/alerts'), () => HttpResponse.json({ data: db.alerts })),

  http.get(path('/tenants'), ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase();
    const plan = url.searchParams.get('plan');
    const health = url.searchParams.get('health');
    const businessType = url.searchParams.get('businessType');
    let items: Schemas['TenantSummary'][] = db.tenants;
    if (q) items = items.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
    if (plan) items = items.filter((t) => t.plan === plan);
    if (health) items = items.filter((t) => t.health === health);
    if (businessType) items = items.filter((t) => t.businessType === businessType);
    return HttpResponse.json(paginate(items, url));
  }),
  http.get(path('/tenants/:id'), ({ params }) => {
    const t = findTenant(params.id);
    return t ? HttpResponse.json(t) : problem(404, 'ไม่พบบริษัท');
  }),
  http.get(path('/tenants/:id/usage'), ({ params }) =>
    findTenant(params.id)
      ? HttpResponse.json<Schemas['TenantUsage']>({
          tickets: { used: 412, limit: null },
          aiAnswers: { used: 642, limit: 1000 },
          assets: { used: 170, limit: 200 },
          members: { used: 5, limit: 10 },
          aiCost: null,
        })
      : problem(404, 'ไม่พบบริษัท'),
  ),
  http.get(path('/tenants/:id/line-health'), ({ params }) => {
    const t = findTenant(params.id);
    if (!t) return problem(404, 'ไม่พบบริษัท');
    return HttpResponse.json<Schemas['LineHealth']>(
      t.line === 'failing'
        ? {
            state: 'failing',
            webhookFailures1h: 37,
            lastSuccessAt: minutesAgo(70),
            lastErrorCode: '401',
            lastErrorSummary: 'access token หมดอายุ',
          }
        : {
            state: t.line,
            webhookFailures1h: 0,
            lastSuccessAt: minutesAgo(2),
            lastErrorCode: null,
            lastErrorSummary: null,
          },
    );
  }),
  http.get(path('/tenants/:id/onboarding'), ({ params }) =>
    findTenant(params.id)
      ? HttpResponse.json({
          steps: [
            'สร้างบัญชี',
            'เชิญทีม',
            'เชื่อม LINE OA',
            'ตั้งประเภทปัญหา',
            'นำเข้าเครื่อง',
            'พิมพ์ QR',
            'เพิ่มฐานความรู้',
            'เปิดงานแรก',
          ].map((label, i) => ({
            key: `step${i + 1}`,
            label,
            done: i < 5,
            doneAt: i < 5 ? daysAgo(30 - i) : null,
          })) satisfies Schemas['OnboardingStep'][],
        })
      : problem(404, 'ไม่พบบริษัท'),
  ),
  http.get(path('/tenants/:id/support-access-requests'), ({ params }) =>
    HttpResponse.json({ data: db.grants.filter((g) => g.tenantId === params.id) }),
  ),
  http.post(path('/tenants/:id/support-access-requests'), async ({ request, params }) => {
    if (!findTenant(params.id)) return problem(404, 'ไม่พบบริษัท');
    const body = (await request.json()) as {
      reason: string;
      durationMinutes: number;
      scopes: Schemas['SupportAccessScope'][];
    };
    if (!body.reason?.trim())
      return problem(422, 'ต้องระบุเหตุผล', undefined, [{ field: 'reason', message: 'จำเป็น' }]);
    const grant = idempotent(request, () => {
      const created = {
        id: crypto.randomUUID(),
        tenantId: String(params.id),
        status: 'pending' as const,
        reason: body.reason,
        scopes: body.scopes,
        durationMinutes: body.durationMinutes,
        breakGlass: false,
        requestedBy: db.operator.displayName,
        requestedAt: new Date().toISOString(),
        expiresAt: null,
      };
      db.grants = [...db.grants, created];
      return created;
    });
    return HttpResponse.json(grant, { status: 201 });
  }),
  http.patch(path('/tenants/:id/plan'), async ({ request, params }) => {
    const t = findTenant(params.id);
    if (!t) return problem(404, 'ไม่พบบริษัท');
    const body = (await request.json()) as { plan?: Schemas['PlanCode'] };
    const next = { ...t, plan: body.plan ?? t.plan };
    db.tenants = db.tenants.map((x) => (x.id === t.id ? next : x));
    return HttpResponse.json(next);
  }),
  http.patch(path('/tenants/:id/status'), async ({ request, params }) => {
    const t = findTenant(params.id);
    if (!t) return problem(404, 'ไม่พบบริษัท');
    const body = (await request.json()) as { status: 'active' | 'suspended' };
    const next = { ...t, status: body.status };
    db.tenants = db.tenants.map((x) => (x.id === t.id ? next : x));
    return HttpResponse.json(next);
  }),
  http.get(path('/tenants/:id/audit'), ({ request }) =>
    HttpResponse.json(paginate<Schemas['AuditEntry']>([], new URL(request.url))),
  ),
  http.get(path('/audit'), ({ request }) =>
    HttpResponse.json(paginate<Schemas['AuditEntry']>([], new URL(request.url))),
  ),

  http.get(path('/system/services'), () =>
    HttpResponse.json({
      slo: { availability30d: 0.9995, target: 0.999, errorBudgetRemaining: 0.5 },
      data: [
        { name: 'API', status: 'ok', detail: null, p95Ms: 210 },
        { name: 'Worker', status: 'ok', detail: null, p95Ms: null },
        { name: 'PostgreSQL', status: 'ok', detail: null, p95Ms: null },
        {
          name: 'LINE Messaging API',
          status: 'degraded',
          detail: 'ล้มเหลวเฉพาะ 1 บริษัท',
          p95Ms: null,
        },
      ] satisfies Schemas['ServiceHealth'][],
    }),
  ),
  http.get(path('/system/queue'), () => HttpResponse.json(db.queue)),
  http.get(path('/system/backups'), () =>
    HttpResponse.json({
      data: [
        {
          at: minutesAgo(60 * 7),
          kind: 'nightly',
          ok: true,
          sizeBytes: 1_200_000_000,
          detail: null,
        },
      ] satisfies Schemas['Backup'][],
    }),
  ),
  http.get(path('/system/deploys'), () =>
    HttpResponse.json({
      data: [
        {
          version: 'v1.8.2',
          at: daysAgo(2),
          environment: 'production',
          ok: true,
          commit: 'a1b2c3d',
        },
      ] satisfies Schemas['Deploy'][],
    }),
  ),
  ...(['retry', 'discard'] as const).map((action) =>
    http.post(path(`/system/jobs/:id/${action}`), ({ params }) => {
      if (!db.queue.deadJobs.some((j) => j.id === params.id)) return problem(404, 'ไม่พบงาน');
      db.queue = { ...db.queue, deadJobs: db.queue.deadJobs.filter((j) => j.id !== params.id) };
      return new HttpResponse(null, { status: 204 });
    }),
  ),
  http.get(path('/ai/costs'), () =>
    HttpResponse.json<Schemas['AiCosts']>({
      budget: db.overview.aiBudget,
      byModel: [
        { model: 'claude-haiku', requests: 18_200, cost: null },
        { model: 'claude-sonnet', requests: 2_100, cost: null },
      ],
      byTenant: db.tenants.slice(0, 3).map((t, i) => ({
        tenant: { id: t.id, slug: t.slug, name: t.name },
        cost: null,
        share: [0.11, 0.05, 0.41][i] ?? 0,
      })),
    }),
  ),
  http.get(path('/ai/evals'), () =>
    HttpResponse.json<Schemas['AiEvalRun']>({
      ranAt: daysAgo(2),
      passed: true,
      metrics: [
        { name: 'ตอบถูกจากแหล่งอ้างอิง', value: 0.94, threshold: 0.9, passed: true },
        { name: 'ปฏิเสธเมื่อไม่มีหลักฐาน', value: 0.97, threshold: 0.95, passed: true },
      ],
    }),
  ),
];
