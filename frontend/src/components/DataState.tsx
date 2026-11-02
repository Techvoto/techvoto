import { Button, Card, CardBody } from '@heroui/react';
import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SWRResponse } from 'swr';
import { errorMessage } from '@/lib/api';

export function ErrorBox({ error, retry }: { error: unknown; retry?: () => unknown }) {
  return (
    <Card shadow="sm" className="border-l-4 border-l-danger"><CardBody className="flex flex-row items-center gap-4">
      <AlertTriangle className="shrink-0 text-danger" />
      <div className="grow">
        <p className="font-semibold">We could not load this.</p>
        <p className="text-sm text-default-500">{errorMessage(error)}</p>
      </div>
      {retry && <Button size="sm" variant="flat" onPress={() => { void retry(); }}>Try again</Button>}
    </CardBody></Card>
  );
}

interface EmptyProps { title?: string; text?: string; action?: ReactNode; icon?: LucideIcon }

export function EmptyState({ title = 'Nothing here yet', text, action, icon: Icon = Inbox }: EmptyProps) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-default-300 bg-content1 px-6 py-14 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-default-100 text-default-500"><Icon size={22} /></span>
      <p className="text-base font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-md text-sm text-default-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
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
