'use client';

import { Button } from '@serviceflow/ui/ui/button';
import { ErrorState } from '@serviceflow/ui/states';
import { useTranslations } from 'next-intl';

/** Unexpected render error inside the app. Error details stay in the console/Sentry, never on screen. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  return (
    <main
      id="main"
      className="max-w-content mx-auto flex min-h-dvh items-center justify-center p-6"
    >
      <ErrorState
        title={t('states.errorTitle')}
        description={t('states.errorDescription')}
        requestId={error.digest}
        requestIdLabel={t('common.requestId')}
        action={
          <Button type="button" onClick={reset}>
            {t('common.retry')}
          </Button>
        }
      />
    </main>
  );
}
