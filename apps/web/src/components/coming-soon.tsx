import { PageMain } from '@serviceflow/ui/shell';
import { EmptyState } from '@serviceflow/ui/states';
import { Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/**
 * "เร็ว ๆ นี้" page for menus that exist in the designs but have no page design yet.
 * Decision (owner, 2026-10-22): keep the route so the menu works, show this EmptyState, design later.
 */
export async function ComingSoon({
  title,
  variant = 'desktop',
}: {
  title: string;
  variant?: 'desktop' | 'field';
}) {
  const t = await getTranslations('states');
  const body = (
    <>
      <h1 className="text-page-title m-0">{title}</h1>
      <EmptyState
        icon={<Clock className="size-6" />}
        title={t('comingSoonTitle')}
        description={t('comingSoonDescription')}
      />
    </>
  );
  return variant === 'field' ? (
    <div className="flex flex-col gap-4 p-4">{body}</div>
  ) : (
    <PageMain>{body}</PageMain>
  );
}
