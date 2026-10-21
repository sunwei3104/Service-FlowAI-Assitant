'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { isMocking } from '@/config/env';

type State = 'ready' | 'starting' | 'failed';

/**
 * When NEXT_PUBLIC_API_MOCKING=enabled, start the MSW service worker before rendering
 * so the first API call is already intercepted. When disabled this is a pass-through and
 * the mock code is never bundled (the dynamic import sits behind a build-time constant).
 */
export function MockGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(isMocking ? 'starting' : 'ready');

  useEffect(() => {
    if (!isMocking) return;
    let cancelled = false;
    import('./browser')
      .then(({ startMockWorker }) => startMockWorker())
      .then(() => !cancelled && setState('ready'))
      .catch((error: unknown) => {
        console.error('[mocks] MSW failed to start', error);
        if (!cancelled) setState('failed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'failed') {
    // Dev-only screen (mock mode is refused in production): never fall through to the real API silently.
    return (
      <p role="alert" className="text-danger-ink p-6">
        Mock API (MSW) failed to start — see the browser console. Set
        NEXT_PUBLIC_API_MOCKING=disabled to use the real API.
      </p>
    );
  }
  return state === 'ready' ? children : null;
}
