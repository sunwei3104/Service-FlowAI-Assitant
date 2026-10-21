import { Inbox } from 'lucide-react';

import { StateLayout, type StateLayoutProps } from './state-layout';

export type EmptyStateProps = Omit<StateLayoutProps, 'role'>;

/** No data yet / nothing matches the filter. Also used for "เร็ว ๆ นี้" pages without a design. */
export function EmptyState({ icon = <Inbox className="size-6" />, ...props }: EmptyStateProps) {
  return <StateLayout role="status" icon={icon} {...props} />;
}
