// Service: console Passkey (decision D17, plan §22.3).
// (ก) first-time registration with a one-time bootstrap code from the api CLI, (ข) verify.
// Lockout (3 failures → 15 min) is enforced by the server; the UI only reflects it.
import { ApiError, unwrap } from '@serviceflow/contracts/http';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { isMocking } from '@/config/env';
import { api } from '@/lib/api/client';

import { sessionQueries } from './api';

export const passkeyKeys = { status: ['passkey-status'] as const };

export const passkeyQueries = {
  status: () =>
    queryOptions({
      queryKey: passkeyKeys.status,
      queryFn: ({ signal }) => unwrap(api.GET('/auth/passkey/status', { signal })),
      retry: false,
    }),
};

type Opaque = Record<string, unknown>;

/** In mock mode there is no real authenticator — send a placeholder instead of running the ceremony. */
async function ceremony(kind: 'register' | 'verify', options: Opaque): Promise<Opaque> {
  if (isMocking) return { mock: true };
  const result =
    kind === 'register'
      ? await startRegistration({ optionsJSON: options as never })
      : await startAuthentication({ optionsJSON: options as never });
  return result as unknown as Opaque;
}

function useOnSession() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: passkeyKeys.status });
    void qc.invalidateQueries({ queryKey: sessionQueries.me().queryKey });
  };
}

export function useRegisterPasskey() {
  const onSuccess = useOnSession();
  return useMutation({
    mutationFn: async (bootstrapCode: string) => {
      const options = await unwrap(
        api.POST('/auth/passkey/register/options', { body: { bootstrapCode } }),
      );
      const credential = await ceremony('register', options);
      await unwrap(api.POST('/auth/passkey/register/verify', { body: credential }));
    },
    onSuccess,
  });
}

export function useVerifyPasskey() {
  const onSuccess = useOnSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const options = await unwrap(api.POST('/auth/passkey/options'));
      const assertion = await ceremony('verify', options);
      await unwrap(api.POST('/auth/passkey/verify', { body: assertion }));
    },
    onSuccess,
    // A failed attempt changes attemptsRemaining / lockedUntil on the server.
    onError: (error) => {
      if (error instanceof ApiError) void qc.invalidateQueries({ queryKey: passkeyKeys.status });
    },
  });
}

/** The browser/user cancelled the WebAuthn prompt (not a failed attempt). */
export function isCeremonyCancelled(error: unknown) {
  return (
    error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'AbortError')
  );
}
