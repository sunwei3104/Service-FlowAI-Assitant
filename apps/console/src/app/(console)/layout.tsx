import type { ReactNode } from 'react';

import { ConsoleGate } from '@/components/console-gate';
import { ConsoleShell } from '@/components/shell/console-shell';
import { ShellLoading } from '@/components/shell/shell-loading';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleGate fallback={<ShellLoading />}>
      <ConsoleShell>{children}</ConsoleShell>
    </ConsoleGate>
  );
}
