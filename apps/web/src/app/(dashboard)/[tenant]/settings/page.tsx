import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ComingSoon } from '@/components/coming-soon';
import { RequirePermission } from '@/components/require-permission';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('settings') };
}

export default async function Page() {
  const t = await getTranslations('pages');
  return (
    <RequirePermission permission="team.manage">
      <ComingSoon title={t('settings')} />
    </RequirePermission>
  );
}
