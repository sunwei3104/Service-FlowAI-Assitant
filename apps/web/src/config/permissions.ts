// Mirror of the permission matrix in plan §8.3 (v1.0 + v1.1).
// UI uses it only to hide/disable things — the API enforces every rule again (plan §8.3).
import type { components } from '@serviceflow/contracts/api';

export type Role = components['schemas']['TenantRole'];

const matrix = {
  'tickets.view': ['owner', 'admin', 'agent', 'viewer'],
  'tickets.create': ['owner', 'admin', 'agent'],
  'tickets.transition': ['owner', 'admin', 'agent'], // agent: own tickets only (server-side object check)
  'tickets.assign': ['owner', 'admin'],
  'tickets.delete': ['owner', 'admin'],
  'tickets.reply': ['owner', 'admin', 'agent'],
  'tickets.claim': ['owner', 'admin', 'agent'],
  'assets.view': ['owner', 'admin', 'agent', 'viewer'], // table 17: GET /assets minimum role = Viewer
  'assets.manage': ['owner', 'admin'],
  'knowledge.manage': ['owner', 'admin'],
  'line.manage': ['owner', 'admin'],
  'team.manage': ['owner', 'admin'],
  'billing.manage': ['owner'],
  'audit.view': ['owner', 'admin'],
  'reports.view': ['owner', 'admin', 'agent', 'viewer'], // agent: own numbers only
  'security.manage': ['owner'],
  'supportAccess.decide': ['owner'],
  'supportAccess.revoke': ['owner', 'admin'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof matrix;

export function can(role: Role | undefined, permission: Permission): boolean {
  return role !== undefined && (matrix[permission] as readonly Role[]).includes(role);
}
