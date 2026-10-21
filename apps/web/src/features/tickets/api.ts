// Service: tickets (Tickets, TicketDetail, Main pages — plan §21.3).
import type { paths } from '@serviceflow/contracts/api';
import { etag, unwrap } from '@serviceflow/contracts/http';
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api, type Schemas } from '@/lib/api/client';

export type TicketListQuery = NonNullable<paths['/tickets']['get']['parameters']['query']>;
type Versioned = { id: string; version: number; idempotencyKey: string };

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (query: TicketListQuery) => [...ticketKeys.lists(), query] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
  events: (id: string) => [...ticketKeys.detail(id), 'events'] as const,
  assigneeSuggestions: (id: string) => [...ticketKeys.detail(id), 'assignee-suggestions'] as const,
  counts: () => [...ticketKeys.all, 'counts'] as const,
};

export const ticketQueries = {
  list: (query: TicketListQuery) =>
    infiniteQueryOptions({
      queryKey: ticketKeys.list(query),
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(api.GET('/tickets', { params: { query: { ...query, cursor: pageParam } }, signal })),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ticketKeys.detail(id),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/tickets/{id}', { params: { path: { id } }, signal })),
    }),
  events: (id: string) =>
    infiniteQueryOptions({
      queryKey: ticketKeys.events(id),
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(
          api.GET('/tickets/{id}/events', {
            params: { path: { id }, query: { cursor: pageParam } },
            signal,
          }),
        ),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  /** Tab counts + sidebar badge. */
  counts: () =>
    queryOptions({
      queryKey: ticketKeys.counts(),
      queryFn: ({ signal }) => unwrap(api.GET('/tickets/counts', { signal })),
      refetchInterval: 60_000,
    }),
  assigneeSuggestions: (id: string) =>
    queryOptions({
      queryKey: ticketKeys.assigneeSuggestions(id),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/tickets/{id}/assignee-suggestions', { params: { path: { id } }, signal })),
    }),
};

/** After any write: put the fresh ticket in cache and refresh lists + timeline. */
function useTicketWriteSuccess() {
  const qc = useQueryClient();
  return (ticket: Schemas['Ticket']) => {
    qc.setQueryData(ticketKeys.detail(ticket.id), ticket);
    void qc.invalidateQueries({ queryKey: ticketKeys.lists() });
    void qc.invalidateQueries({ queryKey: ticketKeys.counts() });
    void qc.invalidateQueries({ queryKey: ticketKeys.events(ticket.id) });
  };
}

export function useCreateTicket() {
  const onSuccess = useTicketWriteSuccess();
  return useMutation({
    mutationFn: ({
      body,
      idempotencyKey,
    }: {
      body: Schemas['CreateTicketRequest'];
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/tickets', { params: { header: { 'Idempotency-Key': idempotencyKey } }, body }),
      ),
    onSuccess,
  });
}

export function useUpdateTicket() {
  const onSuccess = useTicketWriteSuccess();
  return useMutation({
    mutationFn: ({
      id,
      version,
      body,
    }: Omit<Versioned, 'idempotencyKey'> & { body: Schemas['UpdateTicketRequest'] }) =>
      unwrap(
        api.PATCH('/tickets/{id}', {
          params: { path: { id }, header: { 'If-Match': etag.fromVersion(version) } },
          body,
        }),
      ),
    onSuccess,
  });
}

export function useTransitionTicket() {
  const onSuccess = useTicketWriteSuccess();
  return useMutation({
    mutationFn: ({
      id,
      version,
      idempotencyKey,
      body,
    }: Versioned & { body: Schemas['TransitionRequest'] }) =>
      unwrap(
        api.POST('/tickets/{id}/transitions', {
          params: {
            path: { id },
            header: { 'Idempotency-Key': idempotencyKey, 'If-Match': etag.fromVersion(version) },
          },
          body,
        }),
      ),
    onSuccess,
  });
}

export function useAssignTicket() {
  const onSuccess = useTicketWriteSuccess();
  return useMutation({
    mutationFn: ({
      id,
      version,
      idempotencyKey,
      assigneeId,
      notify = true,
    }: Versioned & { assigneeId: string; notify?: boolean }) =>
      unwrap(
        api.POST('/tickets/{id}/assign', {
          params: {
            path: { id },
            header: { 'Idempotency-Key': idempotencyKey, 'If-Match': etag.fromVersion(version) },
          },
          body: { assigneeId, notify },
        }),
      ),
    onSuccess,
  });
}

export function useBulkAssignTickets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketIds,
      assigneeId,
      idempotencyKey,
    }: {
      ticketIds: string[];
      assigneeId: string;
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/tickets/bulk-assign', {
          params: { header: { 'Idempotency-Key': idempotencyKey } },
          body: { ticketIds, assigneeId },
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

export function useAddTicketNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: string; idempotencyKey: string }) =>
      unwrap(
        api.POST('/tickets/{id}/events', {
          params: { path: { id }, header: { 'Idempotency-Key': idempotencyKey } },
          body: { body },
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.events(id) }),
  });
}

export function useSendTicketMessage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      suggestionId,
      idempotencyKey,
    }: {
      body: string;
      suggestionId?: string;
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/tickets/{id}/messages', {
          params: { path: { id }, header: { 'Idempotency-Key': idempotencyKey } },
          body: { body, suggestionId },
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.events(id) }),
  });
}

/** AI drafts only — the agent must press "ใช้ข้อความนี้" and send (plan §21.1). */
export function useReplySuggestions(id: string) {
  return useMutation({
    mutationFn: () =>
      unwrap(api.POST('/tickets/{id}/reply-suggestions', { params: { path: { id } } })),
  });
}

export function useCreateTicketAttachment(id: string) {
  return useMutation({
    mutationFn: ({
      file,
      idempotencyKey,
    }: {
      file: Schemas['UploadRequest'];
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/tickets/{id}/attachments', {
          params: { path: { id }, header: { 'Idempotency-Key': idempotencyKey } },
          body: file,
        }),
      ),
  });
}
