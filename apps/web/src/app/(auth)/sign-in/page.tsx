// Sign-in — built from docs/design/html/SignIn.html (PNG: docs/design/png/SignIn.png).
import { icons, LogoMark } from '@serviceflow/ui/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { safeReturnTo } from '@/config/routes';
import { INVITE_TOKEN, signInUrl } from '@/features/auth/api';
import { InvitationWorkspace } from '@/features/auth/components/invitation-workspace';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('signIn') };
}

export default async function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  const t = await getTranslations('signIn');
  const tShell = await getTranslations('shell');
  const query = await searchParams;
  // Company name only from a valid invitation link (decision D15) — never from a public ?tenant= param.
  const invite =
    typeof query.invite === 'string' && INVITE_TOKEN.test(query.invite) ? query.invite : undefined;
  const returnTo = safeReturnTo(typeof query.returnTo === 'string' ? query.returnTo : undefined);

  const features: { icon: ReactNode; title: string; body: string }[] = [
    {
      icon: <icons.chat size={18} strokeWidth={1.9} />,
      title: t('feature1Title'),
      body: t('feature1Body'),
    },
    {
      icon: <icons.sparkle size={18} strokeWidth={1.9} />,
      title: t('feature2Title'),
      body: t('feature2Body'),
    },
    {
      icon: <icons.lock size={18} strokeWidth={1.9} />,
      title: t('feature3Title'),
      body: t('feature3Body'),
    },
  ];

  return (
    <div className="bg-surface-100 text-body text-ink flex min-h-dvh flex-wrap leading-normal">
      <section
        aria-label={t('aboutLabel')}
        className="bg-navy text-sidebar-ink box-border flex flex-[1_1_460px] flex-col gap-10 px-14 py-12"
      >
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-mobile-title">{tShell('brandName')}</span>
        </div>
        <div className="mt-auto flex max-w-[520px] flex-col gap-4">
          <h1 className="text-display m-0">{t.rich('headline', { br: () => <br /> })}</h1>
          <p className="text-sidebar-link text-body-lg m-0">{t('lead')}</p>
        </div>
        <ul className="m-0 mb-auto flex max-w-[520px] list-none flex-col gap-3.5 p-0">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="bg-sidebar-surface text-primary-300 inline-flex size-8 flex-none items-center justify-center rounded-md"
              >
                {f.icon}
              </span>
              <span>
                <strong className="font-semibold">{f.title}</strong>
                <br />
                <span className="text-sidebar-ink-muted">{f.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-caption text-sidebar-ink-muted m-0">{t('copyright')}</p>
      </section>

      <main
        id="main"
        className="box-border flex flex-[1_1_460px] items-center justify-center px-6 py-12"
      >
        <div className="flex w-full max-w-[420px] flex-col gap-5">
          <div>
            <h2 className="text-auth-title m-0">{t('title')}</h2>
            {invite ? <InvitationWorkspace token={invite} /> : null}
          </div>

          <div className="flex flex-col gap-3">
            {/* Plain <a>: full-page navigation to the OIDC start URL (the provider redirects the browser). */}
            <a
              href={signInUrl('line', { invite, returnTo })}
              className="h-13 bg-navy text-on-primary hover:text-on-primary text-body-lg inline-flex items-center justify-center gap-2.5 rounded-md font-semibold no-underline"
            >
              <icons.chat size={20} />
              {t('withLine')}
            </a>
            <a
              href={signInUrl('google', { invite, returnTo })}
              className="h-13 border-control-border bg-surface-000 text-ink hover:text-ink text-body-lg inline-flex items-center justify-center gap-2.5 rounded-md border font-semibold no-underline"
            >
              <icons.google size={20} />
              {t('withGoogle')}
            </a>
          </div>

          <p className="text-body-sm text-ink-muted m-0">
            {t.rich('technicianHint', {
              link: (chunks) => <strong className="font-semibold">{chunks}</strong>,
            })}
          </p>

          <section
            aria-labelledby="h-nopw"
            className="border-hairline bg-surface-000 mt-2 flex flex-col gap-2 rounded-lg border p-4"
          >
            <h3 id="h-nopw" className="text-body-lg m-0 flex items-center gap-2 font-semibold">
              <icons.lock size={18} strokeWidth={2} className="text-primary" />
              {t('noPasswordTitle')}
            </h3>
            <p className="text-body-sm text-ink-muted m-0">{t('noPasswordBody')}</p>
            <p className="text-body-sm text-ink-muted m-0">{t('idleTimeout')}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
