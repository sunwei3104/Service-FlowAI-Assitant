import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PagePending } from '@/components/page-pending';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('system') };
}

export default async function Page() {
  const t = await getTranslations('pages');
  return <PagePending title={t('system')} design="OpsSystem" />;
}
