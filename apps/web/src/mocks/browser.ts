import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

const worker = setupWorker(...handlers);

let starting: Promise<unknown> | null = null;

/** Start once per page — React StrictMode runs effects twice and MSW rejects a second start(). */
export function startMockWorker() {
  starting ??= worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  return starting;
}
