// Service: sign-in helpers (plan §8.1). Sign-in itself is a full-page navigation to the
// backend's OIDC start URL (not a fetch), because the identity provider redirects the browser.
// Decision D15: no public company lookup — the company name is shown only for a valid invitation token.
import { unwrap } from '@serviceflow/contracts/http';
import { queryOptions } from '@tanstack/react-query';

import { env, isMocking } from '@/config/env';
import { routes, safeReturnTo } from '@/config/routes';
import { api } from '@/lib/api/client';

export type AuthProvider = 'line' | 'google';

/** Invitation tokens are opaque; reject obviously malformed values before calling the API. */
export const INVITE_TOKEN = /^[A-Za-z0-9_-]{20,200}$/;

export const authQueries = {
  invitation: (token: string) =>
    queryOptions({
      queryKey: ['invitation-preview', token],
      queryFn: ({ signal }) => unwrap(api.POST('/invitation-preview', { body: { token }, signal })),
      staleTime: Infinity,
      retry: false,
    }),
};

/** URL the sign-in button navigates to. In mock mode there is no OIDC, so go straight to the demo tenant. */
export function signInUrl(
  provider: AuthProvider,
  opts: { invite?: string; returnTo?: string },
): string {
  const returnTo = safeReturnTo(opts.returnTo);
  if (isMocking) return returnTo ?? routes.dashboard.overview(env.NEXT_PUBLIC_MOCK_TENANT);

  const qs = new URLSearchParams();
  if (opts.invite) qs.set('invite', opts.invite);
  if (returnTo) qs.set('returnTo', returnTo);
  const query = qs.toString();
  return `${env.NEXT_PUBLIC_API_BASE_PATH}/auth/${provider}/start${query ? `?${query}` : ''}`;
}
