// Fixture times are relative to "now" so SLA timers look like the designs whenever the dev server runs.
export const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
export const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString();
export const daysAgo = (d: number) => minutesAgo(d * 24 * 60);
export const dateOnly = (iso: string) => iso.slice(0, 10);

/** Deterministic fake UUIDs, readable in devtools: uuid('ticket', 148). */
const PREFIX: Record<string, string> = {
  tenant: '10000000',
  user: '20000000',
  ticket: '30000000',
  asset: '40000000',
  category: '50000000',
  event: '60000000',
  doc: '70000000',
  misc: '90000000',
};
export const uuid = (kind: keyof typeof PREFIX, n: number) =>
  `${PREFIX[kind]}-0000-4000-8000-${String(n).padStart(12, '0')}`;
