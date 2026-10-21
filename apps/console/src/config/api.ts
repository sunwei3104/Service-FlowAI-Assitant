// Names shared with services/api (plan §8.2, §22.3). Change here only together with the backend.
export const CONSOLE_SESSION_COOKIE = '__Host-sf_console';
/** Readable cookie carrying the double-submit CSRF token. Name to be confirmed by backend. */
export const CSRF_COOKIE = 'sf_console_csrf';
export const CSRF_HEADER = 'X-CSRF-Token';
/** Header Cloudflare Access adds to every request that passed Access (plan §22.3). */
export const CF_ACCESS_JWT_HEADER = 'Cf-Access-Jwt-Assertion';
