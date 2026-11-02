import {
  Button, Card, CardBody, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Textarea, useDisclosure,
} from '@heroui/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import DownloadButton from '@/components/DownloadButton';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { dateTime, toLocalInput } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { Assignment, CourseDetail, Listish, Submission } from '@/types';

function SubmissionRow({ s, max, onGraded }: { s: Submission; max: number; onGraded: () => void }) {
  const [score, setScore] = useState(String(s.score ?? ''));
  const [feedback, setFeedback] = useState(s.feedback || '');
  const [busy, setBusy] = useState(false);
  async function grade() {
    setBusy(true);
    try { await api(`submissions/${s.id}/grade/`, { method: 'POST', body: { score: Number(score), feedback } }); toast.success('Graded'); onGraded(); }
    catch (e) { toast.error('Could not grade', errorMessage(e)); } finally { setBusy(false); }
  }
  return (
    <Card shadow="sm"><CardBody className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{s.student_name}</p>
        <div className="flex gap-2">{s.is_late && <Chip size="sm" color="warning" variant="flat">Late</Chip>}<span className="text-xs text-default-400">{dateTime(s.submitted_at)}</span></div></div>
      {s.text && <p className="whitespace-pre-wrap rounded-lg bg-default-100 p-3 text-sm">{s.text}</p>}
      {s.file && <DownloadButton file={s.file} size="sm" variant="flat" className="w-fit">Download file</DownloadButton>}
      <div className="grid gap-2 sm:grid-cols-[110px_1fr_auto]">
        <Input type="number" min="0" max={String(max)} size="sm" aria-label="Score" placeholder={`/${max}`} value={score} onValueChange={setScore} />
        <Input size="sm" aria-label="Feedback" placeholder="Feedback" value={feedback} onValueChange={setFeedback} />
        <Button size="sm" color="primary" onPress={grade} isLoading={busy} isDisabled={score === ''}>{s.graded_at ? 'Update' : 'Grade'}</Button>
      </div>
    </CardBody></Card>
  );
}

function SubmissionsModal({ a, isOpen, onClose }: { a: Assignment; isOpen: boolean; onClose: () => void }) {
  const swr = useSWR<Listish<Submission>>(isOpen ? `assignments/${a.id}/submissions/` : null);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent><ModalHeader>Submissions: {a.title}</ModalHeader>
        <ModalBody className="space-y-3 pb-6">
          <DataState swr={swr} skeleton={<ListSkeleton rows={3} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No submissions yet" />}>
            {(d) => <>{list(d).map((s) => <SubmissionRow key={s.id} s={s} max={a.max_score} onGraded={() => { void swr.mutate(); }} />)}</>}
          </DataState>
        </ModalBody></ModalContent>
    </Modal>
  );
}

interface AssignmentForm { title: string; instructions: string; due_at: string; max_score: string; allow_late: boolean; is_published: boolean }

function AssignmentModal({ courseId, a, isOpen, onClose, onSaved }: { courseId: number; a: Assignment | null; isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<AssignmentForm | null>(null);
  const [busy, setBusy] = useState(false);
  // Reset the form each time the dialog opens for a (different) assignment.
  useEffect(() => {
    if (!isOpen) return;
    setF({ title: a?.title || '', instructions: a?.instructions || '', due_at: a?.due_at ? toLocalInput(a.due_at) : '', max_score: String(a?.max_score ?? 100),
      allow_late: a?.allow_late ?? false, is_published: a?.is_published ?? false });
  }, [isOpen, a]);
  const set = <K extends keyof AssignmentForm>(k: K) => (v: AssignmentForm[K]) => setF((s) => (s ? { ...s, [k]: v } : s));
  async function save() {
    if (!f) return;
    setBusy(true);
    const body = { course: courseId, title: f.title, instructions: f.instructions, max_score: Number(f.max_score) || 100,
      due_at: f.due_at ? new Date(f.due_at).toISOString() : null, allow_late: f.allow_late, is_published: f.is_published };
    try { await api(a ? `assignments/${a.id}/` : 'assignments/', { method: a ? 'PATCH' : 'POST', body }); toast.success('Assignment saved'); onSaved(); onClose(); }
    catch (e) { toast.error('Could not save', errorMessage(e)); } finally { setBusy(false); }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent><ModalHeader>{a ? 'Edit assignment' : 'New assignment'}</ModalHeader>
        <ModalBody>{f && (<div className="space-y-3">
          <Input label="Title" value={f.title} onValueChange={set('title')} />
          <Textarea label="Instructions (Markdown)" minRows={5} value={f.instructions} onValueChange={set('instructions')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="datetime-local" label="Due date" labelPlacement="outside-left" value={f.due_at} onValueChange={set('due_at')} />
            <Input type="number" min="1" label="Max score" value={f.max_score} onValueChange={set('max_score')} />
          </div>
          <Switch isSelected={f.allow_late} onValueChange={set('allow_late')}>Allow late submissions</Switch>
          <Switch isSelected={f.is_published} onValueChange={set('is_published')}>Published (visible to students)</Switch>
        </div>)}</ModalBody>
        <ModalFooter><Button variant="light" onPress={onClose}>Cancel</Button><Button color="primary" onPress={() => { void save(); }} isLoading={busy} isDisabled={!f?.title?.trim() || !f?.instructions?.trim()}>Save</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function AssignmentsTab({ course }: { course: CourseDetail }) {
  const swr = useSWR<Listish<Assignment>>(`assignments/?course=${course.id}`);
  const edit = useDisclosure();
  const subs = useDisclosure();
  const [current, setCurrent] = useState<Assignment | null>(null);
  async function remove(a: Assignment) {
    if (!window.confirm(`Delete assignment "${a.title}" and all submissions?`)) return;
    await api(`assignments/${a.id}/`, { method: 'DELETE' }); void swr.mutate();
  }
  return (
    <div className="max-w-3xl space-y-4">
      <Button color="primary" className="w-fit" startContent={<Plus size={16} />} onPress={() => { setCurrent(null); edit.onOpen(); }}>New assignment</Button>
      <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No assignments yet" />}>
        {(d) => <>{list(d).map((a) => (
          <Card key={a.id} shadow="sm"><CardBody className="flex flex-row flex-wrap items-center gap-3">
            <div className="grow"><p className="font-semibold">{a.title} {!a.is_published && <Chip size="sm" variant="flat">Draft</Chip>}</p>
              <p className="text-sm text-default-500">{a.due_at ? `Due ${dateTime(a.due_at)}` : 'No deadline'} · {a.max_score} points</p></div>
            <Button size="sm" variant="flat" onPress={() => { setCurrent(a); subs.onOpen(); }}>Submissions</Button>
            <Button size="sm" variant="flat" onPress={() => { setCurrent(a); edit.onOpen(); }}>Edit</Button>
            <Button size="sm" variant="light" color="danger" isIconOnly aria-label="Delete assignment" onPress={() => { void remove(a); }}><Trash2 size={14} /></Button>
          </CardBody></Card>
        ))}</>}
      </DataState>
      <AssignmentModal courseId={course.id} a={current} isOpen={edit.isOpen} onClose={edit.onClose} onSaved={() => { void swr.mutate(); }} />
      {current && <SubmissionsModal a={current} isOpen={subs.isOpen} onClose={subs.onClose} />}
    </div>
  );
}
