import path from 'node:path';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Local dev only: where /console/v1/* is proxied when Caddy is not in front.
const apiOrigin = process.env.API_ORIGIN;

if (process.env.APP_ENV === 'production' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  throw new Error('NEXT_PUBLIC_API_MOCKING must not be enabled when APP_ENV=production');
}

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  transpilePackages: ['@serviceflow/ui', '@serviceflow/ui-tokens', '@serviceflow/contracts'],
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return apiOrigin
      ? [{ source: '/console/v1/:path*', destination: `${apiOrigin}/console/v1/:path*` }]
      : [];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
