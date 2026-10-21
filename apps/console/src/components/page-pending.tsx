import { PageMain } from '@serviceflow/ui/shell';
import { EmptyState } from '@serviceflow/ui/states';
import { getTranslations } from 'next-intl/server';

/**
 * TEMPORARY placeholder for pages that HAVE a design but are not built yet.
 * Replace with the real page when it is built from docs/design/html/<design>.html
 * (checklist in docs/PROJECT.md → "สถานะหน้าจอ").
 */
export async function PagePending({
  title,
  design,
  variant = 'desktop',
}: {
  title: string;
  design: string;
  variant?: 'desktop' | 'field';
}) {
  const t = await getTranslations('states');
  const body = (
    <>
      <h1 className="text-page-title m-0">{title}</h1>
      <EmptyState
        title={t('pendingTitle')}
        description={t('pendingDescription', { design: `${design}.html` })}
      />
    </>
  );
  return variant === 'field' ? (
    <div className="flex flex-col gap-4 p-4">{body}</div>
  ) : (
    <PageMain>{body}</PageMain>
  );
}
