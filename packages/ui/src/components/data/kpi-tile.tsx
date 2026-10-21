// KpiTile (plan §21.6). Whole tile is a link in the designs. Reference: Main.html KPI row.
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

import { cn } from '../../lib/cn';

type LinkLike = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }
>;

export type KpiDot = 'primary' | 'navy' | 'warning' | 'success';
const DOT: Record<KpiDot, string> = {
  primary: 'bg-primary',
  navy: 'bg-navy',
  warning: 'bg-warning',
  success: 'bg-success',
};

export interface KpiTileProps {
  href: string;
  label: string;
  value: string;
  detail: ReactNode;
  dot: KpiDot;
  /** Render the detail in success-ink (e.g. "ทันเวลา SLA 16 จาก 18 งาน"). */
  detailTone?: 'muted' | 'success';
  Link?: LinkLike;
}

export function KpiTile({
  href,
  label,
  value,
  detail,
  dot,
  detailTone = 'muted',
  Link = 'a' as unknown as LinkLike,
}: KpiTileProps) {
  return (
    <Link
      href={href}
      className="border-hairline bg-surface-000 text-ink hover:text-ink py-4.5 flex flex-col gap-1.5 rounded-lg border px-5 no-underline"
    >
      <span className="text-ink-muted flex items-center justify-between font-medium">
        {label}
        <span aria-hidden="true" className={cn('size-2.5 rounded-full', DOT[dot])} />
      </span>
      <span className="text-kpi leading-[1.1]">{value}</span>
      <span
        className={cn(
          'text-body-sm',
          detailTone === 'success' ? 'text-success-ink font-medium' : 'text-ink-muted',
        )}
      >
        {detail}
      </span>
    </Link>
  );
}
