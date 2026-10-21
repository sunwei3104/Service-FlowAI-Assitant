// Menu definitions (data only). Order, icons and destinations follow docs/design/html/Main.html
// (sidebar) and TechJobs.html (bottom nav). Labels are i18n keys in messages/th.json → "nav".
import type { IconName } from '@serviceflow/ui/icons';

import type { Permission } from './permissions';
import { routes } from './routes';

export interface NavDefinition {
  key: 'overview' | 'tickets' | 'assets' | 'knowledge' | 'line' | 'reports' | 'team' | 'settings';
  icon: IconName;
  href: (tenant: string) => string;
  /** Shown only when the role has this permission (convenience; the API still enforces). */
  permission?: Permission;
  /** `exact` = current only on this exact path (the overview is a prefix of every page). */
  match: 'exact' | 'prefix';
}

export const dashboardNav: readonly NavDefinition[] = [
  { key: 'overview', icon: 'home', href: routes.dashboard.overview, match: 'exact' },
  {
    key: 'tickets',
    icon: 'inbox',
    href: routes.dashboard.tickets,
    permission: 'tickets.view',
    match: 'prefix',
  },
  {
    key: 'assets',
    icon: 'device',
    href: routes.dashboard.assets,
    permission: 'assets.view',
    match: 'prefix',
  },
  {
    key: 'knowledge',
    icon: 'book',
    href: routes.dashboard.knowledge,
    permission: 'knowledge.manage',
    match: 'prefix',
  },
  {
    key: 'line',
    icon: 'chat',
    href: routes.dashboard.line,
    permission: 'line.manage',
    match: 'prefix',
  },
  {
    key: 'reports',
    icon: 'chart',
    href: routes.dashboard.reports,
    permission: 'reports.view',
    match: 'prefix',
  },
  {
    key: 'team',
    icon: 'team',
    href: routes.dashboard.team,
    permission: 'team.manage',
    match: 'prefix',
  },
  {
    key: 'settings',
    icon: 'sliders',
    href: routes.dashboard.settings,
    permission: 'team.manage',
    match: 'exact',
  },
];

export interface FieldNavDefinition {
  key: 'jobs' | 'scan' | 'history' | 'account';
  icon: IconName;
  href: (tenant: string) => string;
  match: 'exact' | 'prefix';
}

export const fieldNav: readonly FieldNavDefinition[] = [
  { key: 'jobs', icon: 'inbox', href: routes.field.jobs, match: 'exact' },
  { key: 'scan', icon: 'scan', href: routes.field.scan, match: 'exact' },
  { key: 'history', icon: 'clock', href: routes.field.history, match: 'exact' },
  { key: 'account', icon: 'user', href: routes.field.account, match: 'exact' },
];

export function isCurrent(pathname: string, href: string, match: 'exact' | 'prefix') {
  if (match === 'exact') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
