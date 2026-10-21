'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { routes } from '@/config/routes';

import { authQueries } from '../api';

/** "พื้นที่ทำงาน: สมาร์ทเวนด์ · เปลี่ยนบริษัท" — shown only when the link carries ?tenant=. */
export function WorkspaceLine({ slug }: { slug: string }) {
  const t = useTranslations('signIn');
  const workspace = useQuery(authQueries.workspace(slug));
  if (!workspace.data) return null;

  return (
    <p className="text-ink-muted m-0 mt-1">
      {t('workspace')} <strong className="text-ink">{workspace.data.displayName}</strong> ·{' '}
      <Link href={routes.signIn()}>{t('changeCompany')}</Link>
    </p>
  );
}
