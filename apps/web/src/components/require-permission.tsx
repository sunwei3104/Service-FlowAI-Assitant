'use client';

import { PageMain } from '@serviceflow/ui/shell';
import { ForbiddenState } from '@serviceflow/ui/states';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { can, type Permission } from '@/config/permissions';

import { useTenant } from './tenant-context';

/** Page-level role check (convenience only — the API returns 403 regardless, plan §8.3). */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const t = useTranslations('states');
  const { membership } = useTenant();
  if (!can(membership.role, permission)) {
    return (
      <PageMain>
        <ForbiddenState title={t('forbiddenTitle')} description={t('forbiddenDescription')} />
      </PageMain>
    );
  }
  return children;
}
