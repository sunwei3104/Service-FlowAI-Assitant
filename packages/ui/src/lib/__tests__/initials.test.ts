import { initials } from '../initials';

describe('initials (decision D18)', () => {
  it.each([
    ['นภา วงศ์ดี', 'นภ'],
    ['ทินกร (Sun)', 'ทน'],
    ['สมชาย ก.', 'สม'],
    ['วิชัย ร.', 'วช'],
    ['สมาร์ทเวนด์ จำกัด', 'สม'],
    ['Sun Tinakorn', 'ST'],
    ['sun middle tinakorn', 'ST'],
    ['Madonna', 'M'],
    ['   ', '?'],
  ])('%s → %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
