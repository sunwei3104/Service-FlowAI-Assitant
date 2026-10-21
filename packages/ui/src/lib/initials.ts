// Avatar initials. Thai: first two consonants, skipping leading vowels/marks (นภา วงศ์ดี → นภ).
// Latin: first letter of the first two words (Sun Tinakorn → ST).
// NOTE: the designs' hand-written initials are not fully consistent (see docs/PROJECT.md).
const THAI_CONSONANT = /[ก-ฮ]/;

export function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  if (THAI_CONSONANT.test(trimmed)) {
    return Array.from(trimmed)
      .filter((ch) => THAI_CONSONANT.test(ch))
      .slice(0, 2)
      .join('');
  }
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
