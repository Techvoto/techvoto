import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import LiveCard from '@/components/LiveCard';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { dateTime, toLocalInput } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { Attendance, CourseDetail, Listish, LiveClass } from '@/types';

function ScheduleModal({ courseId, isOpen, onClose, onSaved }: { courseId: number; isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ title: '', description: '', starts_at: toLocalInput(new Date(Date.now() + 86400000).toISOString()), duration_minutes: '60' });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  async function save() {
    setBusy(true);
    try {
      await api('live-classes/', { method: 'POST', body: { course: courseId, title: f.title, description: f.description, starts_at: new Date(f.starts_at).toISOString(), duration_minutes: Number(f.duration_minutes) } });
      toast.success('Class scheduled. Students have been notified.'); onSaved(); onClose();
    } catch (e) { toast.error('Could not schedule', errorMessage(e)); } finally { setBusy(false); }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent><ModalHeader>Schedule a live class</ModalHeader>
        <ModalBody className="space-y-3">
          <Input label="Title" value={f.title} onValueChange={set('title')} />
          <Textarea label="Description" value={f.description} onValueChange={set('description')} />
          <Input type="datetime-local" label="Starts at" value={f.starts_at} onValueChange={set('starts_at')} />
          <Input type="number" min="5" max="480" label="Duration (minutes)" value={f.duration_minutes} onValueChange={set('duration_minutes')} />
        </ModalBody>
        <ModalFooter><Button variant="light" onPress={onClose}>Cancel</Button><Button color="primary" onPress={() => { void save(); }} isLoading={busy} isDisabled={!f.title.trim()}>Schedule</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function AttendanceModal({ live, isOpen, onClose }: { live: LiveClass; isOpen: boolean; onClose: () => void }) {
  const swr = useSWR<Listish<Attendance>>(isOpen ? `live-classes/${live.id}/attendance/` : null);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent><ModalHeader>Attendance: {live.title}</ModalHeader>
        <ModalBody className="pb-6">
          <DataState swr={swr} skeleton={<ListSkeleton rows={3} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="Nobody has joined yet" />}>
            {(d) => (
              <Table aria-label="Attendance" removeWrapper>
                <TableHeader><TableColumn>Student</TableColumn><TableColumn>First joined</TableColumn><TableColumn>Joins</TableColumn></TableHeader>
                <TableBody>{list(d).map((r, i) => <TableRow key={i}><TableCell>{r.student}<p className="text-xs text-default-400">{r.email}</p></TableCell><TableCell>{dateTime(r.first_joined_at)}</TableCell><TableCell>{r.join_count}</TableCell></TableRow>)}</TableBody>
              </Table>
            )}
          </DataState>
        </ModalBody></ModalContent>
    </Modal>
  );
}

export default function LiveTab({ course }: { course: CourseDetail }) {
  const swr = useSWR<Listish<LiveClass>>(`live-classes/?course=${course.id}`);
  const sched = useDisclosure();
  const att = useDisclosure();
  const [current, setCurrent] = useState<LiveClass | null>(null);
  async function cancel(l: LiveClass) {
    if (!window.confirm('Cancel this class? Students will be notified.')) return;
    try { await api(`live-classes/${l.id}/cancel/`, { method: 'POST' }); void swr.mutate(); } catch (e) { toast.error('Could not cancel', errorMessage(e)); }
  }
  return (
    <div className="max-w-3xl space-y-4">
      <Button color="primary" className="w-fit" startContent={<Plus size={16} />} onPress={sched.onOpen}>Schedule class</Button>
      <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No live classes yet" />}>
        {(d) => <div className="space-y-3">{list(d).map((l) => (
          <LiveCard key={l.id} live={l} extra={<>
            <Button size="sm" variant="flat" onPress={() => { setCurrent(l); att.onOpen(); }}>Attendance</Button>
            {['scheduled', 'live'].includes(l.status) && <Button size="sm" variant="light" color="danger" onPress={() => { void cancel(l); }}>Cancel</Button>}
          </>} />
        ))}</div>}
      </DataState>
      <ScheduleModal courseId={course.id} isOpen={sched.isOpen} onClose={sched.onClose} onSaved={() => { void swr.mutate(); }} />
      {current && <AttendanceModal live={current} isOpen={att.isOpen} onClose={att.onClose} />}
    </div>
  );
}
