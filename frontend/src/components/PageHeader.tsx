import type { ReactNode } from 'react';

interface Props { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: string }

export default function PageHeader({ title, subtitle, actions, eyebrow }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <div className="mt-1.5 text-default-500">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
