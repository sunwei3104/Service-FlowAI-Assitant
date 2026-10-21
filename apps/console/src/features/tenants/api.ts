// Service: tenants list/detail, plan/status, support access, audit (OpsTenants, OpsTenantDetail — plan §21.3, §22.4).
import type { paths } from '@serviceflow/contracts/console';
import { unwrap } from '@serviceflow/contracts/http';
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api, type Schemas } from '@/lib/api/client';

export type TenantListQuery = NonNullable<paths['/tenants']['get']['parameters']['query']>;

export const tenantKeys = {
  all: ['tenants'] as const,
  list: (query: TenantListQuery) => [...tenantKeys.all, 'list', query] as const,
  detail: (id: string) => [...tenantKeys.all, 'detail', id] as const,
  usage: (id: string) => [...tenantKeys.detail(id), 'usage'] as const,
  lineHealth: (id: string) => [...tenantKeys.detail(id), 'line-health'] as const,
  onboarding: (id: string) => [...tenantKeys.detail(id), 'onboarding'] as const,
  supportAccess: (id: string) => [...tenantKeys.detail(id), 'support-access'] as const,
  audit: (id: string) => [...tenantKeys.detail(id), 'audit'] as const,
  platformAudit: ['platform-audit'] as const,
};

const byId = (id: string) => ({ params: { path: { id } } });

export const tenantQueries = {
  list: (query: TenantListQuery) =>
    infiniteQueryOptions({
      queryKey: tenantKeys.list(query),
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(api.GET('/tenants', { params: { query: { ...query, cursor: pageParam } }, signal })),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: tenantKeys.detail(id),
      queryFn: ({ signal }) => unwrap(api.GET('/tenants/{id}', { ...byId(id), signal })),
    }),
  usage: (id: string) =>
    queryOptions({
      queryKey: tenantKeys.usage(id),
      queryFn: ({ signal }) => unwrap(api.GET('/tenants/{id}/usage', { ...byId(id), signal })),
    }),
  lineHealth: (id: string) =>
    queryOptions({
      queryKey: tenantKeys.lineHealth(id),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/tenants/{id}/line-health', { ...byId(id), signal })),
    }),
  onboarding: (id: string) =>
    queryOptions({
      queryKey: tenantKeys.onboarding(id),
      queryFn: ({ signal }) => unwrap(api.GET('/tenants/{id}/onboarding', { ...byId(id), signal })),
    }),
  supportAccess: (id: string) =>
    queryOptions({
      queryKey: tenantKeys.supportAccess(id),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/tenants/{id}/support-access-requests', { ...byId(id), signal })),
    }),
  audit: (id: string) =>
    infiniteQueryOptions({
      queryKey: tenantKeys.audit(id),
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(
          api.GET('/tenants/{id}/audit', {
            params: { path: { id }, query: { cursor: pageParam } },
            signal,
          }),
        ),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  platformAudit: () =>
    infiniteQueryOptions({
      queryKey: tenantKeys.platformAudit,
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(api.GET('/audit', { params: { query: { cursor: pageParam } }, signal })),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
};

export function useRequestSupportAccess(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      idempotencyKey,
    }: {
      body: {
        reason: string;
        durationMinutes: 30 | 60 | 120;
        scopes: Schemas['SupportAccessScope'][];
      };
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/tenants/{id}/support-access-requests', {
          params: { path: { id: tenantId }, header: { 'Idempotency-Key': idempotencyKey } },
          body,
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.supportAccess(tenantId) }),
  });
}

export function useUpdateTenantPlan(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { plan?: Schemas['PlanCode']; trialEndsAt?: string }) =>
      unwrap(api.PATCH('/tenants/{id}/plan', { params: { path: { id: tenantId } }, body })),
    onSuccess: (tenant) => {
      qc.setQueryData(tenantKeys.detail(tenantId), tenant);
      void qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useUpdateTenantStatus(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status: 'active' | 'suspended'; reason: string }) =>
      unwrap(api.PATCH('/tenants/{id}/status', { params: { path: { id: tenantId } }, body })),
    onSuccess: (tenant) => {
      qc.setQueryData(tenantKeys.detail(tenantId), tenant);
      void qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
