// Service: current user, memberships, active tenant, sign-out (plan §7.4 /me, /auth/*).
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export const sessionKeys = {
  me: ['me'] as const,
};

export const sessionQueries = {
  me: () =>
    queryOptions({
      queryKey: sessionKeys.me,
      queryFn: ({ signal }) => unwrap(api.GET('/me', { signal })),
      staleTime: 5 * 60_000,
    }),
};

/** Switching tenant changes what every endpoint returns → drop all cached data of the old tenant. */
export function useSetActiveTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => unwrap(api.POST('/me/active-tenant', { body: { tenantId } })),
    onSuccess: (me) => {
      // Keep the `me` query (observed by TenantGate); drop everything that belongs to a tenant.
      qc.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionKeys.me[0] });
      qc.setQueryData(sessionKeys.me, me);
    },
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (available: boolean) =>
      unwrap(api.PUT('/me/availability', { body: { available } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (all: boolean = false) =>
      unwrap(api.POST('/auth/logout', { params: { query: { all } } })),
    onSettled: () => qc.clear(),
  });
}
