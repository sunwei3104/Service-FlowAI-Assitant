import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePending } from '@/components/page-pending';
import { RequirePermission } from '@/components/require-permission';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('line') };
}

export default async function Page() {
  const t = await getTranslations('pages');
  return (
    <RequirePermission permission="line.manage">
      <PagePending title={t('line')} design="LineSettings" />
    </RequirePermission>
  );
}
