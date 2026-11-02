import type { ReactNode } from 'react';

interface Props { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-default-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
