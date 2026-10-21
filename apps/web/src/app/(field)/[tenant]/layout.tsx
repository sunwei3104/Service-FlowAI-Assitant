import { FieldShell } from '@/components/shell/field-shell';
import { ShellLoading } from '@/components/shell/shell-loading';
import { TenantGate } from '@/components/tenant-gate';

export default async function FieldLayout({ children, params }: LayoutProps<'/[tenant]'>) {
  const { tenant } = await params;
  return (
    <TenantGate slug={tenant} fallback={<ShellLoading />}>
      <FieldShell>{children}</FieldShell>
    </TenantGate>
  );
}
