'use client';

import { ApiError } from '@serviceflow/contracts/http';
import { ForbiddenState } from '@serviceflow/ui/states';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { sessionQueries } from '@/features/session/api';

import { OperatorProvider } from './console-context';
import { QueryErrorState } from './query-state';

/**
 * Renders the console only with a Passkey-verified console session (plan §22.3).
 * 401 → "verify Passkey" state (the Passkey screen has no design yet — docs/PROJECT.md).
 */
export function ConsoleGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const t = useTranslations('states');
  const me = useQuery(sessionQueries.me());

  if (me.isPending) return fallback;
  if (me.isError) {
    if (me.error instanceof ApiError && me.error.isUnauthorized) {
      return (
        <main
          id="main"
          className="max-w-content mx-auto flex min-h-dvh items-center justify-center p-6"
        >
          <ForbiddenState
            title={t('sessionRequiredTitle')}
            description={t('sessionRequiredDescription')}
          />
        </main>
      );
    }
    return <QueryErrorState error={me.error} onRetry={() => void me.refetch()} />;
  }
  return <OperatorProvider value={me.data}>{children}</OperatorProvider>;
}
