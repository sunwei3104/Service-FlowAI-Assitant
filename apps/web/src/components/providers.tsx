'use client';

import { TooltipProvider } from '@serviceflow/ui/ui/tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

import { makeQueryClient } from '@/lib/api/query-client';
import { MockGate } from '@/mocks/mock-gate';

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser tab (never shared between requests on the server).
  const [queryClient] = useState(makeQueryClient);
  return (
    <MockGate>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </MockGate>
  );
}
