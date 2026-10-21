// Sample data from docs/design/html/OpsOverview.html, OpsTenants.html, OpsSystem.html. Typed by the console contract.
import type { Schemas } from '@/lib/api/client';

import { daysAgo, minutesAgo, uuid } from './time';

export const buildOperator = (): Schemas['Operator'] => ({
  id: uuid('operator', 1),
  displayName: 'ทินกร (Sun)',
  role: 'platform_owner',
  passkeyVerified: true,
  environment: { name: 'production', region: 'สิงคโปร์', version: 'v1.8.2' },
});

type TenantSeed = [
  slug: string,
  name: string,
  plan: Schemas['PlanCode'],
  line: Schemas['LineState'],
  tickets7d: number,
  lastActiveMin: number | null,
  health: Schemas['TenantHealth'],
  type: Schemas['BusinessType'],
];

const seeds: TenantSeed[] = [
  ['t_smartvend', 'สมาร์ทเวนด์', 'pilot', 'ok', 109, 0, 'good', 'vending'],
  ['t_fastlaundry', 'ฟาสต์ลอนดรี้', 'starter', 'failing', 64, 15, 'risk', 'laundry'],
  ['t_chargewai', 'ชาร์จไว EV', 'business', 'ok', 1204, 0, 'good', 'ev_charging'],
  ['t_tunamdee', 'ตู้น้ำดีมีสุข', 'starter', 'ok', 212, 60, 'good', 'vending'],
  [
    't_cleanair',
    'คลีนแอร์ เซอร์วิส',
    'trial',
    'not_connected',
    0,
    60 * 24 * 2,
    'watch',
    'field_service',
  ],
];

export const buildTenants = (): Schemas['TenantDetail'][] =>
  seeds.map(([slug, name, plan, line, tickets7d, lastActiveMin, health, businessType], i) => ({
    id: uuid('tenant', i + 1),
    slug,
    name,
    plan,
    health,
    businessType,
    line,
    tickets7d,
    quotaUsedRate: plan === 'trial' ? null : 0.4 + i * 0.1,
    lastActiveAt: lastActiveMin === null ? null : minutesAgo(lastActiveMin),
    online: lastActiveMin === 0,
    renewsAt: null,
    status: 'active',
    ownerEmail: `owner@${slug.slice(2)}.example`,
    createdAt: daysAgo(90 - i * 10),
    billing: {
      status: plan === 'trial' ? 'trial' : 'paid',
      price: null,
      overdueDays: null,
      trialEndsAt: null,
    },
    healthReasons: health === 'risk' ? ['LINE ส่งข้อความล้มเหลวต่อเนื่องเกิน 30 นาที'] : [],
  }));

export const buildOverview = (): Schemas['PlatformOverview'] => ({
  activeTenants: 14,
  paidTenants: 9,
  trialTenants: 5,
  mrr: null,
  tickets7d: 2846,
  aiResolvedRate7d: 0.33,
  availability30d: 0.9995,
  sloTarget: 0.999,
  trialFunnel: [
    { step: 'signed_up', count: 8 },
    { step: 'line_connected', count: 6 },
    { step: 'first_ticket', count: 5 },
    { step: 'converted', count: 3 },
  ],
  biggestDropOff: 'ระหว่างเชื่อม LINE ถึงเปิดงานแรก',
  system: {
    apiP95Ms: 210,
    errorRate1h: 0.003,
    queueDepth: 12,
    deadJobs: 3,
    lastBackup: { at: minutesAgo(60 * 7), ok: true },
  },
  aiBudget: {
    usedRate: 0.58,
    monthElapsedRate: 0.63,
    topTenants: [
      { tenantName: 'ชาร์จไว EV', share: 0.41 },
      { tenantName: 'ตู้น้ำดีมีสุข', share: 0.14 },
      { tenantName: 'สมาร์ทเวนด์', share: 0.11 },
    ],
  },
});

export const buildAlerts = (): Schemas['PlatformAlert'][] => [
  {
    id: 'a1',
    severity: 'critical',
    tenant: { id: uuid('tenant', 2), slug: 't_fastlaundry', name: 'ฟาสต์ลอนดรี้' },
    title: 'LINE webhook ล้มเหลว 37 ครั้งใน 1 ชม.',
    detail: 'access token หมดอายุ ลูกค้าแจ้งปัญหาไม่เข้า',
    action: { kind: 'open_tenant', targetId: uuid('tenant', 2) },
  },
  {
    id: 'a2',
    severity: 'warning',
    tenant: null,
    title: 'คิวงานมี dead job 3 รายการ',
    detail: 'ส่งข้อความ LINE ไม่สำเร็จหลังลองครบ 5 ครั้ง',
    action: { kind: 'open_queue', targetId: null },
  },
  {
    id: 'a3',
    severity: 'onboarding',
    tenant: { id: uuid('tenant', 5), slug: 't_cleanair', name: 'คลีนแอร์ เซอร์วิส' },
    title: 'ทดลองใช้เหลือ 3 วัน ยังไม่เชื่อม LINE OA',
    detail: 'ขั้นตอน 3 จาก 8',
    action: { kind: 'help_onboarding', targetId: uuid('tenant', 5) },
  },
  {
    id: 'a4',
    severity: 'opportunity',
    tenant: { id: uuid('tenant', 1), slug: 't_smartvend', name: 'สมาร์ทเวนด์' },
    title: 'ใช้โควตาเครื่อง 85% และคำตอบ AI 64%',
    detail: 'เหมาะเสนออัปเกรด',
    action: { kind: 'view_usage', targetId: uuid('tenant', 1) },
  },
];

export const buildDeadJobs = (): Schemas['QueueStatus'] => ({
  depth: 12,
  deadJobs: [1, 2, 3].map((n) => ({
    id: uuid('job', n),
    kind: 'line.push_message',
    tenant: { id: uuid('tenant', 2), slug: 't_fastlaundry', name: 'ฟาสต์ลอนดรี้' },
    attempts: 5,
    lastError: '401 Unauthorized (access token expired)',
    failedAt: minutesAgo(20 * n),
  })),
});
