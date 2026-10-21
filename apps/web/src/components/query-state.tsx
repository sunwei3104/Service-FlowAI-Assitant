'use client';

import { ApiError } from '@serviceflow/contracts/http';
import { Button } from '@serviceflow/ui/ui/button';
import { ErrorState, ForbiddenState } from '@serviceflow/ui/states';
import { useTranslations } from 'next-intl';

/**
 * Maps a failed query to the right page state (plan §21.1 "ครบ 4 สถานะ"):
 * 403 → Forbidden, 404 → Not found, anything else → Error with request id + retry.
 * (401 never reaches here — the API client redirects to sign-in.)
 */
export function QueryErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations('states');
  const tc = useTranslations('common');

  if (error instanceof ApiError && error.isForbidden) {
    return <ForbiddenState title={t('forbiddenTitle')} description={t('forbiddenDescription')} />;
  }
  if (error instanceof ApiError && error.isNotFound) {
    return <ErrorState title={t('notFoundTitle')} description={t('notFoundDescription')} />;
  }
  return (
    <ErrorState
      title={t('errorTitle')}
      description={t('errorDescription')}
      requestId={error instanceof ApiError ? error.problem.requestId : undefined}
      requestIdLabel={tc('requestId')}
      action={
        onRetry ? (
          <Button type="button" onClick={onRetry}>
            {tc('retry')}
          </Button>
        ) : undefined
      }
    />
  );
}
