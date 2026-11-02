import { Card, CardBody } from '@heroui/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props { label: string; value: ReactNode; icon?: LucideIcon; hint?: string }

export default function StatCard({ label, value, icon: Icon, hint }: Props) {
  return (
    <Card shadow="sm"><CardBody className="flex flex-row items-center gap-4 p-5">
      {Icon && <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={20} /></div>}
      <div className="min-w-0">
        <p className="text-sm text-default-500">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="text-xs text-default-500">{hint}</p>}
      </div>
    </CardBody></Card>
  );
}
