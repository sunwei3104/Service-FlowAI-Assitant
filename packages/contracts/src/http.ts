// Shared HTTP plumbing for both apps (web + console). Framework-free on purpose:
// apps build their typed client with createApiClient<paths>() and never call fetch() directly (plan §5.1).
import createClient, { type Middleware } from 'openapi-fetch';

/** RFC 9457 Problem Details, as returned by every error response (plan §7.3). */
export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  requestId?: string;
  errors?: { field: string; message: string }[];
}

export function isProblem(value: unknown): value is Problem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Problem).status === 'number' &&
    typeof (value as Problem).title === 'string'
  );
}

/** Thrown by unwrap() so TanStack Query sees a real Error with the problem attached. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: Problem;

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
    this.status = problem.status;
    this.problem = problem;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isConflict() {
    return this.status === 409 || this.status === 412;
  }
  get isValidation() {
    return this.status === 422;
  }
  get isRateLimited() {
    return this.status === 429;
  }
}

/** Network failure / non-problem response — keeps a Problem shape so UI code has one path. */
export function toProblem(status: number, body: unknown): Problem {
  if (isProblem(body)) return body;
  return { type: 'about:blank', title: 'Unexpected response', status };
}

/**
 * Turns an openapi-fetch result into data-or-throw. Use inside query/mutation functions:
 *   queryFn: () => unwrap(api.GET('/tickets', { params }))
 */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise;
  if (error !== undefined || !response.ok) throw new ApiError(toProblem(response.status, error));
  // 204 No Content → data is undefined by design
  return data as T;
}

/** Query retry policy shared by both apps: retry network/5xx only — 4xx are answers, not failures. */
export function shouldRetry(failureCount: number, error: unknown, maxRetries = 2): boolean {
  return failureCount < maxRetries && !(error instanceof ApiError && error.status < 500);
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export interface ApiClientOptions {
  /** e.g. "/api/v1" — same-origin so the session cookie is sent (plan §7.2). */
  baseUrl: string;
  /** Reads the double-submit CSRF token (plan §8.2). Return null when not available. */
  getCsrfToken: () => string | null;
  /** Header name for the CSRF token. */
  csrfHeader: string;
  /** Called once per 401 so the app can redirect to sign-in. */
  onUnauthorized?: (response: Response) => void;
}

export function createApiClient<Paths extends {}>(options: ApiClientOptions) {
  const client = createClient<Paths>({
    baseUrl: options.baseUrl,
    credentials: 'same-origin',
    // Resolve fetch per call (not at module load) so test interceptors (MSW) installed later still apply.
    fetch: (request) => globalThis.fetch(request),
  });

  const middleware: Middleware = {
    onRequest({ request }) {
      if (MUTATING.has(request.method)) {
        const token = options.getCsrfToken();
        if (token) request.headers.set(options.csrfHeader, token);
      }
      return request;
    },
    onResponse({ response }) {
      if (response.status === 401) options.onUnauthorized?.(response);
      return response;
    },
  };
  client.use(middleware);
  return client;
}

/** Idempotency-Key for POSTs that create data; reuse the same key when retrying the same action. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/** ETag/If-Match helpers: the API's ETag is the quoted resource version. */
export const etag = {
  fromVersion: (version: number) => `"${version}"`,
};
