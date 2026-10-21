// Usage: pnpm --filter @serviceflow/ui ui:add <component...>
// Adds shadcn/ui components, then fixes imports/classes for this monorepo (see shadcn-postprocess.mjs).
import { execFileSync } from 'node:child_process';

const components = process.argv.slice(2);
if (components.length === 0) {
  console.error('Usage: pnpm --filter @serviceflow/ui ui:add <component...>');
  process.exit(1);
}
execFileSync('pnpm', ['exec', 'shadcn', 'add', '--yes', ...components], { stdio: 'inherit' });
execFileSync('node', ['scripts/shadcn-postprocess.mjs'], { stdio: 'inherit' });
