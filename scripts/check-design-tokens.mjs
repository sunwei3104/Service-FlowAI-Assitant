// Guard for the project rule: "no raw color values in code — use tokens from docs/design/tokens.json".
// Fails (exit 1) when source files contain hex/rgb/hsl colors, Tailwind default palette classes,
// or arbitrary color classes like bg-[#fff]. Generated token files are the only exception.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const SCAN = ['apps/web/src', 'apps/console/src', 'packages/ui/src'];
const SKIP_DIRS = new Set(['node_modules', '.next', 'generated', 'gen']);
const EXT = /\.(tsx?|css|mjs)$/;

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const RULES = [
  { name: 'hex color', re: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/g },
  { name: 'rgb/hsl/oklch color', re: /\b(?:rgba?|hsla?|oklch|oklab)\(/g },
  { name: 'arbitrary color class', re: /-\[(?:#|rgb|hsl|oklch)/g },
  { name: 'Tailwind default palette', re: new RegExp(`\\b[a-z]+-(?:${PALETTE})-\\d{2,3}\\b`, 'g') },
  {
    name: 'black/white keyword class',
    re: /\b(?:bg|text|border|fill|stroke|ring)-(?:black|white)\b/g,
  },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXT.test(name)) yield path;
  }
}

const problems = [];
for (const base of SCAN) {
  let files;
  try {
    files = [...walk(join(root, base))];
  } catch {
    continue;
  }
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (line.includes('design-tokens-ignore')) return;
      for (const rule of RULES) {
        for (const m of line.matchAll(rule.re)) {
          problems.push(`${relative(root, file)}:${i + 1}  ${rule.name}: "${m[0]}"`);
        }
      }
    });
  }
}

if (problems.length) {
  console.error(
    `Raw design values found — use tokens (docs/design/tokens.json) instead:\n${problems.join('\n')}`,
  );
  process.exit(1);
}
console.log('check-design-tokens: OK');
