'use client';

import { useTranslations } from 'next-intl';

import type { Schemas } from '@/lib/api/client';

/** "● Production · สิงคโปร์  v1.8.2" box under the console logo (OpsOverview.html). */
export function EnvironmentBadge({
  environment,
}: {
  environment: Schemas['Operator']['environment'];
}) {
  const t = useTranslations();
  return (
    <div className="border-sidebar-border text-body-sm flex items-center gap-2 rounded-md border px-2.5 py-2">
      <span aria-hidden="true" className="bg-online size-2 rounded-full" />
      <span className="flex-1">
        {t('shell.environment', {
          env: t(`environments.${environment.name}`),
          region: environment.region,
        })}
      </span>
      <span className="text-caption text-sidebar-ink-muted font-mono">{environment.version}</span>
    </div>
  );
}
