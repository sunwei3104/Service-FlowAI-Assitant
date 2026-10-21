import { PageMain } from '@serviceflow/ui/shell';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { RequirePermission } from '@/components/require-permission';
import { SettingsTabs } from '@/features/settings/components/settings-tabs';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('settings') };
}

export default async function Page() {
  const t = await getTranslations('pages');
  return (
    <RequirePermission permission="team.manage">
      <PageMain>
        <h1 className="text-page-title m-0">{t('settings')}</h1>
        <SettingsTabs />
      </PageMain>
    </RequirePermission>
  );
}
