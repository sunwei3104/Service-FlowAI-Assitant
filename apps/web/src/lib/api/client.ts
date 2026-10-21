// The ONLY way apps/web talks to services/api (plan §5.1: no hand-written fetch to URLs).
// Paths, params and bodies are type-checked against packages/contracts/openapi.yaml.
import type { components, paths } from '@serviceflow/contracts/api';
import { createApiClient } from '@serviceflow/contracts/http';

import { CSRF_COOKIE, CSRF_HEADER } from '@/config/api';
import { env } from '@/config/env';
import { routes } from '@/config/routes';

export type Schemas = components['schemas'];

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** Absolute in the browser (tests run on Node's fetch which rejects relative URLs). */
function baseUrl() {
  const base = env.NEXT_PUBLIC_API_BASE_PATH;
  return typeof window === 'undefined' ? base : `${window.location.origin}${base}`;
}

let redirecting = false;

export const api = createApiClient<paths>({
  baseUrl: baseUrl(),
  csrfHeader: CSRF_HEADER,
  getCsrfToken: () => readCookie(CSRF_COOKIE),
  onUnauthorized: () => {
    // Session expired (12h idle, plan §8.2) → back to sign-in, then return here.
    if (typeof window === 'undefined' || redirecting) return;
    redirecting = true;
    const here = `${window.location.pathname}${window.location.search}`;
    window.location.assign(routes.signIn({ returnTo: here }));
  },
});
