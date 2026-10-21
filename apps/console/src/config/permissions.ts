// Mirror of plan §22.3 table 48 (platform roles). UI convenience only — /console/v1 enforces.
import type { components } from '@serviceflow/contracts/console';

export type PlatformRole = components['schemas']['PlatformRole'];

const matrix = {
  'overview.view': ['platform_owner', 'platform_support', 'platform_readonly'],
  'jobs.retry': ['platform_owner', 'platform_support'], // support: only jobs of a tenant (server check)
  'supportAccess.request': ['platform_owner', 'platform_support'],
  'tenants.changePlan': ['platform_owner'],
  'tenants.breakGlass': ['platform_owner'],
  'operators.manage': ['platform_owner'],
} as const satisfies Record<string, readonly PlatformRole[]>;

export type Permission = keyof typeof matrix;

export function can(role: PlatformRole | undefined, permission: Permission): boolean {
  return role !== undefined && (matrix[permission] as readonly PlatformRole[]).includes(role);
}
