import { useTranslations } from 'next-intl';

/** Shown while the session/tenant is resolved (before any tenant data is requested). */
export function ShellLoading() {
  const t = useTranslations('common');
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-surface-100 text-ink-muted flex min-h-dvh items-center justify-center"
    >
      {t('loading')}
    </div>
  );
}
