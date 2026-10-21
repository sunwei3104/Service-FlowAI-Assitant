import { bangkokWeekday, formatClock, formatLongDate, toDuration } from '../time';

describe('time helpers', () => {
  const d = new Date('2026-10-19T02:45:00Z'); // 09:45 Monday in Bangkok

  it('formats the long Thai date like the design', () => {
    expect(formatLongDate(d)).toBe('วันจันทร์ 19 ตุลาคม 2569');
  });

  it('formats the clock in Bangkok time', () => {
    expect(formatClock(d)).toBe('09:45');
  });

  it('weekday in Bangkok', () => {
    expect(bangkokWeekday(d)).toBe(1);
    expect(bangkokWeekday(new Date('2026-10-18T18:00:00Z'))).toBe(1); // 01:00 Mon in Bangkok, still Sun in UTC
  });

  it.each([
    [25, { unit: 'minutes', count: 25 }],
    [-10, { unit: 'minutes', count: 10 }],
    [120, { unit: 'hours', count: 2 }],
    [1440, { unit: 'days', count: 1 }],
  ])('toDuration(%i)', (minutes, expected) => {
    expect(toDuration(minutes)).toEqual(expected);
  });
});
