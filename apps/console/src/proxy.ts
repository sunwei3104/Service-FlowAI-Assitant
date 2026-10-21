import { NextResponse, type NextRequest } from 'next/server';

import { CF_ACCESS_JWT_HEADER } from './config/api';
import { verifyAccessJwt } from './lib/cf-access';

// Layer 2 of the console's access chain (plan §22.3): every request must carry a valid
// Cloudflare Access JWT. Fails CLOSED: missing config or token → 403/503, never "let through".
// Only APP_ENV=local skips this (plan §5.2: local dev uses a dev identity instead of Access).
export async function proxy(request: NextRequest) {
  const appEnv = process.env.APP_ENV;
  if (appEnv === 'local') return NextResponse.next();

  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN;
  const audience = process.env.CF_ACCESS_AUD;
  if (!teamDomain || !audience) {
    return new NextResponse('Console access is not configured', { status: 503 });
  }

  const result = await verifyAccessJwt(request.headers.get(CF_ACCESS_JWT_HEADER), {
    teamDomain,
    audience,
  });
  if (!result.ok) return new NextResponse('Forbidden', { status: 403 });
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
