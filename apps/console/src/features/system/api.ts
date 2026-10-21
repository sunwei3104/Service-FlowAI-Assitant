// Service: system health, queue/dead jobs, backups, deploys, AI cost/evals (OpsSystem — plan §21.3).
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export const systemKeys = {
  services: ['system', 'services'] as const,
  queue: ['system', 'queue'] as const,
  backups: ['system', 'backups'] as const,
  deploys: ['system', 'deploys'] as const,
  aiCosts: ['ai', 'costs'] as const,
  aiEvals: ['ai', 'evals'] as const,
};

export const systemQueries = {
  services: () =>
    queryOptions({
      queryKey: systemKeys.services,
      queryFn: ({ signal }) => unwrap(api.GET('/system/services', { signal })),
      refetchInterval: 30_000,
    }),
  queue: () =>
    queryOptions({
      queryKey: systemKeys.queue,
      queryFn: ({ signal }) => unwrap(api.GET('/system/queue', { signal })),
      refetchInterval: 30_000,
    }),
  backups: () =>
    queryOptions({
      queryKey: systemKeys.backups,
      queryFn: ({ signal }) => unwrap(api.GET('/system/backups', { signal })),
    }),
  deploys: () =>
    queryOptions({
      queryKey: systemKeys.deploys,
      queryFn: ({ signal }) => unwrap(api.GET('/system/deploys', { signal })),
    }),
  aiCosts: () =>
    queryOptions({
      queryKey: systemKeys.aiCosts,
      queryFn: ({ signal }) => unwrap(api.GET('/ai/costs', { signal })),
    }),
  aiEvals: () =>
    queryOptions({
      queryKey: systemKeys.aiEvals,
      queryFn: ({ signal }) => unwrap(api.GET('/ai/evals', { signal })),
    }),
};

/** Retry or discard a dead job (plan §22.3: owner, or support for tenant jobs). */
export function useDeadJobAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'retry' | 'discard' }) =>
      action === 'retry'
        ? unwrap(api.POST('/system/jobs/{id}/retry', { params: { path: { id } } }))
        : unwrap(api.POST('/system/jobs/{id}/discard', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: systemKeys.queue }),
  });
}
