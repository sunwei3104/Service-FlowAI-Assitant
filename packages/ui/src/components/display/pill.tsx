// Rounded status pill with a leading dot — the badge used for ticket status, LINE status, etc.
// Reference: docs/design/html/Main.html (height 24, padding 0 10, 13px/500, 6px dot in currentColor).
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type PillTone = 'new' | 'neutral' | 'progress' | 'warning' | 'success' | 'danger';

const TONES: Record<PillTone, string> = {
  new: 'bg-primary-subtle text-status-new',
  neutral: 'bg-surface-200 text-status-assigned',
  progress: 'bg-status-progress text-on-primary',
  warning: 'bg-warning-subtle text-status-waiting',
  success: 'bg-success-subtle text-status-resolved',
  danger: 'bg-danger-subtle text-danger-ink',
};

export function Pill({
  tone,
  children,
  className,
}: {
  tone: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'h-badge text-body-sm inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-medium',
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
