// Rows copied from docs/design/html/Tickets.html (SF-000148 … SF-000137).
import type { Schemas } from '@/lib/api/client';

import { users } from './people';
import { minutesAgo, minutesFromNow, uuid } from './time';

type Row = {
  n: number;
  title: string;
  customer: string;
  source: Schemas['TicketSource'];
  asset: [code: string, branch: string] | null;
  priority: Schemas['TicketPriority'];
  status: Schemas['TicketStatus'];
  waitingReason?: Schemas['WaitingReason'];
  assignee: Schemas['UserRef'] | null;
  /** + minutes left, − minutes overdue, null = paused */
  slaMinutes: number | null;
  updatedMinutesAgo: number;
  category: string;
};

const CATEGORY = {
  money: { id: uuid('category', 1), name: 'เงิน / เหรียญ' },
  payment: { id: uuid('category', 2), name: 'การชำระเงิน' },
  screen: { id: uuid('category', 3), name: 'หน้าจอ' },
  product: { id: uuid('category', 4), name: 'สินค้า' },
} satisfies Record<string, Schemas['CategoryRef']>;

const rows: Row[] = [
  {
    n: 148,
    title: 'เครื่องไม่ทอนเหรียญ',
    customer: 'คุณมานพ',
    source: 'line',
    asset: ['VM-BKK-0231', 'สาขาสยาม'],
    priority: 'urgent',
    status: 'new',
    assignee: null,
    slaMinutes: -25,
    updatedMinutesAgo: 3,
    category: 'money',
  },
  {
    n: 147,
    title: 'หน้าจอค้าง ไม่รับคำสั่ง',
    customer: 'คุณศิริพร',
    source: 'line',
    asset: ['VM-BKK-0118', 'สาขาอโศก'],
    priority: 'high',
    status: 'assigned',
    assignee: users.somchai,
    slaMinutes: 40,
    updatedMinutesAgo: 15,
    category: 'screen',
  },
  {
    n: 146,
    title: 'ขอใบกำกับภาษีย้อนหลัง',
    customer: 'คุณอรทัย',
    source: 'line',
    asset: null,
    priority: 'low',
    status: 'new',
    assignee: null,
    slaMinutes: 180,
    updatedMinutesAgo: 24,
    category: 'payment',
  },
  {
    n: 145,
    title: 'ไม่รับธนบัตร 100 บาท',
    customer: 'คุณธนา',
    source: 'line',
    asset: ['VM-NON-0042', 'สาขานนทบุรี'],
    priority: 'high',
    status: 'in_progress',
    assignee: users.wichai,
    slaMinutes: 120,
    updatedMinutesAgo: 40,
    category: 'money',
  },
  {
    n: 144,
    title: 'ตู้ไม่เย็น อุณหภูมิ 14°C',
    customer: 'พนักงานสาขาบางนา',
    source: 'web',
    asset: ['VM-BKK-0190', 'สาขาบางนา'],
    priority: 'urgent',
    status: 'assigned',
    assignee: users.pakorn,
    slaMinutes: 55,
    updatedMinutesAgo: 47,
    category: 'product',
  },
  {
    n: 142,
    title: 'สแกน QR จ่ายแล้ว สินค้าไม่ออก',
    customer: 'คุณกิตติ',
    source: 'line',
    asset: ['VM-BKK-0077', 'สาขาลาดพร้าว'],
    priority: 'high',
    status: 'waiting',
    waitingReason: 'parts',
    assignee: users.pakorn,
    slaMinutes: null,
    updatedMinutesAgo: 65,
    category: 'payment',
  },
  {
    n: 141,
    title: 'ขอเงินคืน สินค้าไม่ออก',
    customer: 'คุณพิมพ์ชนก',
    source: 'line',
    asset: ['VM-BKK-0077', 'สาขาลาดพร้าว'],
    priority: 'normal',
    status: 'waiting',
    waitingReason: 'customer',
    assignee: users.napa,
    slaMinutes: null,
    updatedMinutesAgo: 74,
    category: 'payment',
  },
  {
    n: 139,
    title: 'สินค้าติดในช่อง ไม่ตกลงมา',
    customer: 'คุณวีระ',
    source: 'line',
    asset: ['VM-BKK-0231', 'สาขาสยาม'],
    priority: 'high',
    status: 'in_progress',
    assignee: users.somchai,
    slaMinutes: -10,
    updatedMinutesAgo: 85,
    category: 'product',
  },
  {
    n: 138,
    title: 'ปุ่มเลือกสินค้าช่อง 4 กดไม่ได้',
    customer: 'คุณณัฐ',
    source: 'line',
    asset: ['VM-CNX-0012', 'สาขาเชียงใหม่'],
    priority: 'normal',
    status: 'in_progress',
    assignee: users.anan,
    slaMinutes: 300,
    updatedMinutesAgo: 103,
    category: 'product',
  },
  {
    n: 137,
    title: 'เติมสินค้าแล้วระบบสต็อกไม่อัปเดต',
    customer: 'พนักงานสาขาอโศก',
    source: 'web',
    asset: ['VM-BKK-0118', 'สาขาอโศก'],
    priority: 'low',
    status: 'assigned',
    assignee: users.anan,
    slaMinutes: 1440,
    updatedMinutesAgo: 107,
    category: 'product',
  },
];

function slaFor(row: Row): Schemas['Sla'] {
  if (row.slaMinutes === null)
    return { dueAt: null, pausedAt: minutesAgo(row.updatedMinutesAgo), state: 'paused' };
  const state = row.slaMinutes < 0 ? 'breached' : row.slaMinutes <= 60 ? 'at_risk' : 'on_track';
  return { dueAt: minutesFromNow(row.slaMinutes), pausedAt: null, state };
}

export function buildTickets(): Schemas['Ticket'][] {
  return rows.map((row) => ({
    id: uuid('ticket', row.n),
    number: `SF-${String(row.n).padStart(6, '0')}`,
    title: row.title,
    status: row.status,
    waitingReason: row.waitingReason ?? null,
    priority: row.priority,
    category: CATEGORY[row.category as keyof typeof CATEGORY],
    asset: row.asset
      ? {
          id: uuid('asset', Number(row.asset[0].slice(-4))),
          code: row.asset[0],
          branch: row.asset[1],
          locationDetail: null,
        }
      : null,
    assignee: row.assignee,
    customerName: row.customer,
    source: row.source,
    sla: slaFor(row),
    aiSummary: null,
    distanceKm: null,
    createdAt: minutesAgo(row.updatedMinutesAgo + 5),
    updatedAt: minutesAgo(row.updatedMinutesAgo),
    version: 1,
    description: null,
    customer: { displayName: row.customer, phoneMasked: null },
    acceptedAt: row.assignee ? minutesAgo(row.updatedMinutesAgo) : null,
    resolvedAt: null,
    requirePhotoOnResolve: row.category === 'product',
    assetLocation: null,
    relatedOpenTickets: [],
  }));
}

export const categories: Schemas['CategoryRef'][] = Object.values(CATEGORY);
