'use client';

import { createContext, useContext } from 'react';

import type { Schemas } from '@/lib/api/client';

const OperatorContext = createContext<Schemas['Operator'] | null>(null);

export const OperatorProvider = OperatorContext.Provider;

/** The signed-in platform operator (available inside the (console) layout). */
export function useOperator(): Schemas['Operator'] {
  const value = useContext(OperatorContext);
  if (!value) throw new Error('useOperator() must be used inside the (console) layout');
  return value;
}
