// Desktop AppShell (plan §21.6): Sidebar 240px + Topbar 56px.
// Layout copies the designs' flex-wrap trick: on narrow screens the sidebar wraps above the content
// ("เมนูข้างย้ายขึ้นด้านบนเมื่อจอแคบ"). Reference: docs/design/html/Main.html, OpsOverview.html.
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { icons, LogoMark } from '../icons';
import type { LinkComponent, NavItem } from './types';

export type ShellVariant = 'web' | 'console';

export function AppShell({
  sidebar,
  topbar,
  children,
}: {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface-100 text-body text-ink flex min-h-dvh flex-wrap">
      {sidebar}
      <div className="flex min-w-0 flex-[999_1_560px] flex-col">
        {topbar}
        {children}
      </div>
    </div>
  );
}

export function Sidebar({ variant, children }: { variant: ShellVariant; children: ReactNode }) {
  return (
    <aside
      className={cn(
        'text-sidebar-ink box-border flex max-w-full flex-[1_1_var(--spacing-sidebar)] flex-col gap-4 p-4',
        variant === 'console' ? 'bg-console-navy' : 'bg-navy',
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarBrand({
  variant,
  name,
  tagline,
}: {
  variant: ShellVariant;
  name: string;
  tagline: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-1 pt-1">
      <LogoMark variant={variant} />
      <div className="flex flex-col leading-[1.2]">
        {/* design 16px → body-lg (15px) per owner decision D11 */}
        <span className="text-body-lg font-bold">{name}</span>
        <span
          className={cn(
            'text-caption leading-[1.2]',
            variant === 'console' ? 'text-console-accent-ink' : 'text-sidebar-ink-muted',
          )}
        >
          {tagline}
        </span>
      </div>
    </div>
  );
}

export function SidebarNav({
  label,
  items,
  variant,
  Link = 'a' as unknown as LinkComponent,
}: {
  label: string;
  items: NavItem[];
  variant: ShellVariant;
  Link?: LinkComponent;
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1">
      {items.map((item) => {
        const Glyph = icons[item.icon];
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.current ? 'page' : undefined}
            className={cn(
              'min-h-touch box-border flex flex-[1_1_160px] items-center gap-2.5 rounded-md px-3 no-underline',
              item.current
                ? variant === 'console'
                  ? 'bg-sidebar-ink text-navy font-semibold'
                  : 'bg-primary text-on-primary font-semibold'
                : 'text-sidebar-link',
            )}
          >
            <Glyph />
            <span className="flex-1">{item.label}</span>
            {item.badge ? <NavBadge {...item.badge} /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function NavBadge({ value, label, tone }: NonNullable<NavItem['badge']>) {
  if (tone === 'muted') {
    return (
      <span className="text-caption text-sidebar-ink-muted" aria-label={label}>
        {value}
      </span>
    );
  }
  return (
    <span
      aria-label={label}
      className={cn(
        'h-5.5 min-w-5.5 text-caption box-border inline-flex items-center justify-center rounded-full',
        tone === 'danger'
          ? 'bg-danger text-on-primary min-w-6 px-[7px] font-semibold'
          : 'bg-console-accent text-navy px-1.5 font-bold',
      )}
    >
      {value}
    </span>
  );
}

export function SidebarFooter({
  variant,
  initials,
  name,
  subtitle,
}: {
  variant: ShellVariant;
  initials: string;
  name: string;
  subtitle: string;
}) {
  return (
    <div className="border-sidebar-border mt-auto flex items-center gap-2.5 border-t px-2 pb-1 pt-3">
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-9 flex-none items-center justify-center rounded-full',
          variant === 'console'
            ? 'bg-console-accent text-navy font-bold'
            : 'bg-sidebar-border text-sidebar-ink font-semibold',
        )}
      >
        {initials}
      </span>
      <span className="flex min-w-0 flex-col leading-[1.3]">
        <span className="text-body-sm font-semibold leading-[1.3]">{name}</span>
        <span className="text-caption text-sidebar-ink-muted leading-[1.3]">{subtitle}</span>
      </span>
    </div>
  );
}

export function Topbar({ children }: { children: ReactNode }) {
  return (
    <header className="min-h-topbar border-hairline bg-surface-000 box-border flex flex-wrap items-center gap-3 border-b px-6 py-1.5">
      {children}
    </header>
  );
}

export function TopbarSearch({
  id,
  label,
  placeholder,
  defaultValue,
  name = 'q',
  action,
}: {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  name?: string;
  /** Where the GET form submits (e.g. the Tickets list). */
  action?: string;
}) {
  return (
    <form role="search" action={action} className="relative m-0 max-w-[440px] flex-[1_1_260px]">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <icons.search size={18} className="text-control-border absolute left-3 top-[13px]" />
      <input
        id={id}
        name={name}
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="border-control-border bg-surface-000 text-ink box-border h-11 w-full rounded-md border pl-[38px] pr-3"
      />
    </form>
  );
}

/**
 * Page body. Every design page uses padding 24px, column flex, max-width = tokens layout.content-max.
 * `gap` differs per page in the designs (16px lists/settings, 20px dashboards).
 */
export function PageMain({
  children,
  gap = 'md',
  className,
}: {
  children: ReactNode;
  gap?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <main
      id="main"
      className={cn(
        'max-w-content box-border flex w-full flex-col p-6',
        gap === 'lg' ? 'gap-5' : 'gap-4',
        className,
      )}
    >
      {children}
    </main>
  );
}

export function TopbarSpacer() {
  return <span className="flex-[1_1_0]" />;
}
