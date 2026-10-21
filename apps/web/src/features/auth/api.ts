// Service: sign-in helpers (plan §8.1). Sign-in itself is a full-page navigation to the
// backend's OIDC start URL (not a fetch), because the identity provider redirects the browser.
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions } from '@tanstack/react-query';

import { env, isMocking } from '@/config/env';
import { routes, safeReturnTo } from '@/config/routes';
import { api } from '@/lib/api/client';

export type AuthProvider = 'line' | 'google';

export const authQueries = {
  workspace: (slug: string) =>
    queryOptions({
      queryKey: ['workspace-public', slug],
      queryFn: ({ signal }) =>
        unwrap(api.GET('/workspaces/{slug}/public', { params: { path: { slug } }, signal })),
      staleTime: Infinity,
      retry: false,
    }),
};

/** URL the sign-in button navigates to. In mock mode there is no OIDC, so go straight to the demo tenant. */
export function signInUrl(
  provider: AuthProvider,
  opts: { tenant?: string; returnTo?: string },
): string {
  const returnTo = safeReturnTo(opts.returnTo);
  if (isMocking)
    return returnTo ?? routes.dashboard.overview(opts.tenant ?? env.NEXT_PUBLIC_MOCK_TENANT);

  const qs = new URLSearchParams();
  if (opts.tenant) qs.set('tenant', opts.tenant);
  if (returnTo) qs.set('returnTo', returnTo);
  const query = qs.toString();
  return `${env.NEXT_PUBLIC_API_BASE_PATH}/auth/${provider}/start${query ? `?${query}` : ''}`;
}
