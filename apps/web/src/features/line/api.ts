// Service: LINE OA connection, welcome/menu/hours, problem categories + SLA (LineSettings page — plan §21.3).
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { api, type Schemas } from '@/lib/api/client';

export const lineKeys = {
  channel: ['line', 'channel'] as const,
  settings: ['line', 'settings'] as const,
  categories: ['problem-categories'] as const,
};

export const lineQueries = {
  channel: () =>
    queryOptions({
      queryKey: lineKeys.channel,
      queryFn: ({ signal }) => unwrap(api.GET('/line/channel', { signal })),
    }),
  settings: () =>
    queryOptions({
      queryKey: lineKeys.settings,
      queryFn: ({ signal }) => unwrap(api.GET('/line/settings', { signal })),
    }),
  categories: () =>
    queryOptions({
      queryKey: lineKeys.categories,
      queryFn: ({ signal }) => unwrap(api.GET('/problem-categories', { signal })),
      staleTime: 5 * 60_000,
    }),
};

/** Secrets are write-only: send them only when rotating, never read back (SecretField, plan §21.6). */
export function useUpdateLineChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas['LineChannelInput']) => unwrap(api.PUT('/line/channel', { body })),
    onSuccess: (data) => qc.setQueryData(lineKeys.channel, data),
  });
}

export function useVerifyLineChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST('/line/channel/verify')),
    onSuccess: () => qc.invalidateQueries({ queryKey: lineKeys.channel }),
  });
}

export function useUpdateLineSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas['LineSettings']) => unwrap(api.PUT('/line/settings', { body })),
    onSuccess: (data) => qc.setQueryData(lineKeys.settings, data),
  });
}

export function useCreateProblemCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      idempotencyKey,
    }: {
      body: Schemas['ProblemCategoryInput'];
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/problem-categories', {
          params: { header: { 'Idempotency-Key': idempotencyKey } },
          body,
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: lineKeys.categories }),
  });
}

export function useUpdateProblemCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas['ProblemCategoryInput'] }) =>
      unwrap(api.PATCH('/problem-categories/{id}', { params: { path: { id } }, body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: lineKeys.categories }),
  });
}

export function useDeleteProblemCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE('/problem-categories/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: lineKeys.categories }),
  });
}
