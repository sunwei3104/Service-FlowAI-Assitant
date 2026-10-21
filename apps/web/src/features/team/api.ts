// Service: members, invitations, tenant security, support access (Team page — plan §21.3, §22.4).
import type { paths } from '@serviceflow/contracts/api';
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { api, type Schemas } from '@/lib/api/client';

type SupportAccessQuery = NonNullable<
  paths['/support-access/requests']['get']['parameters']['query']
>;

export const teamKeys = {
  members: ['members'] as const,
  invitations: ['invitations'] as const,
  security: ['tenant-security'] as const,
  supportAccess: (query: SupportAccessQuery) => ['support-access', query] as const,
  supportAccessAll: ['support-access'] as const,
};

export const teamQueries = {
  members: () =>
    queryOptions({
      queryKey: teamKeys.members,
      queryFn: ({ signal }) => unwrap(api.GET('/members', { signal })),
    }),
  invitations: () =>
    queryOptions({
      queryKey: teamKeys.invitations,
      queryFn: ({ signal }) => unwrap(api.GET('/invitations', { signal })),
    }),
  security: () =>
    queryOptions({
      queryKey: teamKeys.security,
      queryFn: ({ signal }) => unwrap(api.GET('/tenant/security', { signal })),
    }),
  supportAccess: (query: SupportAccessQuery = {}) =>
    queryOptions({
      queryKey: teamKeys.supportAccess(query),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/support-access/requests', { params: { query }, signal })),
    }),
};

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: { role?: Schemas['TenantRole']; area?: string | null };
    }) => unwrap(api.PATCH('/members/{userId}', { params: { path: { userId } }, body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      unwrap(api.DELETE('/members/{userId}', { params: { path: { userId } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members }),
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      role,
      email,
      idempotencyKey,
    }: {
      role: Schemas['TenantRole'];
      email?: string;
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/invitations', {
          params: { header: { 'Idempotency-Key': idempotencyKey } },
          body: { role, email },
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.invitations }),
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE('/invitations/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.invitations }),
  });
}

export function useUpdateTenantSecurity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas['TenantSecurity']) => unwrap(api.PUT('/tenant/security', { body })),
    onSuccess: (data) => qc.setQueryData(teamKeys.security, data),
  });
}

type SupportDecision = 'approve' | 'deny';
export function useDecideSupportAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: SupportDecision }) =>
      decision === 'approve'
        ? unwrap(api.POST('/support-access/requests/{id}/approve', { params: { path: { id } } }))
        : unwrap(api.POST('/support-access/requests/{id}/deny', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.supportAccessAll }),
  });
}

export function useRevokeSupportAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.POST('/support-access/grants/{id}/revoke', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.supportAccessAll }),
  });
}
