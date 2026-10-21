// Ticket state machine — owner decision D16 (also documented on POST /tickets/{id}/transitions).
// The UI uses it to offer only valid actions; the API enforces the same rules (and is the authority).
import type { Role } from '@/config/permissions';
import type { Schemas } from '@/lib/api/client';

type Status = Schemas['TicketStatus'];

export const TRANSITIONS: Readonly<Record<Status, readonly Status[]>> = {
  new: ['assigned', 'in_progress', 'resolved'],
  assigned: ['in_progress', 'new'],
  in_progress: ['waiting', 'resolved', 'assigned'],
  waiting: ['in_progress', 'resolved'],
  resolved: ['in_progress'],
};

/** Reopen window for resolved → in_progress by Admin/Owner. */
export const REOPEN_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type TransitionDenied =
  | 'not_allowed' // from → to is not in the table
  | 'not_owner' // agent acting on someone else's ticket
  | 'role' // viewer, or agent reopening
  | 'reopen_expired' // resolved more than 7 days ago
  | 'note_required' // to=resolved without a note
  | 'photo_required' // category requires a photo and none attached
  | 'reason_required'; // to=waiting without waitingReason

export interface TransitionInput {
  role: Role;
  userId: string;
  ticket: Pick<Schemas['Ticket'], 'status' | 'assignee' | 'resolvedAt' | 'requirePhotoOnResolve'>;
  to: Status;
  note?: string;
  waitingReason?: Schemas['WaitingReason'];
  photoCount?: number;
  now?: Date;
}

/** Returns null when allowed, otherwise the first reason it is not. */
export function checkTransition(input: TransitionInput): TransitionDenied | null {
  const { role, userId, ticket, to } = input;
  if (role === 'viewer') return 'role';
  if (!TRANSITIONS[ticket.status].includes(to)) return 'not_allowed';
  if (role === 'agent' && ticket.assignee?.id !== userId) return 'not_owner';

  if (ticket.status === 'resolved' && to === 'in_progress') {
    // Customer "not fixed yet" reopen happens server-side from LINE; in the UI only Admin/Owner may reopen.
    if (role !== 'admin' && role !== 'owner') return 'role';
    const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : 0;
    if ((input.now ?? new Date()).getTime() - resolvedAt > REOPEN_WINDOW_DAYS * DAY_MS)
      return 'reopen_expired';
  }
  if (to === 'waiting' && !input.waitingReason) return 'reason_required';
  if (to === 'resolved') {
    if (!input.note?.trim()) return 'note_required';
    if (ticket.requirePhotoOnResolve && !input.photoCount) return 'photo_required';
  }
  return null;
}

/** Statuses the current user may move this ticket to (ignores note/photo/reason, which the form collects). */
export function availableTransitions(
  input: Omit<TransitionInput, 'to' | 'note' | 'waitingReason' | 'photoCount'>,
): Status[] {
  return TRANSITIONS[input.ticket.status].filter((to) => {
    const denied = checkTransition({
      ...input,
      to,
      note: 'x',
      waitingReason: 'customer',
      photoCount: 1,
    });
    return denied === null;
  });
}
