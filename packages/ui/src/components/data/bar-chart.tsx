// Vertical bar chart (plan §21.6). Reference: Main.html "Ticket 7 วันล่าสุด":
// plot 172px high, tallest bar 140px, value above each bar, last bar highlighted.
export interface Bar {
  key: string;
  label: string;
  value: number;
  highlight?: boolean;
}

const MAX_BAR_PX = 140;

export function BarChart({ bars, ariaLabel }: { bars: Bar[]; ariaLabel: string }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <>
      <div
        role="img"
        aria-label={ariaLabel}
        className="border-hairline h-43 flex items-end gap-2.5 border-b pt-2"
      >
        {bars.map((b) => (
          <div key={b.key} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={
                b.highlight ? 'text-caption text-ink font-semibold' : 'text-caption text-ink-muted'
              }
            >
              {b.value}
            </span>
            <span
              className={
                b.highlight
                  ? 'bg-primary w-full rounded-t-sm'
                  : 'bg-primary-200 w-full rounded-t-sm'
              }
              style={{ height: `${Math.round((b.value / max) * MAX_BAR_PX)}px` }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="text-caption text-ink-muted flex gap-2.5 text-center">
        {bars.map((b) => (
          <span key={b.key} className={b.highlight ? 'text-ink flex-1 font-semibold' : 'flex-1'}>
            {b.label}
          </span>
        ))}
      </div>
    </>
  );
}
