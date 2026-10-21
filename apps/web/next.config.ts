import path from 'node:path';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Server-only. Where /api/* is proxied in local dev when Caddy is not in front (plan §3.2).
// In staging/production Caddy routes /api to services/api, so leave this unset there.
const apiOrigin = process.env.API_ORIGIN;

if (process.env.APP_ENV === 'production' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  throw new Error('NEXT_PUBLIC_API_MOCKING must not be enabled when APP_ENV=production');
}

const nextConfig: NextConfig = {
  output: 'standalone',
  // Monorepo: trace files from the repo root so the standalone build includes workspace packages.
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  transpilePackages: ['@serviceflow/ui', '@serviceflow/ui-tokens', '@serviceflow/contracts'],
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return apiOrigin ? [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }] : [];
  },
  async headers() {
    // Baseline headers; Caddy adds HSTS/CSP in front (plan §9.4). Duplicates are harmless.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          // Camera is needed for technician photos (<input capture>); everything else off.
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self), payment=()',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
