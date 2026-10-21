import { newIdempotencyKey } from '@serviceflow/contracts/http';
import { useCallback, useRef } from 'react';

/**
 * One Idempotency-Key per user action (plan §7.2, §21.5 weak mobile signal):
 * retries of the same action reuse the key; call reset() after success to start a new action.
 */
export function useIdempotencyKey() {
  const key = useRef<string | null>(null);
  const get = useCallback(() => (key.current ??= newIdempotencyKey()), []);
  const reset = useCallback(() => {
    key.current = null;
  }, []);
  return { get, reset };
}
