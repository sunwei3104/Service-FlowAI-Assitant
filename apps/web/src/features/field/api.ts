// Service: technician (Agent) mobile flow — plan §21.5. Lists reuse the tickets service with assignee=me.
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { api, type Schemas } from '@/lib/api/client';

import { ticketKeys } from '../tickets/api';

export const fieldKeys = {
  checklist: (id: string) => [...ticketKeys.detail(id), 'checklist'] as const,
};

export const fieldQueries = {
  checklist: (id: string) =>
    queryOptions({
      queryKey: fieldKeys.checklist(id),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/tickets/{id}/checklist', { params: { path: { id } }, signal })),
    }),
};

function useOnTicket() {
  const qc = useQueryClient();
  return (ticket: Schemas['Ticket']) => {
    qc.setQueryData(ticketKeys.detail(ticket.id), ticket);
    void qc.invalidateQueries({ queryKey: ticketKeys.lists() });
  };
}

export function useClaimTicket() {
  const onSuccess = useOnTicket();
  return useMutation({
    mutationFn: ({ id, idempotencyKey }: { id: string; idempotencyKey: string }) =>
      unwrap(
        api.POST('/tickets/{id}/claim', {
          params: { path: { id }, header: { 'Idempotency-Key': idempotencyKey } },
        }),
      ),
    onSuccess,
  });
}

export function useReleaseTicket() {
  const onSuccess = useOnTicket();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      idempotencyKey,
    }: {
      id: string;
      reason: string;
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/tickets/{id}/release', {
          params: { path: { id }, header: { 'Idempotency-Key': idempotencyKey } },
          body: { reason },
        }),
      ),
    onSuccess,
  });
}

export function useUpdateChecklist(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; done: boolean }[]) =>
      unwrap(api.PATCH('/tickets/{id}/checklist', { params: { path: { id } }, body: { items } })),
    onSuccess: (checklist) => qc.setQueryData(fieldKeys.checklist(id), checklist),
  });
}
