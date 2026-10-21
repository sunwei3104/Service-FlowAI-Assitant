// Every console URL is built here. Route map: plan §21.3 / §22.6.
const seg = encodeURIComponent;

export const routes = {
  overview: () => '/',
  tenants: (query?: { q?: string }) => (query?.q ? `/tenants?q=${seg(query.q)}` : '/tenants'),
  tenant: (id: string) => `/tenants/${seg(id)}`,
  system: () => '/system',
  ai: () => '/ai',
  supportAccess: () => '/support-access',
  audit: () => '/audit',
} as const;

export const authRoutes = {
  passkey: (returnTo?: string) =>
    returnTo ? `/passkey?returnTo=${encodeURIComponent(returnTo)}` : '/passkey',
} as const;

/** Only same-origin relative paths are allowed as a post-login return target (open-redirect guard). */
export function safeReturnTo(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\'))
    return undefined;
  return value;
}
