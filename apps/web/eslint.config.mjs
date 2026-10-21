import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'next-env.d.ts',
    'public/mockServiceWorker.js',
    'playwright-report/**',
    'test-results/**',
  ]),
  {
    rules: {
      // Plan §5.1: talk to the API only through src/lib/api/client.ts (generated types).
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use the typed client in src/lib/api/client.ts' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@serviceflow/web', '@serviceflow/console', '../../apps/*'],
              message: 'apps must not import each other (plan §5.1)',
            },
          ],
        },
      ],
    },
  },
  {
    // MSW handlers and tests legitimately work with raw fetch/Request.
    files: ['src/mocks/**', 'tests/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: { 'no-restricted-globals': 'off' },
  },
]);
