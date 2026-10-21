// Names shared with services/api (plan §8.2). Change here only together with the backend.
export const SESSION_COOKIE = '__Host-sf_session';
/** Readable (non-HttpOnly) cookie that carries the double-submit CSRF token. Name to be confirmed by backend. */
export const CSRF_COOKIE = 'sf_csrf';
export const CSRF_HEADER = 'X-CSRF-Token';
