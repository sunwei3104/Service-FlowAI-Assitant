// Sign-in — built from docs/design/html/SignIn.html (PNG: docs/design/png/SignIn.png).
// Font sizes 15/16/20/28/36px are not in the tokens type scale yet (docs/PROJECT.md "คำถามค้าง").
import { icons, LogoMark } from '@serviceflow/ui/icons';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { routes, safeReturnTo } from '@/config/routes';
import { signInUrl } from '@/features/auth/api';
import { WorkspaceLine } from '@/features/auth/components/workspace-line';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages');
  return { title: t('signIn') };
}

const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/;

export default async function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  const t = await getTranslations('signIn');
  const tShell = await getTranslations('shell');
  const query = await searchParams;
  const tenantParam =
    typeof query.tenant === 'string' && SLUG.test(query.tenant) ? query.tenant : undefined;
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
          <span className="text-[20px] font-bold">{tShell('brandName')}</span>
        </div>
        <div className="mt-auto flex max-w-[520px] flex-col gap-4">
          <h1 className="m-0 text-[36px] font-bold leading-[1.3]">
            {t.rich('headline', { br: () => <br /> })}
          </h1>
          <p className="text-sidebar-link m-0 text-[16px]">{t('lead')}</p>
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
            <h2 className="m-0 text-[28px] font-bold leading-[1.3]">{t('title')}</h2>
            {tenantParam ? <WorkspaceLine slug={tenantParam} /> : null}
          </div>

          <div className="flex flex-col gap-3">
            {/* Plain <a>: full-page navigation to the OIDC start URL (the provider redirects the browser). */}
            <a
              href={signInUrl('line', { tenant: tenantParam, returnTo })}
              className="h-13 bg-navy text-on-primary hover:text-on-primary inline-flex items-center justify-center gap-2.5 rounded-md text-[15px] font-semibold no-underline"
            >
              <icons.chat size={20} />
              {t('withLine')}
            </a>
            <a
              href={signInUrl('google', { tenant: tenantParam, returnTo })}
              className="h-13 border-control-border bg-surface-000 text-ink hover:text-ink inline-flex items-center justify-center gap-2.5 rounded-md border text-[15px] font-semibold no-underline"
            >
              <icons.google size={20} />
              {t('withGoogle')}
            </a>
          </div>

          <p className="text-body-sm text-ink-muted m-0">
            {t.rich('technicianHint', {
              link: (chunks) =>
                tenantParam ? (
                  <Link href={routes.field.jobs(tenantParam)}>{chunks}</Link>
                ) : (
                  <span>{chunks}</span>
                ),
            })}
          </p>

          <section
            aria-labelledby="h-nopw"
            className="border-hairline bg-surface-000 mt-2 flex flex-col gap-2 rounded-lg border p-4"
          >
            <h3 id="h-nopw" className="m-0 flex items-center gap-2 text-[15px] font-semibold">
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
