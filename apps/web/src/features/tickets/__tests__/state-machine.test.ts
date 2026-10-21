import { availableTransitions, checkTransition, type TransitionInput } from '../state-machine';

const me = { id: 'u-me', displayName: 'ฉัน' };
const other = { id: 'u-other', displayName: 'คนอื่น' };
const base = (over: Partial<TransitionInput['ticket']> = {}): TransitionInput['ticket'] => ({
  status: 'in_progress',
  assignee: me,
  resolvedAt: null,
  requirePhotoOnResolve: false,
  ...over,
});

describe('ticket state machine (decision D16)', () => {
  it('follows the transition table', () => {
    const t = (status: TransitionInput['ticket']['status']) =>
      availableTransitions({
        role: 'admin',
        userId: me.id,
        ticket: base({ status, resolvedAt: new Date().toISOString() }),
      });
    expect(t('new')).toEqual(['assigned', 'in_progress', 'resolved']);
    expect(t('assigned')).toEqual(['in_progress', 'new']);
    expect(t('in_progress')).toEqual(['waiting', 'resolved', 'assigned']);
    expect(t('waiting')).toEqual(['in_progress', 'resolved']);
    expect(t('resolved')).toEqual(['in_progress']);
  });

  it('rejects transitions outside the table', () => {
    expect(
      checkTransition({
        role: 'admin',
        userId: me.id,
        ticket: base({ status: 'new' }),
        to: 'waiting',
      }),
    ).toBe('not_allowed');
  });

  it('agents act only on their own tickets; admins on all', () => {
    const ticket = base({ assignee: other });
    expect(
      checkTransition({
        role: 'agent',
        userId: me.id,
        ticket,
        to: 'waiting',
        waitingReason: 'parts',
      }),
    ).toBe('not_owner');
    expect(
      checkTransition({
        role: 'admin',
        userId: me.id,
        ticket,
        to: 'waiting',
        waitingReason: 'parts',
      }),
    ).toBeNull();
  });

  it('viewers cannot change status', () => {
    expect(
      checkTransition({
        role: 'viewer',
        userId: me.id,
        ticket: base(),
        to: 'waiting',
        waitingReason: 'parts',
      }),
    ).toBe('role');
  });

  it('resolved needs a note, and a photo when the category requires it', () => {
    expect(checkTransition({ role: 'agent', userId: me.id, ticket: base(), to: 'resolved' })).toBe(
      'note_required',
    );
    const photoTicket = base({ requirePhotoOnResolve: true });
    expect(
      checkTransition({
        role: 'agent',
        userId: me.id,
        ticket: photoTicket,
        to: 'resolved',
        note: 'ok',
      }),
    ).toBe('photo_required');
    expect(
      checkTransition({
        role: 'agent',
        userId: me.id,
        ticket: photoTicket,
        to: 'resolved',
        note: 'ok',
        photoCount: 1,
      }),
    ).toBeNull();
  });

  it('waiting needs a reason', () => {
    expect(checkTransition({ role: 'agent', userId: me.id, ticket: base(), to: 'waiting' })).toBe(
      'reason_required',
    );
  });

  it('reopen: admin/owner within 7 days only', () => {
    const now = new Date('2026-10-22T00:00:00Z');
    const recent = base({ status: 'resolved', resolvedAt: '2026-10-18T00:00:00Z' });
    const old = base({ status: 'resolved', resolvedAt: '2026-10-10T00:00:00Z' });
    expect(
      checkTransition({ role: 'owner', userId: me.id, ticket: recent, to: 'in_progress', now }),
    ).toBeNull();
    expect(
      checkTransition({ role: 'owner', userId: me.id, ticket: old, to: 'in_progress', now }),
    ).toBe('reopen_expired');
    expect(
      checkTransition({ role: 'agent', userId: me.id, ticket: recent, to: 'in_progress', now }),
    ).toBe('role');
  });
});
