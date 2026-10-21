'use client';

import { icons } from '@serviceflow/ui/icons';
import { PageMain } from '@serviceflow/ui/shell';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useTenant } from '@/components/tenant-context';
import { can } from '@/config/permissions';
import { routes } from '@/config/routes';
import { reportQueries } from '@/features/reports/api';
import { formatClock, formatLongDate } from '@/lib/format/time';
import { useNow } from '@/lib/hooks/use-now';

import { AttentionTable } from './attention-table';
import { KpiRow } from './kpi-row';
import { RangeToggle, type OverviewRange } from './range-toggle';
import { SlaAlert } from './sla-alert';
import { ActivityPanel, TopProblemsPanel, WeeklyTicketsPanel } from './bottom-panels';
import { AiUsagePanel, LinePanel, OpenTicketsPanel } from './side-panels';

/** ภาพรวม (Admin) — docs/design/html/Main.html, docs/design/png/Main.png. */
export function OverviewPage() {
  const t = useTranslations('overview');
  const { slug, membership } = useTenant();
  const now = useNow();
  const [range, setRange] = useState<OverviewRange>('today');

  // KPIs follow the toggle; the chart is always 7 days and "ปัญหาที่พบบ่อย" always 30 days (as labelled).
  const summary = useQuery(reportQueries.summary({ range }));
  const week = useQuery(reportQueries.summary({ range: '7d' }));
  const month = useQuery(reportQueries.summary({ range: '30d' }));
  const updatedAt = summary.dataUpdatedAt ? new Date(summary.dataUpdatedAt) : now;

  return (
    <PageMain gap="lg" className="max-w-[1240px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title m-0">{t('title')}</h1>
          <p className="text-ink-muted m-0 mt-0.5">
            {t('updated', { date: formatLongDate(now), time: formatClock(updatedAt) })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RangeToggle value={range} onChange={setRange} />
          <Link
            href={routes.dashboard.reports(slug)}
            className="border-control-border bg-surface-000 text-ink hover:text-ink inline-flex h-11 items-center gap-2 rounded-md border px-3.5 font-medium no-underline"
          >
            <icons.download size={18} />
            {t('export')}
          </Link>
        </div>
      </div>

      <SlaAlert slug={slug} now={now} />

      <KpiRow
        slug={slug}
        kpis={summary.data?.kpis}
        isError={summary.isError}
        error={summary.error}
        onRetry={() => void summary.refetch()}
      />

      <div className="flex flex-wrap items-start gap-5">
        <AttentionTable slug={slug} now={now} />
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
          <OpenTicketsPanel summary={summary.data} />
          {can(membership.role, 'line.manage') ? <LinePanel slug={slug} now={now} /> : null}
          <AiUsagePanel slug={slug} role={membership.role} />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        <WeeklyTicketsPanel daily={week.data?.daily} />
        <TopProblemsPanel problems={month.data?.topProblems} />
        <ActivityPanel slug={slug} items={summary.data?.recentActivity} />
      </div>
    </PageMain>
  );
}
