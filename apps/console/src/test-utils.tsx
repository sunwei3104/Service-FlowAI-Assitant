import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';

import messages from '../messages/th.json';

/** Render with the same providers as the app (fresh QueryClient per test, no retries). */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <NextIntlClientProvider locale="th" timeZone="Asia/Bangkok" messages={messages}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}
