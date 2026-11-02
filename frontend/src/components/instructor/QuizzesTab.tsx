import {
  Button, Card, CardBody, Checkbox, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select,
  SelectItem, Switch, Textarea, useDisclosure,
} from '@heroui/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import type { Choice, CourseDetail, Listish, Question, Quiz } from '@/types';

interface DraftChoice { text: string; is_correct: boolean }
interface DraftQuestion { prompt: string; kind: 'single' | 'multiple'; points: string; explanation: string; choices: DraftChoice[] }

const blankQ = (): DraftQuestion => ({ prompt: '', kind: 'single', points: '1', explanation: '', choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }] });

function QuestionEditor({ quizId, initial, nextOrder, onDone }: { quizId: number; initial?: Question; nextOrder: number; onDone: (saved?: boolean) => void }) {
  const [q, setQ] = useState<DraftQuestion>(initial
    ? { prompt: initial.prompt, kind: initial.kind, points: String(initial.points ?? 1), explanation: initial.explanation || '',
        choices: initial.choices.map((c: Choice) => ({ text: c.text, is_correct: !!c.is_correct })) }
    : blankQ());
  const [busy, setBusy] = useState(false);
  const setChoice = (i: number, patch: Partial<DraftChoice>) => setQ((s) => ({ ...s, choices: s.choices.map((c, j) => {
    if (j !== i) return s.kind === 'single' && patch.is_correct ? { ...c, is_correct: false } : c;   // single answer: only one correct
    return { ...c, ...patch };
  }) }));

  async function save() {
    setBusy(true);
    const body = { quiz: quizId, prompt: q.prompt, kind: q.kind, points: Number(q.points) || 1, explanation: q.explanation,
      order: initial?.order ?? nextOrder, choices: q.choices.filter((c) => c.text.trim()).map((c) => ({ text: c.text, is_correct: c.is_correct })) };
    try { await api(initial ? `questions/${initial.id}/` : 'questions/', { method: initial ? 'PUT' : 'POST', body }); onDone(); }
    catch (e) { toast.error('Could not save question', errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <Card shadow="none" className="border border-divider"><CardBody className="space-y-3">
      <Textarea label="Question" value={q.prompt} onValueChange={(v) => setQ({ ...q, prompt: v })} minRows={2} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Type" selectedKeys={[q.kind]} disallowEmptySelection onSelectionChange={(k) => setQ({ ...q, kind: firstKey(k) as 'single' | 'multiple', choices: q.choices.map((c, i) => ({ ...c, is_correct: i === 0 })) })}>
          <SelectItem key="single">Single answer</SelectItem><SelectItem key="multiple">Multiple answers</SelectItem>
        </Select>
        <Input type="number" min="1" label="Points" value={q.points} onValueChange={(v) => setQ({ ...q, points: v })} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Choices <span className="font-normal text-default-500">(tick the correct {q.kind === 'single' ? 'one' : 'ones'})</span></p>
        {q.choices.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <Checkbox aria-label="Correct" isSelected={c.is_correct} onValueChange={(v) => setChoice(i, { is_correct: v })} />
            <Input aria-label={`Choice ${i + 1}`} size="sm" placeholder={`Choice ${i + 1}`} value={c.text} onValueChange={(v) => setChoice(i, { text: v })} />
            <Button isIconOnly size="sm" variant="light" color="danger" aria-label="Remove choice" isDisabled={q.choices.length <= 2}
              onPress={() => setQ({ ...q, choices: q.choices.filter((_, j) => j !== i) })}><Trash2 size={14} /></Button>
          </div>
        ))}
        <Button size="sm" variant="flat" onPress={() => setQ({ ...q, choices: [...q.choices, { text: '', is_correct: false }] })}>Add choice</Button>
      </div>
      <Textarea label="Explanation (shown after the quiz)" value={q.explanation} onValueChange={(v) => setQ({ ...q, explanation: v })} minRows={1} />
      <div className="flex gap-2"><Button color="primary" onPress={() => { void save(); }} isLoading={busy} isDisabled={!q.prompt.trim()}>Save question</Button><Button variant="light" onPress={() => onDone(false)}>Cancel</Button></div>
    </CardBody></Card>
  );
}

function QuestionsModal({ quiz, isOpen, onClose, onChange }: { quiz: Quiz; isOpen: boolean; onClose: () => void; onChange: () => void }) {
  const swr = useSWR<Listish<Question>>(isOpen ? `quizzes/${quiz.id}/questions/` : null);
  const [editing, setEditing] = useState<'new' | Question | null>(null);
  const done = (saved = true) => { setEditing(null); if (saved) { void swr.mutate(); onChange(); } };
  async function remove(q: Question) {
    if (!window.confirm('Delete this question?')) return;
    await api(`questions/${q.id}/`, { method: 'DELETE' }); void swr.mutate(); onChange();
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Questions: {quiz.title}</ModalHeader>
        <ModalBody className="space-y-3 pb-6">
          <DataState swr={swr} skeleton={<ListSkeleton rows={3} />}>
            {(d) => (
              <>
                {list(d).map((q, i) => (editing && editing !== 'new' && editing.id === q.id ? (
                  <QuestionEditor key={q.id} quizId={quiz.id} initial={q} nextOrder={i + 1} onDone={done} />
                ) : (
                  <Card key={q.id} shadow="sm"><CardBody className="space-y-1">
                    <div className="flex items-start justify-between gap-2"><p className="font-semibold">{i + 1}. {q.prompt}</p>
                      <div className="flex shrink-0"><Button isIconOnly size="sm" variant="light" aria-label="Edit question" onPress={() => setEditing(q)}><Pencil size={14} /></Button>
                        <Button isIconOnly size="sm" variant="light" color="danger" aria-label="Delete question" onPress={() => { void remove(q); }}><Trash2 size={14} /></Button></div></div>
                    <ul className="text-sm">{q.choices.map((c) => <li key={c.id} className={c.is_correct ? 'font-semibold text-success' : 'text-default-600'}>{c.is_correct ? '✓' : '○'} {c.text}</li>)}</ul>
                  </CardBody></Card>
                )))}
                {editing === 'new' ? <QuestionEditor quizId={quiz.id} nextOrder={list(d).length + 1} onDone={done} />
                  : !editing && <Button variant="flat" className="w-fit" startContent={<Plus size={14} />} onPress={() => setEditing('new')}>Add question</Button>}
              </>
            )}
          </DataState>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

interface QuizForm { title: string; description: string; pass_mark_pct: string; time_limit_minutes: string; max_attempts: string; is_required: boolean; is_published: boolean }

function QuizModal({ courseId, quiz, isOpen, onClose, onSaved }: { courseId: number; quiz: Quiz | null; isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<QuizForm | null>(null);
  const [busy, setBusy] = useState(false);
  // Reset the form each time the dialog opens for a (different) quiz.
  useEffect(() => {
    if (!isOpen) return;
    setF({ title: quiz?.title || '', description: quiz?.description || '', pass_mark_pct: String(quiz?.pass_mark_pct ?? 70),
      time_limit_minutes: quiz?.time_limit_minutes ? String(quiz.time_limit_minutes) : '', max_attempts: quiz?.max_attempts ? String(quiz.max_attempts) : '',
      is_required: quiz?.is_required ?? false, is_published: quiz?.is_published ?? false });
  }, [isOpen, quiz]);
  const set = <K extends keyof QuizForm>(k: K) => (v: QuizForm[K]) => setF((s) => (s ? { ...s, [k]: v } : s));

  async function save() {
    if (!f) return;
    setBusy(true);
    const body = { course: courseId, title: f.title, description: f.description, pass_mark_pct: Number(f.pass_mark_pct),
      time_limit_minutes: f.time_limit_minutes ? Number(f.time_limit_minutes) : null, max_attempts: f.max_attempts ? Number(f.max_attempts) : null,
      is_required: f.is_required, is_published: f.is_published };
    try { await api(quiz ? `quizzes/${quiz.id}/` : 'quizzes/', { method: quiz ? 'PATCH' : 'POST', body }); toast.success('Quiz saved'); onSaved(); onClose(); }
    catch (e) { toast.error('Could not save quiz', errorMessage(e)); } finally { setBusy(false); }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{quiz ? 'Edit quiz' : 'New quiz'}</ModalHeader>
        <ModalBody>{f && (<div className="space-y-3">
          <Input label="Title" value={f.title} onValueChange={set('title')} />
          <Textarea label="Description" value={f.description} onValueChange={set('description')} />
          <div className="grid grid-cols-3 gap-2">
            <Input type="number" min="1" max="100" label="Pass %" value={f.pass_mark_pct} onValueChange={set('pass_mark_pct')} />
            <Input type="number" min="1" label="Minutes" description="Blank: none" value={f.time_limit_minutes} onValueChange={set('time_limit_minutes')} />
            <Input type="number" min="1" label="Attempts" description="Blank: ∞" value={f.max_attempts} onValueChange={set('max_attempts')} />
          </div>
          <Switch isSelected={f.is_required} onValueChange={set('is_required')}>Required for the certificate</Switch>
          <Switch isSelected={f.is_published} onValueChange={set('is_published')}>Published (visible to students)</Switch>
        </div>)}</ModalBody>
        <ModalFooter><Button variant="light" onPress={onClose}>Cancel</Button><Button color="primary" onPress={() => { void save(); }} isLoading={busy} isDisabled={!f?.title?.trim()}>Save</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function QuizzesTab({ course }: { course: CourseDetail }) {
  const swr = useSWR<Listish<Quiz>>(`quizzes/?course=${course.id}`);
  const quizModal = useDisclosure();
  const qModal = useDisclosure();
  const [current, setCurrent] = useState<Quiz | null>(null);

  async function remove(q: Quiz) {
    if (!window.confirm(`Delete quiz "${q.title}" and its attempts?`)) return;
    await api(`quizzes/${q.id}/`, { method: 'DELETE' }); void swr.mutate();
  }
  return (
    <div className="max-w-3xl space-y-4">
      <Button color="primary" className="w-fit" startContent={<Plus size={16} />} onPress={() => { setCurrent(null); quizModal.onOpen(); }}>New quiz</Button>
      <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No quizzes yet" />}>
        {(d) => <>{list(d).map((q) => (
          <Card key={q.id} shadow="sm"><CardBody className="flex flex-row flex-wrap items-center gap-3">
            <div className="grow"><p className="font-semibold">{q.title} {q.is_required && <Chip size="sm" color="warning" variant="flat">Required</Chip>} {!q.is_published && <Chip size="sm" variant="flat">Draft</Chip>}</p>
              <p className="text-sm text-default-500">{q.question_count} questions · pass {q.pass_mark_pct}%</p></div>
            <Button size="sm" variant="flat" onPress={() => { setCurrent(q); qModal.onOpen(); }}>Questions</Button>
            <Button size="sm" variant="flat" onPress={() => { setCurrent(q); quizModal.onOpen(); }}>Edit</Button>
            <Button size="sm" variant="light" color="danger" isIconOnly aria-label="Delete quiz" onPress={() => { void remove(q); }}><Trash2 size={14} /></Button>
          </CardBody></Card>
        ))}</>}
      </DataState>
      <QuizModal courseId={course.id} quiz={current} isOpen={quizModal.isOpen} onClose={quizModal.onClose} onSaved={() => { void swr.mutate(); }} />
      {current && <QuestionsModal quiz={current} isOpen={qModal.isOpen} onClose={qModal.onClose} onChange={() => { void swr.mutate(); }} />}
    </div>
  );
}
