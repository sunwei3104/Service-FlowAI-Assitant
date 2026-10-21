import { z } from 'zod';

// Public (browser) configuration. Each key must be referenced literally so Next inlines it at build.
const schema = z.object({
  /** Same-origin API base path (plan §7.2). */
  NEXT_PUBLIC_API_BASE_PATH: z.string().startsWith('/').default('/api/v1'),
  /** "enabled" = answer API calls from src/mocks (MSW) instead of services/api. Never in production. */
  NEXT_PUBLIC_API_MOCKING: z.enum(['enabled', 'disabled']).default('disabled'),
  /** Tenant slug the sign-in buttons open while mocking (there is no real OIDC in mock mode). */
  NEXT_PUBLIC_MOCK_TENANT: z.string().min(1).default('smartvend'),
});

export const env = schema.parse({
  NEXT_PUBLIC_API_BASE_PATH: process.env.NEXT_PUBLIC_API_BASE_PATH,
  NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
  NEXT_PUBLIC_MOCK_TENANT: process.env.NEXT_PUBLIC_MOCK_TENANT,
});

export const isMocking = env.NEXT_PUBLIC_API_MOCKING === 'enabled';
