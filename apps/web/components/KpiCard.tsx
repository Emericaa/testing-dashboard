import { Card } from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string | number | null | undefined;
  subtitle?: string;
}

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-800">{value ?? '--'}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
    </Card>
  );
}
