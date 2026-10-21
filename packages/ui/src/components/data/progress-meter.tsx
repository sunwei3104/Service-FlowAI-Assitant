// ProgressMeter (plan §21.6): 8px track. Reference: Main.html "คำตอบ AI เดือนนี้" / "ปัญหาที่พบบ่อย".
import { cn } from '../../lib/cn';

export interface ProgressMeterProps {
  label: string;
  value: number;
  max: number;
  /** track: hairline (quota) or surface-200 (share bars); fill: primary or neutral. */
  track?: 'hairline' | 'surface';
  fill?: 'primary' | 'neutral';
  rounded?: 'track' | 'both';
}

export function ProgressMeter({
  label,
  value,
  max,
  track = 'hairline',
  fill = 'primary',
  rounded = 'track',
}: ProgressMeterProps) {
  const pct = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'h-2 overflow-hidden rounded-full',
        track === 'hairline' ? 'bg-hairline' : 'bg-surface-200',
      )}
    >
      <div
        className={cn(
          'h-full',
          fill === 'primary' ? 'bg-primary' : 'bg-ink-subtle',
          rounded === 'both' && 'rounded-full',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
