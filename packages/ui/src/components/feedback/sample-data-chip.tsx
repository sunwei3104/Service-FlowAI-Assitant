import { cn } from '../../lib/cn';

export interface SampleDataChipProps {
  label: string;
  className?: string;
}

/** "ข้อมูลตัวอย่าง" chip shown on every page of a demo tenant (plan §21.6). Matches docs/design/html/Main.html. */
export function SampleDataChip({ label, className }: SampleDataChipProps) {
  return (
    <span
      className={cn(
        'h-6.5 bg-warning-subtle text-caption text-warning-ink inline-flex items-center rounded-full px-2.5 font-semibold',
        className,
      )}
    >
      {label}
    </span>
  );
}
