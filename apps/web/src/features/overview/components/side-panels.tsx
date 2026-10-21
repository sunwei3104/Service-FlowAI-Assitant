'use client';

import { ApiError } from '@serviceflow/contracts/http';
import { ProgressMeter } from '@serviceflow/ui/data/progress-meter';
import { StackedBar } from '@serviceflow/ui/data/stacked-bar';
import { Panel } from '@serviceflow/ui/display/panel';
import { Pill } from '@serviceflow/ui/display/pill';
import { icons } from '@serviceflow/ui/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';

import { can, type Role } from '@/config/permissions';
import { routes } from '@/config/routes';
import { lineQueries } from '@/features/line/api';
import { reportQueries } from '@/features/reports/api';
import type { Schemas } from '@/lib/api/client';
import { useDurationFormat } from '@/lib/format/use-duration';

import { SectionError, SectionSkeleton } from './section-state';

/** "งานที่เปิดอยู่" — total + stacked bar + legend. */
export function OpenTicketsPanel({ summary }: { summary: Schemas['ReportSummary'] | undefined }) {
  const t = useTranslations('overview');
  const s = summary?.openByStatus ?? {};
  const values = {
    new: s.new ?? 0,
    assigned: s.assigned ?? 0,
    progress: s.in_progress ?? 0,
    waiting: s.waiting ?? 0,
  };
  const total = values.new + values.assigned + values.progress + values.waiting;
  return (
    <Panel
      title={t('openTitle')}
      aside={summary ? <span className="text-section-title">{total}</span> : null}
    >
      {summary ? (
        <StackedBar
          ariaLabel={t('openAria', values)}
          segments={[
            { key: 'new', label: t('openNew'), value: values.new, color: 'primary-300' },
            {
              key: 'assigned',
              label: t('openAssigned'),
              value: values.assigned,
              color: 'ink-subtle',
            },
            { key: 'progress', label: t('openProgress'), value: values.progress, color: 'primary' },
            { key: 'waiting', label: t('openWaiting'), value: values.waiting, color: 'warning' },
          ]}
        />
      ) : (
        <SectionSkeleton rows={3} />
      )}
    </Panel>
  );
}

const LINE_TONE = { connected: 'success', error: 'danger', not_connected: 'neutral' } as const;

/** "LINE OA" connection card. Shown only to roles that may manage LINE (API: Owner/Admin). */
export function LinePanel({ slug, now }: { slug: string; now: Date }) {
  const t = useTranslations('overview');
  const { ago } = useDurationFormat();
  const channel = useQuery(lineQueries.channel());
  const c = channel.data;
  return (
    <Panel
      title={t('lineTitle')}
      gap="sm"
      align="center"
      aside={c ? <Pill tone={LINE_TONE[c.status]}>{t(`lineStatus.${c.status}`)}</Pill> : null}
    >
      {channel.isPending ? (
        <SectionSkeleton rows={3} />
      ) : channel.isError ? (
        <SectionError error={channel.error} onRetry={() => void channel.refetch()} />
      ) : (
        <dl className="text-body-sm m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          <dt className="text-ink-muted">{t('lineAccount')}</dt>
          <dd className="m-0 text-right font-mono">{c?.lineId ?? '—'}</dd>
          <dt className="text-ink-muted">{t('lineLastMessage')}</dt>
          <dd className="m-0 text-right">
            {c?.lastMessageAt ? ago(new Date(c.lastMessageAt), now) : '—'}
          </dd>
          <dt className="text-ink-muted">{t('lineToday')}</dt>
          <dd className="m-0 text-right">
            {t('lineTodayValue', {
              messages: c?.messagesToday ?? 0,
              tickets: c?.ticketsOpenedToday ?? 0,
            })}
          </dd>
        </dl>
      )}
      <Link
        href={routes.dashboard.line(slug)}
        className="min-h-touch inline-flex items-center font-semibold"
      >
        {t('lineSettings')}
      </Link>
    </Panel>
  );
}

/**
 * "คำตอบ AI เดือนนี้". GET /usage is Owner-only in plan table 17 while the design shows it to Admin
 * (docs/PROJECT.md Q15): on 403 the card is hidden instead of showing an error.
 */
export function AiUsagePanel({ slug, role }: { slug: string; role: Role }) {
  const t = useTranslations('overview');
  const format = useFormatter();
  const usage = useQuery(reportQueries.usage());
  if (usage.error instanceof ApiError && usage.error.isForbidden) return null;

  const ai = usage.data?.aiAnswers;
  const selfRate = ai?.selfResolvedRate ?? null;
  return (
    <Panel title={t('aiTitle')} gap="sm" icon={<icons.sparkle className="text-primary" />}>
      {usage.isPending ? (
        <SectionSkeleton rows={3} />
      ) : usage.isError || !ai ? (
        <SectionError error={usage.error} onRetry={() => void usage.refetch()} />
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-section-title">{format.number(ai.used)}</span>
            <span className="text-ink-muted">
              {ai.limit === null
                ? t('aiQuotaUnlimited')
                : t('aiQuota', { limit: format.number(ai.limit) })}
            </span>
          </div>
          {ai.limit !== null ? (
            <ProgressMeter label={t('aiMeter')} value={ai.used} max={ai.limit} />
          ) : null}
          {selfRate !== null ? (
            <p className="text-body-sm text-ink-muted m-0">
              {t.rich('aiSplit', {
                self: format.number(selfRate, { style: 'percent' }),
                handoff: format.number(1 - selfRate, { style: 'percent' }),
                good: (chunks) => <strong className="text-success-ink">{chunks}</strong>,
                strong: (chunks) => <strong className="text-ink">{chunks}</strong>,
              })}
            </p>
          ) : null}
        </>
      )}
      {can(role, 'knowledge.manage') ? (
        <Link
          href={routes.dashboard.knowledge(slug)}
          className="min-h-touch inline-flex items-center font-semibold"
        >
          {t('aiAddKnowledge')}
        </Link>
      ) : null}
    </Panel>
  );
}
