// Every URL in the app is built here — never write "/tickets" inline in a component.
// Route map follows plan §21.3. `t` = tenant slug.
const seg = encodeURIComponent;

export const routes = {
  home: () => '/',
  signIn: (params?: { returnTo?: string; tenant?: string }) => {
    const qs = new URLSearchParams();
    if (params?.tenant) qs.set('tenant', params.tenant);
    if (params?.returnTo) qs.set('returnTo', params.returnTo);
    const query = qs.toString();
    return query ? `/sign-in?${query}` : '/sign-in';
  },

  dashboard: {
    overview: (t: string) => `/${seg(t)}`,
    tickets: (t: string) => `/${seg(t)}/tickets`,
    ticket: (t: string, id: string) => `/${seg(t)}/tickets/${seg(id)}`,
    assets: (t: string) => `/${seg(t)}/assets`,
    knowledge: (t: string) => `/${seg(t)}/knowledge`,
    line: (t: string) => `/${seg(t)}/line`,
    reports: (t: string) => `/${seg(t)}/reports`,
    team: (t: string) => `/${seg(t)}/settings/team`,
    settings: (t: string) => `/${seg(t)}/settings`,
  },

  field: {
    jobs: (t: string) => `/${seg(t)}/jobs`,
    job: (t: string, id: string) => `/${seg(t)}/jobs/${seg(id)}`,
    scan: (t: string) => `/${seg(t)}/scan`,
    history: (t: string) => `/${seg(t)}/history`,
    account: (t: string) => `/${seg(t)}/account`,
  },
} as const;

/** Only same-origin relative paths are allowed as a post-login return target (open-redirect guard). */
export function safeReturnTo(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\'))
    return undefined;
  return value;
}
