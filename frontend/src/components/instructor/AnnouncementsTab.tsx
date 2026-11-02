import { Button, Card, CardBody, Input, Textarea } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import Markdown from '@/components/Markdown';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { Announcement, CourseDetail, Listish } from '@/types';

export default function AnnouncementsTab({ course }: { course: CourseDetail }) {
  const swr = useSWR<Listish<Announcement>>(`announcements/?course=${course.id}`);
  const [f, setF] = useState({ title: '', body: '' });
  const [busy, setBusy] = useState(false);
  async function post() {
    setBusy(true);
    try { await api('announcements/', { method: 'POST', body: { course: course.id, ...f } }); setF({ title: '', body: '' }); toast.success('Announcement sent to students'); void swr.mutate(); }
    catch (e) { toast.error('Could not post', errorMessage(e)); } finally { setBusy(false); }
  }
  async function remove(a: Announcement) { if (window.confirm('Delete this announcement?')) { await api(`announcements/${a.id}/`, { method: 'DELETE' }); void swr.mutate(); } }
  return (
    <div className="max-w-3xl space-y-4">
      <Card shadow="sm"><CardBody className="space-y-3">
        <Input label="Title" value={f.title} onValueChange={(v) => setF({ ...f, title: v })} />
        <Textarea label="Message (Markdown)" value={f.body} onValueChange={(v) => setF({ ...f, body: v })} />
        <Button color="primary" className="w-fit" onPress={post} isLoading={busy} isDisabled={!f.title.trim() || !f.body.trim()}>Notify students</Button>
      </CardBody></Card>
      <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No announcements yet" />}>
        {(d) => <>{list(d).map((a) => (
          <Card key={a.id} shadow="sm"><CardBody>
            <div className="flex items-start justify-between"><div><p className="font-semibold">{a.title}</p><p className="text-xs text-default-400">{timeAgo(a.created_at)}</p></div>
              <Button isIconOnly size="sm" variant="light" color="danger" aria-label="Delete announcement" onPress={() => { void remove(a); }}><Trash2 size={14} /></Button></div>
            <Markdown>{a.body}</Markdown>
          </CardBody></Card>
        ))}</>}
      </DataState>
    </div>
  );
}
