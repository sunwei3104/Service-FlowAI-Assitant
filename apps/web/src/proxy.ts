import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from './config/api';

// Optimistic check only (Next docs): no session cookie → sign-in. The API still verifies
// every request and answers 401, which the client turns into the same redirect.
// Skipped in mock mode because there is no real session there.
const PUBLIC_PATHS = ['/sign-in'];

export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)))
    return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = '';
    url.searchParams.set('returnTo', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except API, Next internals, static files and the MSW worker.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|mockServiceWorker.js|.*\\.(?:png|svg|ico|webp|woff2?)$).*)',
  ],
};
