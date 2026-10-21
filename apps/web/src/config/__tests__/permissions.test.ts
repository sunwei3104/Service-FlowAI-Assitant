import { can } from '../permissions';

// Spot checks against plan §8.3 (permission matrix).
describe('can()', () => {
  it('only owner manages billing and decides support access', () => {
    expect(can('owner', 'billing.manage')).toBe(true);
    expect(can('admin', 'billing.manage')).toBe(false);
    expect(can('owner', 'supportAccess.decide')).toBe(true);
    expect(can('admin', 'supportAccess.decide')).toBe(false);
  });

  it('agents cannot assign tickets or manage LINE', () => {
    expect(can('agent', 'tickets.assign')).toBe(false);
    expect(can('agent', 'line.manage')).toBe(false);
    expect(can('agent', 'tickets.claim')).toBe(true);
  });

  it('viewers are read-only', () => {
    expect(can('viewer', 'tickets.view')).toBe(true);
    expect(can('viewer', 'tickets.create')).toBe(false);
  });

  it('no role → nothing', () => {
    expect(can(undefined, 'tickets.view')).toBe(false);
  });
});
