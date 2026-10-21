// @vitest-environment node
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';

import { verifyAccessJwt } from '../cf-access';

const config = { teamDomain: 'team.cloudflareaccess.com', audience: 'aud-123' };

async function setup() {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256' };
  const keys = createLocalJWKSet({ keys: [jwk] });
  const sign = (claims: { iss?: string; aud?: string; exp?: string }) =>
    new SignJWT({ email: 'sun@serviceflow.ai' })
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setIssuer(claims.iss ?? `https://${config.teamDomain}`)
      .setAudience(claims.aud ?? config.audience)
      .setIssuedAt()
      .setExpirationTime(claims.exp ?? '5m')
      .sign(privateKey);
  return { keys, sign };
}

describe('verifyAccessJwt', () => {
  it('accepts a valid token', async () => {
    const { keys, sign } = await setup();
    await expect(verifyAccessJwt(await sign({}), config, keys)).resolves.toEqual({
      ok: true,
      email: 'sun@serviceflow.ai',
    });
  });

  it('rejects a missing token', async () => {
    const { keys } = await setup();
    await expect(verifyAccessJwt(null, config, keys)).resolves.toEqual({
      ok: false,
      reason: 'missing',
    });
  });

  it.each([
    ['wrong audience', { aud: 'other-app' }],
    ['wrong issuer', { iss: 'https://evil.cloudflareaccess.com' }],
    ['expired', { exp: '-1m' }],
  ])('rejects %s', async (_label, claims) => {
    const { keys, sign } = await setup();
    await expect(verifyAccessJwt(await sign(claims), config, keys)).resolves.toEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('rejects a token signed by another key', async () => {
    const { keys } = await setup();
    const other = await setup();
    await expect(verifyAccessJwt(await other.sign({}), config, keys)).resolves.toEqual({
      ok: false,
      reason: 'invalid',
    });
  });
});
