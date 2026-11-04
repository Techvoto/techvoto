import { Button } from '@heroui/react';
import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SWRResponse } from 'swr';
import { errorMessage } from '@/lib/api';

export function ErrorBox({ error, retry }: { error: unknown; retry?: () => unknown }) {
  return (
    <div role="alert" className="panel flex flex-wrap items-center gap-4 border-danger/30 bg-danger/5 p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger/10 text-danger"><AlertTriangle size={20} /></span>
      <div className="min-w-0 grow">
        <p className="font-semibold">We could not load this.</p>
        <p className="text-sm text-default-500">{errorMessage(error)}</p>
      </div>
      {retry && <Button size="sm" variant="flat" color="danger" onPress={() => { void retry(); }}>Try again</Button>}
    </div>
  );
}

interface EmptyProps { title?: string; text?: string; action?: ReactNode; icon?: LucideIcon }

export function EmptyState({ title = 'Nothing here yet', text, action, icon: Icon = Inbox }: EmptyProps) {
  return (
    <div className="grid place-items-center rounded-large border border-dashed border-default-300 bg-content1/60 px-6 py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon size={24} /></span>
      <p className="text-base font-semibold">{title}</p>
      {text && <p className="mt-1.5 max-w-md text-sm leading-6 text-default-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface Props<T> {
  swr: SWRResponse<T, unknown>;
  skeleton: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/** Renders the skeleton while loading, an error box on failure, an empty state when there is no data. */
export default function DataState<T>({ swr, skeleton, isEmpty, empty, children }: Props<T>) {
  const { data, error, isLoading, mutate } = swr;
  if (isLoading) return <>{skeleton}</>;
  if (error) return <ErrorBox error={error} retry={mutate} />;
  if (data === undefined) return <>{skeleton}</>;
  if (isEmpty?.(data)) return <>{empty ?? <EmptyState />}</>;
  return <>{children(data)}</>;
}
