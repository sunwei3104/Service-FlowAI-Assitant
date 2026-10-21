// Service: assets + CSV/XLSX import wizard + QR sheet (Assets page — plan §21.3).
import type { paths } from '@serviceflow/contracts/api';
import { etag, unwrap } from '@serviceflow/contracts/http';
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { api, type Schemas } from '@/lib/api/client';

export type AssetListQuery = NonNullable<paths['/assets']['get']['parameters']['query']>;

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (query: AssetListQuery) => [...assetKeys.lists(), query] as const,
  detail: (id: string) => [...assetKeys.all, 'detail', id] as const,
  imports: ['imports'] as const,
  import: (id: string) => [...assetKeys.imports, id] as const,
  importErrors: (id: string) => [...assetKeys.import(id), 'errors'] as const,
};

export const assetQueries = {
  list: (query: AssetListQuery) =>
    infiniteQueryOptions({
      queryKey: assetKeys.list(query),
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(api.GET('/assets', { params: { query: { ...query, cursor: pageParam } }, signal })),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: assetKeys.detail(id),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/assets/{id}', { params: { path: { id } }, signal })),
    }),
  /** Polls while the job is still working, stops once it reaches a final state. */
  import: (id: string) =>
    queryOptions({
      queryKey: assetKeys.import(id),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/imports/{id}', { params: { path: { id } }, signal })),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === 'validating' || status === 'importing' ? 1500 : false;
      },
    }),
  importErrors: (id: string) =>
    infiniteQueryOptions({
      queryKey: assetKeys.importErrors(id),
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        unwrap(
          api.GET('/imports/{id}/errors', {
            params: { path: { id }, query: { cursor: pageParam } },
            signal,
          }),
        ),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
};

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      idempotencyKey,
    }: {
      body: Schemas['AssetInput'];
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/assets', { params: { header: { 'Idempotency-Key': idempotencyKey } }, body }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.lists() }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      version,
      body,
    }: {
      id: string;
      version: number;
      body: Schemas['AssetInput'];
    }) =>
      unwrap(
        api.PATCH('/assets/{id}', {
          params: { path: { id }, header: { 'If-Match': etag.fromVersion(version) } },
          body,
        }),
      ),
    onSuccess: (asset) => {
      qc.setQueryData(assetKeys.detail(asset.id), asset);
      void qc.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

export function useDeactivateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(api.DELETE('/assets/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useCreateQrSheet() {
  return useMutation({
    mutationFn: (assetIds: string[]) =>
      unwrap(api.POST('/assets/qr-sheet', { body: { assetIds } })),
  });
}

/** Import step 1: create the job; the caller then PUTs the file to `upload.uploadUrl`. */
export function useCreateImport() {
  return useMutation({
    mutationFn: ({
      file,
      idempotencyKey,
    }: {
      file: Schemas['UploadRequest'];
      idempotencyKey: string;
    }) =>
      unwrap(
        api.POST('/imports', {
          params: { header: { 'Idempotency-Key': idempotencyKey } },
          body: { kind: 'assets', file },
        }),
      ),
  });
}

/** Import step 2 → 3: save the column mapping, server validates. */
export function useSetImportMapping(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      mapping: Record<string, 'code' | 'location' | 'model' | 'installedAt' | 'note' | 'skip'>,
    ) => unwrap(api.PUT('/imports/{id}/mapping', { params: { path: { id } }, body: { mapping } })),
    onSuccess: (job) => qc.setQueryData(assetKeys.import(id), job),
  });
}

/** Import step 4: import the valid rows in one transaction. */
export function useConfirmImport(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey: string) =>
      unwrap(
        api.POST('/imports/{id}/confirm', {
          params: { path: { id }, header: { 'Idempotency-Key': idempotencyKey } },
        }),
      ),
    onSuccess: (job) => {
      qc.setQueryData(assetKeys.import(id), job);
      void qc.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}
