'use client';

import { createContext, useContext } from 'react';

import type { Schemas } from '@/lib/api/client';

export interface TenantContextValue {
  /** Slug from the URL — use it to build links with `routes`. */
  slug: string;
  membership: Schemas['Membership'];
  me: Schemas['Me'];
}

const TenantContext = createContext<TenantContextValue | null>(null);

export const TenantProvider = TenantContext.Provider;

/** Available inside (dashboard)/[tenant] and (field)/[tenant] layouts only. */
export function useTenant(): TenantContextValue {
  const value = useContext(TenantContext);
  if (!value) throw new Error('useTenant() must be used inside a [tenant] layout');
  return value;
}
