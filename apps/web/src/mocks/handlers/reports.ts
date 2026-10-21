import { http, HttpResponse } from 'msw';

import type { Schemas } from '@/lib/api/client';

import { db } from '../db';
import { users } from '../fixtures/people';
import { dateOnly, daysAgo, minutesAgo, uuid } from '../fixtures/time';
import { paginate, path } from '../utils';

// Numbers from docs/design/html/Main.html and Reports.html.
function summary(): Schemas['ReportSummary'] {
  const ref = (n: number) => {
    const t = db.tickets.find((x) => x.number === `SF-000${n}`);
    return t ? { id: t.id, number: t.number, title: t.title, status: t.status } : null;
  };
  return {
    kpis: {
      newUnassigned: 7,
      newBySource: { line: 6, web: 1 },
      inProgress: 12,
      assigned: 4,
      waiting: 4,
      waitingCustomer: 1,
      waitingParts: 3,
      resolvedToday: 18,
      resolvedWithinSla: 16,
      totalTickets: 109,
      firstResponseMinutesP50: 12,
      resolutionMinutesP50: 190,
      slaMetRate: 0.89,
      csatAverage: 4.6,
    },
    openByStatus: { new: 7, assigned: 4, in_progress: 8, waiting: 4 },
    daily: [14, 18, 11, 22, 16, 9, 19].map((total, i) => ({
      date: dateOnly(daysAgo(6 - i)),
      total,
      aiResolved: Math.round(total * 0.3),
    })),
    topProblems: [
      { categoryName: 'ไม่ทอนเงิน / ไม่รับเงิน', share: 0.46, isOther: false },
      { categoryName: 'หน้าจอค้าง / ไม่ตอบสนอง', share: 0.22, isOther: false },
      { categoryName: 'จ่ายแล้วสินค้าไม่ออก', share: 0.15, isOther: false },
      { categoryName: 'ชำระ QR ไม่สำเร็จ', share: 0.09, isOther: false },
      { categoryName: 'อื่น ๆ', share: 0.08, isOther: true },
    ],
    slaBreached: [ref(148), ref(139)].filter((x): x is NonNullable<typeof x> => x !== null),
    recentActivity: [
      { at: minutesAgo(3), text: 'ลูกค้าแจ้งผ่าน LINE เปิดงาน', ticket: ref(148) },
      { at: minutesAgo(15), text: 'สมชาย ก. รับงาน', ticket: ref(147) },
      {
        at: minutesAgo(33),
        text: 'AI ตอบเรื่อง "วิธีรีเซ็ตเครื่อง" จากฐานความรู้ ลูกค้ากดว่าได้ผล',
        ticket: null,
      },
    ],
  };
}

export const reportHandlers = [
  http.get(path('/reports/summary'), () => HttpResponse.json(summary())),
  http.get(path('/reports/sla'), () =>
    HttpResponse.json({
      data: [
        { categoryName: 'เงิน / เหรียญ', tickets: 52, metRate: 0.92, targetMinutes: 240 },
        { categoryName: 'สินค้า', tickets: 31, metRate: 0.84, targetMinutes: 480 },
      ] satisfies Schemas['SlaByCategory'][],
    }),
  ),
  http.get(path('/reports/technicians'), () =>
    HttpResponse.json({
      data: [
        {
          user: users.somchai,
          resolved: 38,
          avgResolutionMinutes: 150,
          slaMetRate: 0.93,
          csatAverage: 4.8,
        },
        {
          user: users.wichai,
          resolved: 29,
          avgResolutionMinutes: 175,
          slaMetRate: 0.88,
          csatAverage: 4.5,
        },
      ] satisfies Schemas['TechnicianPerformance'][],
    }),
  ),
  http.get(path('/reports/assets'), () =>
    HttpResponse.json({
      data: [
        {
          asset: {
            id: uuid('asset', 231),
            code: 'VM-BKK-0231',
            branch: 'สาขาสยาม',
            locationDetail: 'ชั้น 2',
          },
          tickets: 6,
          topProblem: 'ไม่ทอนเหรียญ',
        },
      ] satisfies Schemas['AssetProblemStat'][],
    }),
  ),
  http.get(path('/reports/export'), () =>
    HttpResponse.json<Schemas['DownloadLink']>({
      url: 'http://localhost/mock-download/report.xlsx',
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    }),
  ),
  http.get(path('/usage'), () =>
    HttpResponse.json<Schemas['Usage']>({
      periodStart: dateOnly(daysAgo(18)),
      periodEnd: dateOnly(daysAgo(-12)),
      aiAnswers: { used: 642, limit: 1000, selfResolvedRate: 0.68 },
      tickets: { used: 412, limit: null },
      assets: { used: 120, limit: 200 },
      members: { used: 5, limit: 10 },
    }),
  ),
  http.get(path('/subscription'), () =>
    HttpResponse.json<Schemas['Subscription']>({
      planName: 'Pilot',
      status: 'active',
      renewsAt: dateOnly(daysAgo(-12)),
      trialEndsAt: null,
    }),
  ),
  http.get(path('/audit-logs'), ({ request }) =>
    HttpResponse.json(
      paginate<Schemas['AuditLogEntry']>(
        [
          {
            id: uuid('misc', 401),
            actor: { type: 'user', displayName: 'นภา วงศ์ดี' },
            action: 'member.role_changed',
            target: 'วิชัย ร.',
            ip: null,
            grantId: null,
            createdAt: minutesAgo(90),
          },
        ],
        new URL(request.url),
      ),
    ),
  ),
];
