// Run after every `shadcn add` (use `pnpm --filter @serviceflow/ui ui:add <component>`).
// shadcn writes Tailwind-default classes and alias imports that do not exist in this monorepo:
//   1. imports: `cn` / sibling components → relative paths inside packages/ui
//   2. classes outside the ServiceFlow theme → nearest token (theme.css removes Tailwind's defaults)
// The class mapping is documented in docs/PROJECT.md ("shadcn class mapping").
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/components/ui');

const CLASS_MAP = [
  ['text-xs', 'text-caption'],
  ['text-sm', 'text-body'],
  ['text-base', 'text-body'],
  ['text-lg', 'text-card-title'],
  ['shadow-xs', 'shadow-sm'],
  ['shadow-lg', 'shadow-md'],
  ['bg-black/50', 'bg-navy/50'],
  ['text-white', 'text-on-primary'],
];
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

let changed = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
  const path = join(dir, file);
  const before = readFileSync(path, 'utf8');
  let src = before
    .replace(/import \{ cn \} from "[^"]+"/g, 'import { cn } from "../../lib/cn"')
    .replace(/from "@serviceflow\/ui\/components\/ui\/([\w-]+)"/g, 'from "./$1"');
  for (const [from, to] of CLASS_MAP) {
    src = src.replace(new RegExp(`(?<![\\w-])${escape(from)}(?![\\w-])`, 'g'), to);
  }
  if (src !== before) {
    writeFileSync(path, src);
    changed += 1;
  }
}
console.log(`shadcn-postprocess: updated ${changed} file(s)`);
