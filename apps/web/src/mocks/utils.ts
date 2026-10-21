import type { Problem } from '@serviceflow/contracts/http';

import { env } from '@/config/env';

import { db } from './db';

/** Match the API path on any origin: path('/tickets/:id') → '*\/api/v1/tickets/:id'. */
export const path = (p: string) => `*${env.NEXT_PUBLIC_API_BASE_PATH}${p}`;

/** RFC 9457 error. Plain Response (not HttpResponse<Problem>) so it doesn't fix the handler's success body type. */
export function problem(
  status: number,
  title: string,
  detail?: string,
  errors?: Problem['errors'],
): Response {
  const body: Problem = {
    type: 'about:blank',
    title,
    status,
    detail,
    errors,
    requestId: `mock-${Date.now().toString(36)}`,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

/** Same Idempotency-Key → same response, like the real API (plan §7.2). */
export function idempotent<T>(request: Request, create: () => T): T {
  const key = request.headers.get('Idempotency-Key');
  if (!key) return create();
  if (db.idempotency.has(key)) return db.idempotency.get(key) as T;
  const result = create();
  db.idempotency.set(key, result);
  return result;
}

/** Cursor pagination over an in-memory array (cursor = offset, opaque to the client). */
export function paginate<T>(items: T[], url: URL) {
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);
  const offset = Number(url.searchParams.get('cursor') ?? 0);
  const data = items.slice(offset, offset + limit);
  const next = offset + limit < items.length ? String(offset + limit) : null;
  return { data, nextCursor: next };
}

/** Parse "If-Match: \"7\"" → 7. */
export function ifMatchVersion(request: Request): number | null {
  const raw = request.headers.get('If-Match');
  if (!raw) return null;
  const n = Number(raw.replaceAll('"', ''));
  return Number.isFinite(n) ? n : null;
}
