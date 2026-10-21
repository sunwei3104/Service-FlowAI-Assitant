'use client';

import { SampleDataChip } from '@serviceflow/ui/feedback/sample-data-chip';
import { icons } from '@serviceflow/ui/icons';
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

import { dashboardNav, isCurrent } from '@/config/navigation';
import { can } from '@/config/permissions';
import { routes } from '@/config/routes';
import { ticketQueries } from '@/features/tickets/api';
import { initials } from '@serviceflow/ui/lib/initials';

import { useTenant } from '../tenant-context';
import { AccountMenu } from './account-menu';
import { TenantSwitcher } from './tenant-switcher';

/** Desktop shell for Owner/Admin/Viewer pages. Reference: docs/design/html/Main.html. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const { slug, membership, me } = useTenant();
  const role = membership.role;

  const counts = useQuery({ ...ticketQueries.counts(), enabled: can(role, 'tickets.view') });

  const items: NavItem[] = dashboardNav
    .filter((d) => !d.permission || can(role, d.permission))
    .map((d) => {
      const href = d.href(slug);
      const unassigned = d.key === 'tickets' ? counts.data?.unassigned : undefined;
      return {
        key: d.key,
        href,
        label: t(`nav.${d.key}`),
        icon: d.icon,
        current: isCurrent(pathname, href, d.match),
        badge: unassigned
          ? {
              value: unassigned,
              tone: 'danger',
              label: t('shell.ticketsBadge', { count: unassigned }),
            }
          : undefined,
      };
    });

  return (
    <AppShell
      sidebar={
        <Sidebar variant="web">
          <SidebarBrand
            variant="web"
            name={t('shell.brandName')}
            tagline={t('shell.brandTagline')}
          />
          <TenantSwitcher />
          <SidebarNav variant="web" label={t('shell.mainNav')} items={items} Link={Link} />
          <SidebarFooter
            variant="web"
            initials={initials(me.user.displayName)}
            name={me.user.displayName}
            subtitle={t(`roles.${role}`)}
          />
        </Sidebar>
      }
      topbar={
        <Topbar>
          <TopbarSearch
            id="q"
            label={t('shell.searchLabel')}
            placeholder={t('shell.searchPlaceholder')}
            action={routes.dashboard.tickets(slug)}
          />
          {me.sampleData ? <SampleDataChip label={t('common.sampleData')} /> : null}
          <TopbarSpacer />
          {can(role, 'tickets.create') ? (
            <Link
              href={routes.dashboard.tickets(slug)}
              className="bg-primary text-on-primary hover:text-on-primary inline-flex h-11 items-center gap-2 rounded-md px-4 font-semibold no-underline"
            >
              <icons.plus size={18} />
              {t('shell.createTicket')}
            </Link>
          ) : null}
          {/* Bell hidden: no in-app notifications in MVP — staff are notified on LINE via the outbox (decision D17). */}
          <AccountMenu />
        </Topbar>
      }
    >
      {children}
    </AppShell>
  );
}
