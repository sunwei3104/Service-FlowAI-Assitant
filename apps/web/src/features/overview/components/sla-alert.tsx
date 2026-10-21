'use client';

import { icons } from '@serviceflow/ui/icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { routes } from '@/config/routes';
import { ticketQueries } from '@/features/tickets/api';
import { useDurationFormat } from '@/lib/format/use-duration';

const MENTION_MAX = 3;

/** Amber banner "2 งานเกินเวลา SLA · …" — first thing on the page (plan §21.1). Hidden when none. */
export function SlaAlert({ slug, now }: { slug: string; now: Date }) {
  const t = useTranslations('overview');
  const { duration } = useDurationFormat();
  const breached = useInfiniteQuery({
    ...ticketQueries.list({ sla: 'breached', sort: 'slaDueAt', limit: 50 }),
    select: (data) => ({ tickets: data.pages[0]?.data ?? [], total: data.pages[0]?.total ?? 0 }),
  });
  if (!breached.data || breached.data.total === 0) return null;

  const mentions = breached.data.tickets.slice(0, MENTION_MAX).map((ticket) => {
    const overdue = ticket.sla.dueAt
      ? (now.getTime() - new Date(ticket.sla.dueAt).getTime()) / 60_000
      : 0;
    const values = { number: ticket.number, duration: duration(overdue) };
    return ticket.assignee ? t('slaOverdue', values) : t('slaUnassigned', values);
  });

  return (
    <div
      role="alert"
      className="border-warning bg-warning-subtle text-warning-900 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3"
    >
      <icons.alertTriangle size={22} className="text-warning-ink" />
      <p className="m-0 flex-[1_1_280px]">
        <strong className="font-bold">{t('slaAlert', { count: breached.data.total })}</strong> ·{' '}
        {mentions.join(t('slaJoin'))}
      </p>
      <Link
        href={`${routes.dashboard.tickets(slug)}?view=sla_breached`}
        className="min-h-touch text-warning-900 hover:text-warning-900 inline-flex items-center gap-1.5 font-semibold"
      >
        {t('slaLink')}
        <icons.arrowRight size={16} />
      </Link>
    </div>
  );
}
