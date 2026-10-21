'use client';

import { icons } from '@serviceflow/ui/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@serviceflow/ui/ui/dropdown-menu';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { routes } from '@/config/routes';
import { initials } from '@serviceflow/ui/lib/initials';

import { useTenant } from '../tenant-context';

/** Sidebar company button (docs/design/html/Main.html). Lists the user's other companies to switch. */
export function TenantSwitcher() {
  const t = useTranslations('shell');
  const { membership, me } = useTenant();
  const companyName = membership.tenantName.replace(/^บริษัท\s*/, '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="min-h-13 border-sidebar-border bg-sidebar-surface text-sidebar-ink box-border flex w-full cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-2 text-left"
        >
          <span
            aria-hidden="true"
            className="bg-primary-subtle text-body-sm text-primary-ink inline-flex size-8 flex-none items-center justify-center rounded-[6px] font-bold"
          >
            {initials(companyName)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-[1.3]">
            <span className="text-body-sm truncate font-semibold leading-[1.3]">
              {membership.tenantName}
            </span>
            {membership.planName ? (
              <span className="text-caption text-sidebar-ink-muted leading-[1.3]">
                {t('planLabel', { plan: membership.planName })}
              </span>
            ) : null}
          </span>
          <span className="sr-only">{t('switchTenant')}</span>
          <icons.chevronDown size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuLabel>{t('switchTenant')}</DropdownMenuLabel>
        {me.memberships.map((m) => (
          <DropdownMenuItem key={m.tenantId} asChild disabled={m.tenantId === membership.tenantId}>
            <Link href={routes.dashboard.overview(m.tenantSlug)}>{m.tenantName}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
