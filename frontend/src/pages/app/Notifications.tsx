import { Button, Card, CardBody } from '@heroui/react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSWR, { mutate as globalMutate } from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/Skeletons';
import { api, list } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { useTitle } from '@/lib/useTitle';
import type { Listish, NotificationItem } from '@/types';

export default function Notifications() {
  useTitle('Notifications');
  const swr = useSWR<Listish<NotificationItem>>('notifications/');
  const navigate = useNavigate();

  async function open(n: NotificationItem) {
    if (!n.is_read) { await api(`notifications/${n.id}/read/`, { method: 'POST' }); void swr.mutate(); void globalMutate('notifications/unread-count/'); }
    if (n.link) navigate(n.link);
  }
  async function readAll() { await api('notifications/read-all/', { method: 'POST' }); void swr.mutate(); void globalMutate('notifications/unread-count/'); }

  return (
    <>
      <PageHeader title="Notifications" actions={<Button variant="flat" onPress={() => { void readAll(); }}>Mark all as read</Button>} />
      <DataState swr={swr} skeleton={<ListSkeleton />} isEmpty={(d) => list(d).length === 0}
        empty={<EmptyState icon={Bell} title="You are all caught up" />}>
        {(d) => (
          <div className="space-y-2">
            {list(d).map((n) => (
              <Card key={n.id} isPressable onPress={() => { void open(n); }} shadow="sm" className={`w-full border text-left ${n.is_read ? 'border-divider' : 'border-primary/30 bg-primary/5'}`}>
                <CardBody className="flex flex-row items-start gap-3 p-4">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.is_read ? 'bg-default-300' : 'bg-primary'}`} />
                  <div className="grow"><p className={n.is_read ? '' : 'font-semibold'}>{n.title}</p>{n.body && <p className="text-sm text-default-500">{n.body}</p>}</div>
                  <span className="shrink-0 text-xs text-default-400">{timeAgo(n.created_at)}</span>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </DataState>
    </>
  );
}
