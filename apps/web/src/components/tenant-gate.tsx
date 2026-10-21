'use client';

import { ForbiddenState } from '@serviceflow/ui/states';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';

import { sessionQueries, useSetActiveTenant } from '@/features/session/api';

import { QueryErrorState } from './query-state';
import { TenantProvider } from './tenant-context';

/**
 * Makes the URL tenant and the session's active tenant the same before any tenant data loads.
 * The API scopes every request by the session's active tenant (plan §3.4), so rendering children
 * while they differ could show company A's data under company B's URL.
 */
export function TenantGate({
  slug,
  children,
  fallback,
}: {
  slug: string;
  children: ReactNode;
  fallback: ReactNode;
}) {
  const t = useTranslations('states');
  const me = useQuery(sessionQueries.me());
  const switchTenant = useSetActiveTenant();

  const membership = me.data?.memberships.find((m) => m.tenantSlug === slug);
  const needsSwitch = Boolean(
    membership && me.data && me.data.activeTenantId !== membership.tenantId,
  );

  useEffect(() => {
    if (needsSwitch && membership && switchTenant.isIdle) switchTenant.mutate(membership.tenantId);
  }, [needsSwitch, membership, switchTenant]);

  if (me.isPending) return fallback;
  if (me.isError) return <QueryErrorState error={me.error} onRetry={() => void me.refetch()} />;
  if (!membership) {
    return (
      <ForbiddenState
        title={t('tenantNotFoundTitle')}
        description={t('tenantNotFoundDescription')}
      />
    );
  }
  if (switchTenant.isError)
    return <QueryErrorState error={switchTenant.error} onRetry={() => switchTenant.reset()} />;
  if (needsSwitch) return fallback;

  return <TenantProvider value={{ slug, membership, me: me.data }}>{children}</TenantProvider>;
}
