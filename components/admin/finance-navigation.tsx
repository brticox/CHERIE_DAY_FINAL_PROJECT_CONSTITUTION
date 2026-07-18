import { AdminSegmentedControl } from '@/components/admin/admin-workspace';
import { can } from '@/lib/admin/permissions';

type FinanceSection = 'overview' | 'payments' | 'reconciliation' | 'refunds' | 'audit';

const FINANCE_SECTIONS: Array<{
  key: FinanceSection;
  label: string;
  href: string;
}> = [
  { key: 'overview', label: 'Genel bakış', href: '/admin/finance' },
  { key: 'payments', label: 'Ödemeler', href: '/admin/finance/payments' },
  {
    key: 'reconciliation',
    label: 'Uzlaştırma',
    href: '/admin/finance/reconciliation',
  },
  { key: 'refunds', label: 'İadeler', href: '/admin/finance/refunds' },
  { key: 'audit', label: 'Denetim izi', href: '/admin/finance/audit' },
];

export function FinanceNavigation({
  active,
  role,
}: {
  active: FinanceSection;
  role: string;
}) {
  const sections = FINANCE_SECTIONS.filter(
    (item) => item.key !== 'audit' || can(role, 'audit.read'),
  );
  return (
    <div className="overflow-x-auto pb-1">
      <AdminSegmentedControl
        label="Finans çalışma alanları"
        items={sections.map((item) => ({
          label: item.label,
          href: item.href,
          active: item.key === active,
        }))}
      />
    </div>
  );
}
