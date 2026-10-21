'use client';

import { cn } from '@serviceflow/ui/lib/cn';
import { useTranslations } from 'next-intl';

export const OVERVIEW_RANGES = ['today', '7d', '30d'] as const;
export type OverviewRange = (typeof OVERVIEW_RANGES)[number];

/** Segmented toggle "วันนี้ / 7 วัน / 30 วัน" (Main.html). aria-pressed per the design. */
export function RangeToggle({
  value,
  onChange,
}: {
  value: OverviewRange;
  onChange: (v: OverviewRange) => void;
}) {
  const t = useTranslations('overview');
  return (
    <div
      role="group"
      aria-label={t('rangeLabel')}
      className="border-hairline bg-surface-000 p-0.75 inline-flex rounded-md border"
    >
      {OVERVIEW_RANGES.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={value === r}
          onClick={() => onChange(r)}
          className={cn(
            'h-9.5 cursor-pointer rounded-[6px] border-none px-3.5',
            value === r ? 'bg-navy text-on-primary font-semibold' : 'text-ink-muted bg-transparent',
          )}
        >
          {t(`range.${r}`)}
        </button>
      ))}
    </div>
  );
}
