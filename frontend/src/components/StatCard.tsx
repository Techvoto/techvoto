import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const TONES: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning-700 dark:text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-default-100 text-default-700',
};

interface Props { label: string; value: ReactNode; icon?: LucideIcon; hint?: string; tone?: Tone }

export default function StatCard({ label, value, icon: Icon, hint, tone = 'primary' }: Props) {
  return (
    <div className="panel flex items-start gap-4 p-5">
      {Icon && (
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}><Icon size={20} /></div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-default-500">{label}</p>
        <p className="mt-0.5 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-default-500">{hint}</p>}
      </div>
    </div>
  );
}
