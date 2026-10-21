import { getRequestConfig } from 'next-intl/server';

// Thai only for now (plan §2.2). Times are stored in UTC and shown in Asia/Bangkok.
export const LOCALE = 'th';
export const TIME_ZONE = 'Asia/Bangkok';

export default getRequestConfig(async () => ({
  locale: LOCALE,
  timeZone: TIME_ZONE,
  messages: (await import('../../messages/th.json')).default,
}));
