// Seed data for assets, knowledge, LINE and team mocks. Builders return fresh objects so
// resetMockDb() can restore them between tests. Refine each block when its page is built.
import type { Schemas } from '@/lib/api/client';

import { users } from './people';
import { dateOnly, daysAgo, minutesAgo, uuid } from './time';

type AssetSeed = [
  code: string,
  branch: string,
  detail: string | null,
  model: string,
  condition: Schemas['AssetCondition'],
  open: number,
  t30: number,
];

const assetSeeds: AssetSeed[] = [
  ['VM-BKK-0231', 'สาขาสยาม', 'ชั้น 2', 'Fuji FVM-500', 'open_tickets', 2, 6],
  ['VM-BKK-0118', 'สาขาอโศก', null, 'Fuji FVM-500', 'open_tickets', 2, 3],
  ['VM-NON-0042', 'สาขานนทบุรี', null, 'Sanden SVM-3', 'open_tickets', 1, 2],
  ['VM-BKK-0077', 'สาขาลาดพร้าว', null, 'Fuji FVM-300', 'out_of_service', 2, 5],
  ['VM-PTE-0009', 'สาขาปทุมธานี', null, 'Sanden SVM-3', 'operational', 0, 1],
];

export const buildAssets = (): Schemas['Asset'][] =>
  assetSeeds.map(([code, branch, detail, model, condition, open, t30], i) => ({
    id: uuid('asset', Number(code.slice(-4))),
    code,
    branch,
    locationDetail: detail,
    model,
    condition,
    openTickets: open,
    tickets30d: t30,
    installedAt: dateOnly(daysAgo(400 + i * 30)),
    note: null,
    active: true,
    location: null,
  }));

export const buildDocuments = (): Schemas['KnowledgeDocument'][] => [
  {
    id: uuid('doc', 1),
    kind: 'faq',
    title: 'วิธีรีเซ็ตเครื่อง',
    category: 'หน้าจอ',
    status: 'published',
    audience: 'customers',
    timesUsed: 128,
    helpfulRate: 0.91,
    updatedAt: daysAgo(3),
  },
  {
    id: uuid('doc', 2),
    kind: 'manual',
    title: 'คู่มือแก้สินค้าติดช่อง',
    category: 'คู่มือภายใน',
    status: 'published',
    audience: 'internal',
    timesUsed: 42,
    helpfulRate: 0.84,
    updatedAt: daysAgo(10),
  },
];

export const buildAiSettings = (): Schemas['AiSettings'] => ({
  autoAnswerMinConfidence: 0.8,
  escalateWhenUnsure: true,
  forbidMonetaryPromises: true,
});

export const buildLineChannel = (): Schemas['LineChannel'] => ({
  status: 'connected',
  channelId: '2001234567',
  lineId: '@smartvend-help',
  channelSecretMasked: '••••••••••••3f9a',
  accessTokenMasked: '••••••••••••Qx2=',
  webhookUrl: 'https://app.serviceflow.ai/webhooks/line/ch_8f2k1q',
  lastVerifiedAt: minutesAgo(60 * 24),
  lastMessageAt: minutesAgo(2),
  messagesToday: 86,
  ticketsOpenedToday: 9,
  lastError: null,
});

export const buildLineSettings = (): Schemas['LineSettings'] => ({
  welcomeMessage:
    'สวัสดีค่ะ แจ้งปัญหาเครื่องได้ที่นี่ สแกน QR ที่ตู้เพื่อให้ระบบรู้ว่าเป็นเครื่องไหน',
  businessHours: { start: '08:00', end: '20:00' },
  afterHoursAi: true,
  menuItems: [
    { label: 'แจ้งปัญหา', action: 'report_problem' },
    { label: 'ติดตามงาน', action: 'check_status' },
    { label: 'คำถามที่พบบ่อย', action: 'faq' },
  ],
});

export const buildMembers = (): Schemas['Member'][] => [
  {
    user: users.napa,
    role: 'admin',
    area: null,
    openTickets: 1,
    loginProvider: 'google',
    lastActiveAt: minutesAgo(1),
  },
  {
    user: users.somchai,
    role: 'agent',
    area: 'กรุงเทพฯ ฝั่งตะวันออก',
    openTickets: 2,
    loginProvider: 'line',
    lastActiveAt: minutesAgo(5),
  },
  {
    user: users.wichai,
    role: 'agent',
    area: 'นนทบุรี',
    openTickets: 1,
    loginProvider: 'line',
    lastActiveAt: minutesAgo(20),
  },
  {
    user: users.pakorn,
    role: 'agent',
    area: 'กรุงเทพฯ ฝั่งเหนือ',
    openTickets: 2,
    loginProvider: 'line',
    lastActiveAt: minutesAgo(45),
  },
  {
    user: users.anan,
    role: 'viewer',
    area: null,
    openTickets: 0,
    loginProvider: 'google',
    lastActiveAt: minutesAgo(60 * 26),
  },
];

export const buildSecurity = (): Schemas['TenantSecurity'] => ({
  idleTimeoutMinutes: 720,
  loginProviders: { line: true, google: true },
  autoApproveReadOnlySupport: false,
});

export const buildSupportRequests = (): Schemas['SupportAccessRequest'][] => [
  {
    id: uuid('misc', 301),
    requestedBy: 'ทีม ServiceFlow (ทินกร)',
    reason: 'ตรวจสอบ webhook ที่ล้มเหลวเมื่อเช้า',
    scopes: ['line.read'],
    durationMinutes: 60,
    status: 'pending',
    breakGlass: false,
    requestedAt: minutesAgo(15),
    expiresAt: null,
  },
];
