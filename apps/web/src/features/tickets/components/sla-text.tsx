'use client';

import { cn } from '@serviceflow/ui/lib/cn';
import { useTranslations } from 'next-intl';

import type { Schemas } from '@/lib/api/client';
import { useDurationFormat } from '@/lib/format/use-duration';

/**
 * SLA text (plan §21.6 SlaTimer): "เกิน 25 นาที" (danger) · "เหลือ 40 นาที" (warning when at risk) ·
 * "เหลือ 2 ชม." (muted) · "หยุดนับระหว่างรอ" · "ปิดทันเวลา" (success). State comes from the API.
 */
export function SlaText({
  sla,
  now,
  className,
}: {
  sla: Schemas['Sla'];
  now: Date;
  className?: string;
}) {
  const t = useTranslations('tickets.sla');
  const { duration } = useDurationFormat();
  const minutesLeft = sla.dueAt ? (new Date(sla.dueAt).getTime() - now.getTime()) / 60_000 : null;

  let text: string;
  let tone: string;
  switch (sla.state) {
    case 'paused':
      text = t('paused');
      tone = 'text-ink-muted';
      break;
    case 'met':
      text = t('met');
      tone = 'text-success-ink font-medium';
      break;
    case 'missed':
      text = t('missed');
      tone = 'text-danger-ink font-semibold';
      break;
    default:
      if (minutesLeft === null) {
        text = t('none');
        tone = 'text-ink-muted';
      } else if (minutesLeft < 0 || sla.state === 'breached') {
        text = t('breached', { duration: duration(Math.max(-minutesLeft, 0)) });
        tone = 'text-danger-ink font-semibold';
      } else {
        text = t('remaining', { duration: duration(minutesLeft) });
        tone = sla.state === 'at_risk' ? 'text-warning-ink font-semibold' : 'text-ink-muted';
      }
  }
  return <span className={cn('whitespace-nowrap', tone, className)}>{text}</span>;
}
