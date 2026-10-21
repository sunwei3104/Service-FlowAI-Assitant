'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { routes } from '@/config/routes';
import { ticketQueries } from '@/features/tickets/api';
import { SlaText } from '@/features/tickets/components/sla-text';
import { TicketStatusBadge } from '@/features/tickets/components/ticket-status-badge';

import { SectionError, SectionSkeleton } from './section-state';

export const ATTENTION_LIMIT = 6;

/**
 * "งานที่ต้องดูตอนนี้": open tickets, most urgent SLA first (Main.html table).
 * Selection rule = open + sort by slaDueAt (docs/PROJECT.md Q14 — confirm with the owner).
 */
export function AttentionTable({ slug, now }: { slug: string; now: Date }) {
  const t = useTranslations('overview');
  const query = useInfiniteQuery(
    ticketQueries.list({ view: 'open', sort: 'slaDueAt', limit: ATTENTION_LIMIT }),
  );
  const rows = query.data?.pages[0]?.data ?? [];

  return (
    <section
      aria-labelledby="h-now"
      className="border-hairline bg-surface-000 min-w-0 flex-[3_1_600px] rounded-lg border"
    >
      <div className="border-hairline flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <h2 id="h-now" className="text-card-title m-0">
          {t('attentionTitle')}
        </h2>
        <Link
          href={routes.dashboard.tickets(slug)}
          className="min-h-touch inline-flex items-center font-semibold"
        >
          {t('attentionAll')}
        </Link>
      </div>
      {query.isPending ? (
        <div className="px-5 py-4">
          <SectionSkeleton rows={6} />
        </div>
      ) : query.isError ? (
        <div className="px-5 py-4">
          <SectionError error={query.error} onRetry={() => void query.refetch()} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-ink-muted m-0 px-5 py-6">{t('attentionEmpty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-body w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="bg-surface-100 text-ink-muted text-left">
                <th scope="col" className="text-body-sm px-5 py-2.5 font-semibold">
                  {t('colNumber')}
                </th>
                <th scope="col" className="text-body-sm px-3 py-2.5 font-semibold">
                  {t('colProblem')}
                </th>
                <th scope="col" className="text-body-sm px-3 py-2.5 font-semibold">
                  {t('colStatus')}
                </th>
                <th scope="col" className="text-body-sm px-3 py-2.5 font-semibold">
                  {t('colAssignee')}
                </th>
                <th scope="col" className="text-body-sm py-2.5 pl-3 pr-5 font-semibold">
                  {t('colSla')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ticket) => (
                <tr key={ticket.id} className="border-hairline border-t">
                  <td className="whitespace-nowrap px-5 py-3">
                    <Link
                      href={routes.dashboard.ticket(slug, ticket.id)}
                      className="font-mono font-medium"
                    >
                      {ticket.number}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-body-sm text-ink-muted">
                      {ticket.asset
                        ? `${ticket.asset.code} · ${ticket.asset.branch}`
                        : t('noAsset')}
                    </div>
                  </td>
                  <td className="p-3">
                    <TicketStatusBadge ticket={ticket} />
                  </td>
                  <td className={ticket.assignee ? 'p-3' : 'text-ink-muted p-3'}>
                    {ticket.assignee?.displayName ?? t('unassigned')}
                  </td>
                  <td className="py-3 pl-3 pr-5">
                    <SlaText sla={ticket.sla} now={now} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
