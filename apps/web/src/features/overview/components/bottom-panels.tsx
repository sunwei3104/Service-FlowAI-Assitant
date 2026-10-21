'use client';

import { BarChart } from '@serviceflow/ui/data/bar-chart';
import { ProgressMeter } from '@serviceflow/ui/data/progress-meter';
import { Panel } from '@serviceflow/ui/display/panel';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';

import { routes } from '@/config/routes';
import type { Schemas } from '@/lib/api/client';
import { bangkokWeekday, formatClock } from '@/lib/format/time';

import { SectionSkeleton } from './section-state';

/** "Ticket 7 วันล่าสุด" — always the last 7 days, today highlighted. */
export function WeeklyTicketsPanel({
  daily,
}: {
  daily: Schemas['ReportSummary']['daily'] | undefined;
}) {
  const t = useTranslations('overview');
  const weekdays = useTranslations('time')('weekdayShort').split('|');
  const days = (daily ?? []).slice(-7);
  const total = days.reduce((sum, d) => sum + d.total, 0);
  const bars = days.map((d, i) => {
    const isToday = i === days.length - 1;
    // date-only (YYYY-MM-DD) → noon UTC keeps the same calendar day in Bangkok.
    const label = isToday
      ? t('today')
      : (weekdays[bangkokWeekday(new Date(`${d.date}T12:00:00Z`))] ?? d.date);
    return { key: d.date, label, value: d.total, highlight: isToday };
  });
  return (
    <Panel
      title={t('weekTitle')}
      aside={
        daily ? (
          <span className="text-body-sm text-ink-muted">{t('weekTotal', { count: total })}</span>
        ) : null
      }
    >
      {daily ? (
        <BarChart
          bars={bars}
          ariaLabel={t('weekAria', { list: bars.map((b) => `${b.label} ${b.value}`).join(', ') })}
        />
      ) : (
        <SectionSkeleton rows={5} />
      )}
    </Panel>
  );
}

/** "ปัญหาที่พบบ่อย" (30 days). */
export function TopProblemsPanel({
  problems,
}: {
  problems: Schemas['ReportSummary']['topProblems'] | undefined;
}) {
  const t = useTranslations('overview');
  const format = useFormatter();
  return (
    <Panel
      title={t('topTitle')}
      aside={<span className="text-body-sm text-ink-muted">{t('topRange')}</span>}
    >
      {problems ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {problems.map((p) => {
            const pct = format.number(p.share, { style: 'percent' });
            return (
              <li key={p.categoryName}>
                <div className="text-body-sm mb-1 flex justify-between">
                  <span>{p.categoryName}</span>
                  <strong>{pct}</strong>
                </div>
                <ProgressMeter
                  label={`${p.categoryName} ${pct}`}
                  value={Math.round(p.share * 100)}
                  max={100}
                  track="surface"
                  fill={p.isOther ? 'neutral' : 'primary'}
                  rounded="both"
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <SectionSkeleton rows={5} />
      )}
    </Panel>
  );
}

/** "ความเคลื่อนไหวล่าสุด". */
export function ActivityPanel({
  slug,
  items,
}: {
  slug: string;
  items: Schemas['ReportSummary']['recentActivity'] | undefined;
}) {
  const t = useTranslations('overview');
  return (
    <Panel title={t('activityTitle')}>
      {!items ? (
        <SectionSkeleton rows={5} />
      ) : items.length === 0 ? (
        <p className="text-body-sm text-ink-muted m-0">{t('activityEmpty')}</p>
      ) : (
        <ol className="text-body-sm m-0 flex list-none flex-col gap-3 p-0">
          {items.map((item) => (
            <li key={`${item.at}-${item.text}`} className="flex gap-2.5">
              <time dateTime={item.at} className="text-ink-muted w-11 flex-none font-mono">
                {formatClock(new Date(item.at))}
              </time>
              <span>
                {item.text}
                {item.ticket ? (
                  <>
                    {' '}
                    <Link
                      href={routes.dashboard.ticket(slug, item.ticket.id)}
                      className="font-mono"
                    >
                      {item.ticket.number}
                    </Link>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
