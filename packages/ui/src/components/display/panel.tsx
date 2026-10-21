// Card section used across dashboards: white, hairline border, radius-lg, 16/20 padding, 17px title.
import { useId, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface PanelProps {
  title: ReactNode;
  /** Right side of the header (count, link, badge…). */
  aside?: ReactNode;
  /** Icon before the title. */
  icon?: ReactNode;
  children: ReactNode;
  /** Gap between rows: md = 12px, sm = 10px (per design). */
  gap?: 'sm' | 'md';
  /** baseline (numbers) or center (badges/links) for the header row. */
  align?: 'baseline' | 'center';
  className?: string;
}

export function Panel({
  title,
  aside,
  icon,
  children,
  gap = 'md',
  align = 'baseline',
  className,
}: PanelProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn(
        'border-hairline bg-surface-000 flex flex-col rounded-lg border px-5 py-4',
        gap === 'md' ? 'gap-3' : 'gap-2.5',
        className,
      )}
    >
      <div
        className={cn(
          'flex justify-between gap-2',
          align === 'baseline' ? 'items-baseline' : 'items-center',
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 id={id} className="text-card-title m-0">
            {title}
          </h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
