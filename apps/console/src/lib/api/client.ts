// The ONLY way apps/console talks to /console/v1 (plan §5.1, §7.6).
// Typed against packages/contracts/console.openapi.yaml — never the customer API.
import type { components, paths } from '@serviceflow/contracts/console';
import { createApiClient } from '@serviceflow/contracts/http';

import { CSRF_COOKIE, CSRF_HEADER } from '@/config/api';
import { env } from '@/config/env';

export type Schemas = components['schemas'];

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function baseUrl() {
  const base = env.NEXT_PUBLIC_API_BASE_PATH;
  return typeof window === 'undefined' ? base : `${window.location.origin}${base}`;
}

// 401 = no Passkey-verified console session. The ConsoleGate shows the "verify Passkey" state;
// there is no customer-style sign-in page here (Cloudflare Access sits in front, plan §22.3).
export const api = createApiClient<paths>({
  baseUrl: baseUrl(),
  csrfHeader: CSRF_HEADER,
  getCsrfToken: () => readCookie(CSRF_COOKIE),
});
