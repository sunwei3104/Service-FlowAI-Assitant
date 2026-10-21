// FieldShell (plan §21.6): technician mobile layout — page header + scroll body + bottom nav (4 items, ≥52px).
// Designed at 390px (tokens layout.mobile-design-width). Reference: docs/design/html/TechJobs.html.
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { icons } from '../icons';
import type { LinkComponent, NavItem } from './types';

export function FieldShell({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  return (
    <div className="max-w-mobile bg-surface-200 text-body text-ink mx-auto flex h-dvh w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      {nav}
    </div>
  );
}

/** Dark header used at the top of technician pages; content differs per page. */
export function FieldHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={cn('bg-navy text-sidebar-ink flex flex-col gap-3 px-4 pb-3.5 pt-4', className)}
    >
      {children}
    </header>
  );
}

export function FieldBottomNav({
  label,
  items,
  Link = 'a' as unknown as LinkComponent,
}: {
  label: string;
  items: NavItem[];
  Link?: LinkComponent;
}) {
  return (
    <nav
      aria-label={label}
      className="border-hairline bg-surface-000 grid grid-cols-4 border-t px-1 pb-[calc(10px+env(safe-area-inset-bottom))] pt-1.5"
    >
      {items.map((item) => {
        const Glyph = icons[item.icon];
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.current ? 'page' : undefined}
            className={cn(
              'min-h-13 text-caption flex flex-col items-center justify-center gap-0.5 no-underline',
              item.current ? 'text-primary-ink font-semibold' : 'text-ink-muted',
            )}
          >
            <Glyph size={22} strokeWidth={item.current ? 1.9 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
