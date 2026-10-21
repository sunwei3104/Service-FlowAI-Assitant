'use client';

import { useTranslations } from 'next-intl';

import { toDuration } from './time';

/** "25 นาที" / "2 ชม." / "1 วัน" and "2 นาทีที่แล้ว" from messages (time.*). */
export function useDurationFormat() {
  const t = useTranslations('time');
  return {
    duration: (minutes: number) => {
      const d = toDuration(minutes);
      return t(d.unit, { count: d.count });
    },
    ago: (from: Date, now: Date) => {
      const minutes = (now.getTime() - from.getTime()) / 60_000;
      if (minutes < 1) return t('justNow');
      const d = toDuration(minutes);
      return t(`${d.unit}Ago`, { count: d.count });
    },
  };
}
