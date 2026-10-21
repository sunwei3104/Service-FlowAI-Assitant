// Avatar initials — owner decision D18:
// Thai: first two consonants of the FIRST name, skipping vowels and tone marks
//   (นภา วงศ์ดี → นภ, ทินกร (Sun) → ทน, สมชาย → สม, วิชัย → วช).
// Latin: first letter of the first name + first letter of the last name (Sun Tinakorn → ST).
const THAI_CONSONANT = /[ก-ฮ]/;

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return '?';
  if (THAI_CONSONANT.test(first)) {
    return Array.from(first)
      .filter((ch) => THAI_CONSONANT.test(ch))
      .slice(0, 2)
      .join('');
  }
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  return `${first[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}
