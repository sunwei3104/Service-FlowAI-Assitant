// Time helpers in Asia/Bangkok, Buddhist year (plan §2.2: store UTC, show Bangkok).
import { TIME_ZONE } from '@/i18n/request';

/** "วันจันทร์ 19 ตุลาคม 2569" — like the designs (Intl adds "ที่" after the weekday; we drop it). */
export function formatLongDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('th', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${get('weekday')} ${get('day')} ${get('month')} ${get('year')}`;
}

/** "09:45" */
export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('th', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

/** 0 = Sunday … 6 = Saturday, in Bangkok. */
export function bangkokWeekday(date: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' }).format(
    date,
  );
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
}

export type DurationUnit = { unit: 'minutes' | 'hours' | 'days'; count: number };

/** Whole minutes → the unit the designs use: < 60 นาที, < 24 ชม., else วัน (rounded down). */
export function toDuration(totalMinutes: number): DurationUnit {
  const m = Math.max(Math.floor(Math.abs(totalMinutes)), 0);
  if (m < 60) return { unit: 'minutes', count: m };
  if (m < 24 * 60) return { unit: 'hours', count: Math.floor(m / 60) };
  return { unit: 'days', count: Math.floor(m / (24 * 60)) };
}
