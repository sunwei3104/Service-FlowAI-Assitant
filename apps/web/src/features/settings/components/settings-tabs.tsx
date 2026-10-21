'use client';

import { EmptyState } from '@serviceflow/ui/states';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@serviceflow/ui/ui/tabs';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

const TABS = ['company', 'plan', 'profile'] as const;

/** /[tenant]/settings — tabs from decision D18; every tab is "เร็ว ๆ นี้" until designed. */
export function SettingsTabs() {
  const t = useTranslations('settings');
  const ts = useTranslations('states');
  return (
    <Tabs defaultValue="company" className="flex flex-col gap-4">
      <TabsList aria-label={t('tabsLabel')}>
        {TABS.map((key) => (
          <TabsTrigger key={key} value={key}>
            {t(key)}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((key) => (
        <TabsContent key={key} value={key}>
          <EmptyState
            icon={<Clock className="size-6" />}
            title={ts('comingSoonTitle')}
            description={ts('comingSoonDescription')}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
