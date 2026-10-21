'use client';

import { initials } from '@serviceflow/ui/lib/initials';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@serviceflow/ui/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { routes } from '@/config/routes';
import { useLogout } from '@/features/session/api';

import { useTenant } from '../tenant-context';

/**
 * Topbar avatar menu (decision D17): name + email + role, switch company (only when the user
 * belongs to more than one), sign out, sign out on every device (POST /auth/logout?all=true).
 */
export function AccountMenu() {
  const t = useTranslations();
  const router = useRouter();
  const { me, membership } = useTenant();
  const logout = useLogout();
  const otherCompanies = me.memberships.filter((m) => m.tenantId !== membership.tenantId);

  const signOut = (all: boolean) =>
    logout.mutate(all, { onSettled: () => router.replace(routes.signIn()) });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="bg-primary-subtle text-primary-ink size-11 cursor-pointer rounded-full border-none font-bold"
        >
          {/* Visible initials + screen-reader name (an aria-label would hide the visible text, WCAG 2.5.3). */}
          <span aria-hidden="true">{initials(me.user.displayName)}</span>
          <span className="sr-only">{t('shell.myAccount', { name: me.user.displayName })}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-ink font-semibold">{me.user.displayName}</span>
          {me.user.email ? (
            <span className="text-body-sm text-ink-muted font-normal">{me.user.email}</span>
          ) : null}
          <span className="text-caption text-ink-muted font-normal">
            {t(`roles.${membership.role}`)}
          </span>
        </DropdownMenuLabel>
        {otherCompanies.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-caption text-ink-muted">
                {t('shell.switchTenant')}
              </DropdownMenuLabel>
              {otherCompanies.map((m) => (
                <DropdownMenuItem key={m.tenantId} asChild>
                  <Link href={routes.dashboard.overview(m.tenantSlug)}>
                    {t('shell.switchTenantTo', { name: m.tenantName })}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={logout.isPending} onSelect={() => signOut(false)}>
          {t('shell.signOut')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={logout.isPending} onSelect={() => signOut(true)}>
          {t('shell.signOutAll')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
