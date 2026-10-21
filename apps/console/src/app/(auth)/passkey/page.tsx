// Console Passkey — owner decision D17: SignIn style (docs/design/html/SignIn.html) on console-navy.
import { icons, LogoMark } from '@serviceflow/ui/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { safeReturnTo } from '@/config/routes';
import { PasskeyPanel } from '@/features/session/components/passkey-panel';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('passkey') };
}

export default async function PasskeyPage({ searchParams }: PageProps<'/passkey'>) {
  const t = await getTranslations('passkey');
  const tShell = await getTranslations('shell');
  const query = await searchParams;
  const returnTo =
    safeReturnTo(typeof query.returnTo === 'string' ? query.returnTo : undefined) ?? '/';
  const points = [t('point1'), t('point2'), t('point3')];

  return (
    <div className="bg-surface-100 text-body text-ink flex min-h-dvh flex-wrap">
      <section
        aria-label={t('aboutLabel')}
        className="bg-console-navy text-sidebar-ink box-border flex flex-[1_1_460px] flex-col gap-10 px-14 py-12"
      >
        <div className="flex items-center gap-3">
          <LogoMark size={40} variant="console" />
          <span className="flex flex-col">
            <span className="text-mobile-title">{tShell('brandName')}</span>
            <span className="text-caption text-console-accent-ink">{tShell('brandTagline')}</span>
          </span>
        </div>
        <div className="mt-auto flex max-w-[520px] flex-col gap-4">
          <p className="text-display m-0">{t.rich('headline', { br: () => <br /> })}</p>
          <p className="text-body-lg text-sidebar-link m-0">{t('lead')}</p>
        </div>
        <ul className="m-0 mb-auto flex max-w-[520px] list-none flex-col gap-3.5 p-0">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="bg-sidebar-surface text-console-accent inline-flex size-8 flex-none items-center justify-center rounded-md"
              >
                <icons.lock size={18} strokeWidth={1.9} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </section>
      <main
        id="main"
        className="box-border flex flex-[1_1_460px] items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-[420px]">
          <PasskeyPanel returnTo={returnTo} />
        </div>
      </main>
    </div>
  );
}
