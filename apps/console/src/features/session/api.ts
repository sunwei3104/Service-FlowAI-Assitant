// Service: current platform operator (sidebar footer, environment badge).
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export const sessionQueries = {
  me: () =>
    queryOptions({
      queryKey: ['console-me'],
      queryFn: ({ signal }) => unwrap(api.GET('/me', { signal })),
      staleTime: 5 * 60_000,
    }),
};
