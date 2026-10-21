'use client';

import { StatusBadge } from '@serviceflow/ui/display/status-badge';
import { useTranslations } from 'next-intl';

import type { Schemas } from '@/lib/api/client';

/** Status pill with the right Thai label — waiting shows its reason (รอลูกค้าตอบ / รออะไหล่). */
export function TicketStatusBadge({
  ticket,
}: {
  ticket: Pick<Schemas['TicketSummary'], 'status' | 'waitingReason'>;
}) {
  const t = useTranslations('tickets');
  const label =
    ticket.status === 'waiting'
      ? t(`waiting.${ticket.waitingReason ?? 'unknown'}`)
      : t(`status.${ticket.status}`);
  return <StatusBadge status={ticket.status} label={label} />;
}
