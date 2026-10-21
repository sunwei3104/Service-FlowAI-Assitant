import type messages from '../messages/th.json';

// Type-safe translation keys: t('nav.tickets') is checked at compile time.
declare module 'next-intl' {
  interface AppConfig {
    Locale: 'th';
    Messages: typeof messages;
  }
}
