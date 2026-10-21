'use client';

import { SampleDataChip } from '@serviceflow/ui/feedback/sample-data-chip';
import { initials } from '@serviceflow/ui/lib/initials';
import {
  AppShell,
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarNav,
  Topbar,
  TopbarSearch,
  TopbarSpacer,
  type NavItem,
} from '@serviceflow/ui/shell';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { isMocking } from '@/config/env';
import { consoleNav, isCurrent } from '@/config/navigation';
import { routes } from '@/config/routes';
import { overviewQueries } from '@/features/overview/api';

import { useOperator } from '../console-context';
import { EnvironmentBadge } from './environment-badge';

/** Owner console shell (darker navy + amber accent). Reference: docs/design/html/OpsOverview.html. */
export function ConsoleShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const operator = useOperator();
  const overview = useQuery(overviewQueries.overview());
  const alerts = useQuery(overviewQueries.alerts());

  const tenantCount = overview.data?.activeTenants;
  const systemAlerts = alerts.data?.data.filter(
    (a) => a.severity === 'critical' || a.severity === 'warning',
  ).length;

  const items: NavItem[] = consoleNav.map((d) => ({
    key: d.key,
    href: d.href,
    label: t(`nav.${d.key}`),
    icon: d.icon,
    current: isCurrent(pathname, d.href, d.match),
    badge:
      d.key === 'tenants' && tenantCount
        ? {
            value: tenantCount,
            tone: 'muted',
            label: t('shell.tenantsCount', { count: tenantCount }),
          }
        : d.key === 'system' && systemAlerts
          ? {
              value: systemAlerts,
              tone: 'accent',
              label: t('shell.systemAlerts', { count: systemAlerts }),
            }
          : undefined,
  }));

  return (
    <AppShell
      sidebar={
        <Sidebar variant="console">
          <SidebarBrand
            variant="console"
            name={t('shell.brandName')}
            tagline={t('shell.brandTagline')}
          />
          <EnvironmentBadge environment={operator.environment} />
          <SidebarNav variant="console" label={t('shell.mainNav')} items={items} Link={Link} />
          <SidebarFooter
            variant="console"
            initials={initials(operator.displayName)}
            name={operator.displayName}
            subtitle={t('shell.operatorSubtitle', { role: t(`roles.${operator.role}`) })}
          />
        </Sidebar>
      }
      topbar={
        <Topbar>
          <TopbarSearch
            id="oq"
            label={t('shell.searchLabel')}
            placeholder={t('shell.searchPlaceholder')}
            action={routes.tenants()}
          />
          {/* The console contract has no demo flag; the chip shows while running on mock data. */}
          {isMocking ? <SampleDataChip label={t('common.sampleData')} /> : null}
          <TopbarSpacer />
          <span className="text-body-sm text-ink-muted">{t('shell.privacyNote')}</span>
        </Topbar>
      }
    >
      {children}
    </AppShell>
  );
}
