// Service: knowledge base, "try asking AI", unanswered questions, AI rules (Knowledge page — plan §21.3).
import type { paths } from '@serviceflow/contracts/api';
import { unwrap } from '@serviceflow/contracts/http';
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api, type Schemas } from '@/lib/api/client';

export type KnowledgeListQuery = NonNullable<
  paths['/knowledge/documents']['get']['parameters']['query']
>;

export const knowledgeKeys = {
  all: ['knowledge'] as const,
  documents: (query: KnowledgeListQuery) => [...knowledgeKeys.all, 'documents', query] as const,
  gaps: (days: 7 | 30) => [...knowledgeKeys.all, 'gaps', days] as const,
  aiSettings: ['ai-settings'] as const,
};

export const knowledgeQueries = {
  documents: (query: KnowledgeListQuery) =>
    infiniteQueryOptions({
      queryKey: knowledgeKeys.documents(query),
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(
          api.GET('/knowledge/documents', {
            params: { query: { ...query, cursor: pageParam } },
            signal,
          }),
        ),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  gaps: (days: 7 | 30 = 7) =>
    queryOptions({
      queryKey: knowledgeKeys.gaps(days),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/knowledge/gaps', { params: { query: { days } }, signal })),
    }),
  aiSettings: () =>
    queryOptions({
      queryKey: knowledgeKeys.aiSettings,
      queryFn: ({ signal }) => unwrap(api.GET('/ai/settings', { signal })),
    }),
};

export function useCreateKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      idempotencyKey,
    }: {
      body: Schemas['CreateKnowledgeDocumentRequest'];
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/knowledge/documents', {
          params: { header: { 'Idempotency-Key': idempotencyKey } },
          body,
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.all }),
  });
}

export function useDeleteKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE('/knowledge/documents/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.all }),
  });
}

export function useSearchKnowledge() {
  return useMutation({
    mutationFn: (query: string) => unwrap(api.POST('/knowledge/search', { body: { query } })),
  });
}

export function useUpdateAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas['AiSettings']) => unwrap(api.PUT('/ai/settings', { body })),
    onSuccess: (data) => qc.setQueryData(knowledgeKeys.aiSettings, data),
  });
}
