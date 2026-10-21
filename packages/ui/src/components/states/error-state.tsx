import { AlertTriangle } from 'lucide-react';

import { StateLayout, type StateLayoutProps } from './state-layout';

export interface ErrorStateProps extends Omit<StateLayoutProps, 'role' | 'description'> {
  description?: StateLayoutProps['description'];
  /** Request id from the Problem response — helps support trace the error (plan §13). */
  requestId?: string;
  requestIdLabel?: string;
}

export function ErrorState({
  icon = <AlertTriangle className="size-6" />,
  description,
  requestId,
  requestIdLabel = 'Request ID',
  ...props
}: ErrorStateProps) {
  return (
    <StateLayout
      role="alert"
      icon={icon}
      description={
        <>
          {description}
          {requestId ? (
            <p className="text-caption m-0 mt-2">
              {requestIdLabel}: <code className="text-code font-mono">{requestId}</code>
            </p>
          ) : null}
        </>
      }
      {...props}
    />
  );
}
