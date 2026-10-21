// Console menu (data only). Order/icons follow docs/design/html/OpsOverview.html.
import type { IconName } from '@serviceflow/ui/icons';

import { routes } from './routes';

export interface ConsoleNavDefinition {
  key: 'overview' | 'tenants' | 'system' | 'ai' | 'supportAccess' | 'audit';
  icon: IconName;
  href: string;
  match: 'exact' | 'prefix';
}

export const consoleNav: readonly ConsoleNavDefinition[] = [
  { key: 'overview', icon: 'dashboard', href: routes.overview(), match: 'exact' },
  { key: 'tenants', icon: 'building', href: routes.tenants(), match: 'prefix' },
  { key: 'system', icon: 'pulse', href: routes.system(), match: 'prefix' },
  { key: 'ai', icon: 'sparkle', href: routes.ai(), match: 'prefix' },
  { key: 'supportAccess', icon: 'lock', href: routes.supportAccess(), match: 'prefix' },
  { key: 'audit', icon: 'document', href: routes.audit(), match: 'prefix' },
];

export function isCurrent(pathname: string, href: string, match: 'exact' | 'prefix') {
  if (match === 'exact') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
