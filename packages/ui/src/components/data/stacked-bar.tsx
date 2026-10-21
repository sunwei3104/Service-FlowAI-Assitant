// Horizontal stacked bar + legend (Main.html "งานที่เปิดอยู่"). Read out as text via aria-label (plan §21.6).
import { cn } from '../../lib/cn';

export type SegmentColor = 'primary-300' | 'ink-subtle' | 'primary' | 'warning';
const BG: Record<SegmentColor, string> = {
  'primary-300': 'bg-primary-300',
  'ink-subtle': 'bg-ink-subtle',
  primary: 'bg-primary',
  warning: 'bg-warning',
};

export interface Segment {
  key: string;
  label: string;
  value: number;
  color: SegmentColor;
}

export function StackedBar({ segments, ariaLabel }: { segments: Segment[]; ariaLabel: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <>
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex h-3 gap-0.5 overflow-hidden rounded-full"
      >
        {segments.map((s) =>
          s.value > 0 ? (
            <span
              key={s.key}
              className={BG[s.color]}
              style={{ width: `${total ? (s.value / total) * 100 : 0}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="text-body-sm text-ink-muted m-0 grid list-none grid-cols-2 gap-x-4 gap-y-1.5 p-0">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn('size-2.5 rounded-[3px]', BG[s.color])} />
            {s.label}
            <strong className="text-ink ml-auto">{s.value}</strong>
          </li>
        ))}
      </ul>
    </>
  );
}
