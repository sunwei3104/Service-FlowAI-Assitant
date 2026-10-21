import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { OverviewPage } from '@/features/overview/components/overview-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('overview') };
}

export default function Page() {
  return <OverviewPage />;
}
