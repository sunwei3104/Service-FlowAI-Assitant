'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { authQueries } from '../api';

/** "พื้นที่ทำงาน: สมาร์ทเวนด์" — only for a valid invitation link (decision D15). Invalid → nothing. */
export function InvitationWorkspace({ token }: { token: string }) {
  const t = useTranslations('signIn');
  const invitation = useQuery(authQueries.invitation(token));
  if (!invitation.data) return null;

  return (
    <p className="text-ink-muted m-0 mt-1">
      {t('workspace')} <strong className="text-ink">{invitation.data.tenantName}</strong>
    </p>
  );
}
