import { useId, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface StateLayoutProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** Buttons/links rendered under the text. */
  action?: ReactNode;
  /** 'alert' for errors so screen readers announce them. */
  role?: 'status' | 'alert';
  className?: string;
}

/** Shared frame for Empty / Error / Forbidden states (plan §21.1 "ครบ 4 สถานะ"). */
export function StateLayout({
  icon,
  title,
  description,
  action,
  role = 'status',
  className,
}: StateLayoutProps) {
  const titleId = useId();
  return (
    <section
      role={role}
      aria-labelledby={titleId}
      className={cn(
        'border-hairline bg-surface-000 flex flex-col items-center justify-center gap-3 rounded-lg border px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="bg-surface-200 text-ink-muted flex size-12 items-center justify-center rounded-full"
        >
          {icon}
        </span>
      ) : null}
      <h2 id={titleId} className="text-card-title text-ink m-0">
        {title}
      </h2>
      {description ? (
        <div className="text-body text-ink-muted m-0 max-w-prose">{description}</div>
      ) : null}
      {action ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{action}</div>
      ) : null}
    </section>
  );
}
