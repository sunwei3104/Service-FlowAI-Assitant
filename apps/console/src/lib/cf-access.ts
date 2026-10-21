// Cloudflare Access JWT verification (plan §22.3: "ตัวแอป: ตรวจลายเซ็น aud และ iss ของ JWT จาก Cloudflare ทุกคำขอ").
// Pure function so it can be unit-tested with locally generated keys.
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export interface AccessConfig {
  teamDomain: string; // e.g. serviceflow.cloudflareaccess.com
  audience: string; // Access application AUD tag
}

const jwksCache = new Map<string, JWTVerifyGetKey>();

export function remoteKeys(teamDomain: string): JWTVerifyGetKey {
  let keys = jwksCache.get(teamDomain);
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
    jwksCache.set(teamDomain, keys);
  }
  return keys;
}

export type AccessResult =
  | { ok: true; email: string | undefined }
  | { ok: false; reason: 'missing' | 'invalid' };

export async function verifyAccessJwt(
  token: string | null,
  config: AccessConfig,
  keys: JWTVerifyGetKey = remoteKeys(config.teamDomain),
): Promise<AccessResult> {
  if (!token) return { ok: false, reason: 'missing' };
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: `https://${config.teamDomain}`,
      audience: config.audience,
      algorithms: ['RS256'],
    });
    return { ok: true, email: typeof payload.email === 'string' ? payload.email : undefined };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
