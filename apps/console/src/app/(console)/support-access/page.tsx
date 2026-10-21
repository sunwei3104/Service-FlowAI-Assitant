import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ComingSoon } from '@/components/coming-soon';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('supportAccess') };
}

export default async function Page() {
  const t = await getTranslations('pages');
  return <ComingSoon title={t('supportAccess')} />;
}
