// StatusBadge (plan §21.6): the 5 ticket statuses, always with text (color is only a helper, plan §21.1).
import { Pill, type PillTone } from './pill';

export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting' | 'resolved';

const TONE: Record<TicketStatus, PillTone> = {
  new: 'new',
  assigned: 'neutral',
  in_progress: 'progress',
  waiting: 'warning',
  resolved: 'success',
};

/** `label` comes from the app's messages (e.g. "รออะไหล่" for waiting + parts). */
export function StatusBadge({ status, label }: { status: TicketStatus; label: string }) {
  return <Pill tone={TONE[status]}>{label}</Pill>;
}
