import { DashboardShell } from '@/components/shell/dashboard-shell';
import { ShellLoading } from '@/components/shell/shell-loading';
import { TenantGate } from '@/components/tenant-gate';

export default async function DashboardLayout({ children, params }: LayoutProps<'/[tenant]'>) {
  const { tenant } = await params;
  return (
    <TenantGate slug={tenant} fallback={<ShellLoading />}>
      <DashboardShell>{children}</DashboardShell>
    </TenantGate>
  );
}
