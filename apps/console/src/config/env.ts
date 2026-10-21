import { z } from 'zod';

// Public (browser) configuration. Each key must be referenced literally so Next inlines it at build.
const schema = z.object({
  /** Console API base path, served only on the console host (plan §7.6). */
  NEXT_PUBLIC_API_BASE_PATH: z.string().startsWith('/').default('/console/v1'),
  /** "enabled" = answer API calls from src/mocks (MSW). Never in production. */
  NEXT_PUBLIC_API_MOCKING: z.enum(['enabled', 'disabled']).default('disabled'),
});

export const env = schema.parse({
  NEXT_PUBLIC_API_BASE_PATH: process.env.NEXT_PUBLIC_API_BASE_PATH,
  NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
});

export const isMocking = env.NEXT_PUBLIC_API_MOCKING === 'enabled';
