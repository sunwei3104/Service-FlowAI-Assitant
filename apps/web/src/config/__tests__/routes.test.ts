import { routes, safeReturnTo } from '../routes';

describe('safeReturnTo (open-redirect guard)', () => {
  it.each([
    ['/smartvend/tickets?view=open', '/smartvend/tickets?view=open'],
    ['/', '/'],
  ])('accepts same-origin path %s', (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    '',
    null,
    undefined,
  ])('rejects %s', (input) => {
    expect(safeReturnTo(input)).toBeUndefined();
  });
});

describe('routes', () => {
  it('encodes dynamic segments', () => {
    expect(routes.dashboard.ticket('smart vend', 'a/b')).toBe('/smart%20vend/tickets/a%2Fb');
  });

  it('builds sign-in with return target', () => {
    expect(routes.signIn({ returnTo: '/x?y=1' })).toBe('/sign-in?returnTo=%2Fx%3Fy%3D1');
  });
});
