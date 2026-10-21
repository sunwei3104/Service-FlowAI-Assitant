'use client';

import { ApiError } from '@serviceflow/contracts/http';
import { Skeleton } from '@serviceflow/ui/ui/skeleton';
import { useTranslations } from 'next-intl';

/** Loading placeholder for one dashboard section. */
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}

/** Compact error inside a section, so one failing widget does not blank the whole page. */
export function SectionError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const t = useTranslations();
  return (
    <div role="alert" className="text-body-sm text-danger-ink flex flex-wrap items-center gap-2">
      {t('overview.sectionError')}
      {error instanceof ApiError && error.problem.requestId ? (
        <span className="text-ink-muted">
          ({t('common.requestId')}: <code className="font-mono">{error.problem.requestId}</code>)
        </span>
      ) : null}
      <button
        type="button"
        onClick={onRetry}
        className="text-primary-ink min-h-touch cursor-pointer font-semibold underline"
      >
        {t('common.retry')}
      </button>
    </div>
  );
}
