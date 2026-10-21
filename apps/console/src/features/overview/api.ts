// Service: platform overview + alerts (OpsOverview — plan §21.3).
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export const overviewQueries = {
  overview: () =>
    queryOptions({
      queryKey: ['overview'],
      queryFn: ({ signal }) => unwrap(api.GET('/overview', { signal })),
    }),
  alerts: () =>
    queryOptions({
      queryKey: ['alerts'],
      queryFn: ({ signal }) => unwrap(api.GET('/alerts', { signal })),
      refetchInterval: 60_000,
    }),
};
