// Service: reports, usage/plan, audit log, exports (Main + Reports pages — plan §21.3).
import type { paths } from '@serviceflow/contracts/api';
import { unwrap } from '@serviceflow/contracts/http';
import { infiniteQueryOptions, queryOptions, useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export type ReportRange = NonNullable<paths['/reports/summary']['get']['parameters']['query']>;

export const reportKeys = {
  all: ['reports'] as const,
  summary: (range: ReportRange) => [...reportKeys.all, 'summary', range] as const,
  sla: (range: ReportRange) => [...reportKeys.all, 'sla', range] as const,
  technicians: (range: ReportRange) => [...reportKeys.all, 'technicians', range] as const,
  assets: (range: ReportRange) => [...reportKeys.all, 'assets', range] as const,
  usage: ['usage'] as const,
  subscription: ['subscription'] as const,
  audit: ['audit-logs'] as const,
};

export const reportQueries = {
  summary: (range: ReportRange) =>
    queryOptions({
      queryKey: reportKeys.summary(range),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/reports/summary', { params: { query: range }, signal })),
    }),
  sla: (range: ReportRange) =>
    queryOptions({
      queryKey: reportKeys.sla(range),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/reports/sla', { params: { query: range }, signal })),
    }),
  technicians: (range: ReportRange) =>
    queryOptions({
      queryKey: reportKeys.technicians(range),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/reports/technicians', { params: { query: range }, signal })),
    }),
  assets: (range: ReportRange) =>
    queryOptions({
      queryKey: reportKeys.assets(range),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/reports/assets', { params: { query: range }, signal })),
    }),
  usage: () =>
    queryOptions({
      queryKey: reportKeys.usage,
      queryFn: ({ signal }) => unwrap(api.GET('/usage', { signal })),
    }),
  subscription: () =>
    queryOptions({
      queryKey: reportKeys.subscription,
      queryFn: ({ signal }) => unwrap(api.GET('/subscription', { signal })),
    }),
  audit: () =>
    infiniteQueryOptions({
      queryKey: reportKeys.audit,
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(api.GET('/audit-logs', { params: { query: { cursor: pageParam } }, signal })),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
};

export function useExportReport() {
  return useMutation({
    mutationFn: ({ format, range }: { format: 'xlsx' | 'pdf'; range: ReportRange }) =>
      unwrap(api.GET('/reports/export', { params: { query: { format, ...range } } })),
  });
}
