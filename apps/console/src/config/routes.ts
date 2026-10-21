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
