import { Lock } from 'lucide-react';

import { StateLayout, type StateLayoutProps } from './state-layout';

export type ForbiddenStateProps = Omit<StateLayoutProps, 'role'>;

/** Signed in but the role may not see this (HTTP 403). Hiding UI is convenience — the API still enforces. */
export function ForbiddenState({
  icon = <Lock className="size-6" />,
  ...props
}: ForbiddenStateProps) {
  return <StateLayout role="status" icon={icon} {...props} />;
}
