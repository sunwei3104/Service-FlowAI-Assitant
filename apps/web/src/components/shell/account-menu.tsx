'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@serviceflow/ui/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { routes } from '@/config/routes';
import { useLogout } from '@/features/session/api';
import { initials } from '@serviceflow/ui/lib/initials';

import { useTenant } from '../tenant-context';

/**
 * Topbar avatar (docs/design/html/Main.html). The design shows only the button; the menu content
 * is not designed yet — it holds sign-out only (see docs/PROJECT.md open questions).
 */
export function AccountMenu() {
  const t = useTranslations();
  const router = useRouter();
  const { me } = useTenant();
  const logout = useLogout();

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
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{me.user.displayName}</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={logout.isPending}
          onSelect={() =>
            logout.mutate(false, { onSettled: () => router.replace(routes.signIn()) })
          }
        >
          {t('auth.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
