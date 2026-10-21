import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Providers } from '@/components/providers';
import { LOCALE } from '@/i18n/request';

import { fontMono, fontSans } from './fonts';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: { default: t('appName'), template: t('titleTemplate') },
    // Never indexed, never linked from public sites (plan §22.3).
    robots: { index: false, follow: false, nocache: true },
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LOCALE} className={`${fontSans.variable} ${fontMono.variable}`}>
      <body>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
