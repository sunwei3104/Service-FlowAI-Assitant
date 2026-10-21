'use client';

import { KpiTile } from '@serviceflow/ui/data/kpi-tile';
import { Skeleton } from '@serviceflow/ui/ui/skeleton';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { routes } from '@/config/routes';
import type { Schemas } from '@/lib/api/client';

import { SectionError } from './section-state';

/** 4 KPI tiles (Main.html). Each opens the matching Tickets view. */
export function KpiRow({
  slug,
  kpis,
  isError,
  error,
  onRetry,
}: {
  slug: string;
  kpis: Schemas['ReportSummary']['kpis'] | undefined;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  const t = useTranslations('overview');
  const tickets = routes.dashboard.tickets(slug);

  if (isError) return <SectionError error={error} onRetry={onRetry} />;
  if (!kpis) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }
  const assigned = kpis.assigned ?? 0;
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
      <KpiTile
        Link={Link}
        href={`${tickets}?view=unassigned`}
        label={t('kpiNew')}
        value={String(kpis.newUnassigned)}
        dot="primary"
        detail={t('kpiNewDetail', {
          line: kpis.newBySource?.line ?? 0,
          web: kpis.newBySource?.web ?? 0,
        })}
      />
      <KpiTile
        Link={Link}
        href={`${tickets}?view=open`}
        label={t('kpiProgress')}
        value={String(kpis.inProgress)}
        dot="navy"
        detail={t('kpiProgressDetail', {
          assigned,
          working: Math.max(kpis.inProgress - assigned, 0),
        })}
      />
      <KpiTile
        Link={Link}
        href={`${tickets}?view=waiting`}
        label={t('kpiWaiting')}
        value={String(kpis.waiting)}
        dot="warning"
        detail={t('kpiWaitingDetail', {
          customer: kpis.waitingCustomer ?? 0,
          parts: kpis.waitingParts ?? 0,
        })}
      />
      <KpiTile
        Link={Link}
        href={routes.dashboard.reports(slug)}
        label={t('kpiResolved')}
        value={String(kpis.resolvedToday)}
        dot="success"
        detailTone="success"
        detail={t('kpiResolvedDetail', { met: kpis.resolvedWithinSla, total: kpis.resolvedToday })}
      />
    </div>
  );
}
