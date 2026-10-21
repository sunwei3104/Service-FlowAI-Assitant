'use client';

import { ApiError } from '@serviceflow/contracts/http';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { authRoutes } from '@/config/routes';
import { sessionQueries } from '@/features/session/api';

import { OperatorProvider } from './console-context';
import { QueryErrorState } from './query-state';

/**
 * Renders the console only with a Passkey-verified console session (plan §22.3).
 * 401 → /passkey (register or verify, decision D17), then back to the page that was requested.
 */
export function ConsoleGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const me = useQuery(sessionQueries.me());
  const needsPasskey = me.error instanceof ApiError && me.error.isUnauthorized;

  useEffect(() => {
    if (needsPasskey) router.replace(authRoutes.passkey(pathname));
  }, [needsPasskey, pathname, router]);

  if (me.isPending || needsPasskey) return fallback;
  if (me.isError) return <QueryErrorState error={me.error} onRetry={() => void me.refetch()} />;
  return <OperatorProvider value={me.data}>{children}</OperatorProvider>;
}
