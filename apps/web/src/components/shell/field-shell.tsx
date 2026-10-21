'use client';

import { FieldBottomNav, FieldShell as Shell, type NavItem } from '@serviceflow/ui/shell';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { fieldNav, isCurrent } from '@/config/navigation';

import { useTenant } from '../tenant-context';

/** Technician mobile shell (header comes from each page). Reference: docs/design/html/TechJobs.html. */
export function FieldShell({ children }: { children: ReactNode }) {
  const t = useTranslations('fieldNav');
  const pathname = usePathname();
  const { slug } = useTenant();

  const items: NavItem[] = fieldNav.map((d) => {
    const href = d.href(slug);
    return {
      key: d.key,
      href,
      label: t(d.key),
      icon: d.icon,
      current: isCurrent(pathname, href, d.match),
    };
  });

  return (
    <Shell nav={<FieldBottomNav label={t('label')} items={items} Link={Link} />}>{children}</Shell>
  );
}
