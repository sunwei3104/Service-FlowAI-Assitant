import { shouldRetry } from '@serviceflow/contracts/http';
import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry, refetchOnWindowFocus: true },
      // Mutations are never retried automatically; the user retries with the same Idempotency-Key.
      mutations: { retry: false },
    },
  });
}
