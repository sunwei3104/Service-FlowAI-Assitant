import { EmptyState } from '@serviceflow/ui/states';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { routes } from '@/config/routes';

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <main
      id="main"
      className="max-w-content mx-auto flex min-h-dvh items-center justify-center p-6"
    >
      <EmptyState
        title={t('states.notFoundTitle')}
        description={t('states.notFoundDescription')}
        action={<Link href={routes.overview()}>{t('common.backHome')}</Link>}
      />
    </main>
  );
}
