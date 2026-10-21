import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePending } from '@/components/page-pending';
import { RequirePermission } from '@/components/require-permission';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('jobs') };
}

export default async function Page() {
  const t = await getTranslations('pages');
  return (
    <RequirePermission permission="tickets.claim">
      <PagePending title={t('jobs')} design="TechJobs" variant="field" />
    </RequirePermission>
  );
}
