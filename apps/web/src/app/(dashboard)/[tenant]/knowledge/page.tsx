import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePending } from '@/components/page-pending';
import { RequirePermission } from '@/components/require-permission';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('knowledge') };
}

export default async function Page() {
  const t = await getTranslations('pages');
  return (
    <RequirePermission permission="knowledge.manage">
      <PagePending title={t('knowledge')} design="Knowledge" />
    </RequirePermission>
  );
}
