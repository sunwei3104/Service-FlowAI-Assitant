import { render, screen } from '@testing-library/react';

import { EmptyState, ErrorState, ForbiddenState } from '..';

describe('state components', () => {
  it('EmptyState is a labelled status region', () => {
    render(<EmptyState title="ยังไม่มีข้อมูล" description="ลองเปลี่ยนตัวกรอง" />);
    expect(screen.getByRole('status', { name: 'ยังไม่มีข้อมูล' })).toBeInTheDocument();
    expect(screen.getByText('ลองเปลี่ยนตัวกรอง')).toBeInTheDocument();
  });

  it('ErrorState is announced as an alert and shows the request id', () => {
    render(
      <ErrorState
        title="โหลดข้อมูลไม่สำเร็จ"
        requestId="01J9Z3K8Q4"
        requestIdLabel="รหัสอ้างอิง"
      />,
    );
    expect(screen.getByRole('alert', { name: 'โหลดข้อมูลไม่สำเร็จ' })).toBeInTheDocument();
    expect(screen.getByText('01J9Z3K8Q4')).toBeInTheDocument();
  });

  it('ForbiddenState renders its action', () => {
    render(<ForbiddenState title="ไม่มีสิทธิ์" action={<a href="/">กลับหน้าหลัก</a>} />);
    expect(screen.getByRole('link', { name: 'กลับหน้าหลัก' })).toHaveAttribute('href', '/');
  });
});
