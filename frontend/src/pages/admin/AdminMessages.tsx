import { Button, Card, CardBody, Chip, Select, SelectItem } from '@heroui/react';
import { Inbox, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { ContactMessage, Listish } from '@/types';

export default function AdminMessages() {
  useTitle('Messages');
  const [filter, setFilter] = useState('false');
  const swr = useSWR<Listish<ContactMessage>>(`contact/messages/?handled=${filter}`);

  async function toggle(m: ContactMessage) {
    try { await api(`contact/messages/${m.id}/`, { method: 'PATCH', body: { is_handled: !m.is_handled } }); void swr.mutate(); }
    catch (e) { toast.error('Could not update', errorMessage(e)); }
  }
  async function remove(m: ContactMessage) {
    if (!window.confirm('Delete this message?')) return;
    await api(`contact/messages/${m.id}/`, { method: 'DELETE' }); void swr.mutate();
  }

  return (
    <>
      <PageHeader title="Messages" subtitle="Submissions from the contact form." />
      <Select aria-label="Filter" className="mb-4 max-w-xs" selectedKeys={[filter]} disallowEmptySelection onSelectionChange={(k) => setFilter(firstKey(k))}>
        <SelectItem key="false">Open</SelectItem><SelectItem key="true">Handled</SelectItem>
      </Select>
      <DataState swr={swr} skeleton={<ListSkeleton rows={3} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState icon={Inbox} title="Inbox zero" text="No messages here." />}>
        {(d) => (
          <div className="space-y-3">
            {list(d).map((m) => (
              <Card key={m.id} shadow="sm"><CardBody className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><p className="font-semibold">{m.subject}</p><p className="text-xs text-default-500">{m.name} · {m.email} · {timeAgo(m.created_at)}</p></div>
                  {m.is_handled && <Chip size="sm" color="success" variant="flat">Handled</Chip>}
                </div>
                <p className="whitespace-pre-wrap text-sm">{m.message}</p>
                <div className="flex gap-2">
                  <Button as="a" size="sm" variant="flat" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`} startContent={<Mail size={14} />}>Reply</Button>
                  <Button size="sm" variant="flat" onPress={() => { void toggle(m); }}>{m.is_handled ? 'Reopen' : 'Mark handled'}</Button>
                  <Button isIconOnly size="sm" variant="light" color="danger" aria-label="Delete" onPress={() => { void remove(m); }}><Trash2 size={14} /></Button>
                </div>
              </CardBody></Card>
            ))}
          </div>
        )}
      </DataState>
    </>
  );
}
