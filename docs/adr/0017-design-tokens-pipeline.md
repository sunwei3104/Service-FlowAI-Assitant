# ADR-0017: Design tokens are the only source of visual values

- Status: Accepted (owner decision D3) · 2026-10-22
- Context: The designs must be matched exactly without hard-coded values.
- Decision: `docs/design/tokens.json` → `packages/ui-tokens/scripts/build.mjs` → CSS variables (`--sf-*`, light + dark) + Tailwind v4 `@theme` that **removes Tailwind's default palette/type/radius/shadow**. `scripts/check-design-tokens.mjs` fails CI on hex/rgb/palette classes. shadcn/ui primitives are post-processed to token classes; shadcn semantic names are aliases to tokens.
- Consequences: A value missing from tokens is visible immediately (the class does not exist) and must be added to tokens.json after the owner agrees.
