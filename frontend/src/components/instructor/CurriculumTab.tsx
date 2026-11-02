import {
  Button, Card, CardBody, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem,
  Switch, Textarea, useDisclosure,
} from '@heroui/react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import type { CourseDetail, Lesson, Section } from '@/types';

interface LessonForm { title: string; kind: string; video_url: string; content: string; duration_minutes: string; is_free_preview: boolean }

interface LessonModalProps { sectionId: number; order: number; lessonId: number | null; isOpen: boolean; onClose: () => void; onSaved: () => void }

function LessonModal({ sectionId, order, lessonId, isOpen, onClose, onSaved }: LessonModalProps) {
  const [f, setF] = useState<LessonForm | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof LessonForm>(k: K) => (v: LessonForm[K]) => setF((s) => (s ? { ...s, [k]: v } : s));

  useEffect(() => {
    if (!isOpen) return undefined;
    let stop = false;
    setFile(null); setF(null);
    if (lessonId) {
      api<Lesson>(`lessons/${lessonId}/`).then((l) => {
        if (!stop) setF({ title: l.title, kind: l.kind, video_url: l.video_url || '', content: l.content || '', duration_minutes: String(l.duration_minutes), is_free_preview: !!l.is_free_preview });
      }).catch((e: unknown) => toast.error('Could not load lesson', errorMessage(e)));
    } else {
      setF({ title: '', kind: 'video', video_url: '', content: '', duration_minutes: '10', is_free_preview: false });
    }
    return () => { stop = true; };
  }, [isOpen, lessonId]);

  async function save() {
    if (!f) return;
    const form = new FormData();
    Object.entries({ ...f, section: sectionId }).forEach(([k, v]) => form.append(k, String(v)));
    if (!lessonId) form.append('order', String(order));
    if (file) form.append('resource', file);
    setBusy(true);
    try {
      await api(lessonId ? `lessons/${lessonId}/` : 'lessons/', { method: lessonId ? 'PATCH' : 'POST', form });
      toast.success('Lesson saved'); onSaved(); onClose();
    } catch (e) { toast.error('Could not save lesson', errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{lessonId ? 'Edit lesson' : 'New lesson'}</ModalHeader>
        <ModalBody>
          {!f ? <p className="text-sm text-default-500">Loading...</p> : (
            <div className="space-y-3">
              <Input label="Title" value={f.title} onValueChange={set('title')} isRequired />
              <div className="grid gap-3 sm:grid-cols-2">
                <Select label="Type" selectedKeys={[f.kind]} disallowEmptySelection onSelectionChange={(k) => set('kind')(firstKey(k))}>
                  <SelectItem key="video">Video</SelectItem><SelectItem key="text">Reading</SelectItem><SelectItem key="file">Downloadable file</SelectItem>
                </Select>
                <Input type="number" min="0" label="Duration (minutes)" value={f.duration_minutes} onValueChange={set('duration_minutes')} />
              </div>
              <Input label="Video URL (YouTube or direct .mp4)" value={f.video_url} onValueChange={set('video_url')} />
              <Textarea label="Lesson content (Markdown)" minRows={6} value={f.content} onValueChange={set('content')} />
              <div><label className="mb-1 block text-sm text-default-600">Attachment (PDF, ZIP, Office files, images; max 25 MB)</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" /></div>
              <Switch isSelected={f.is_free_preview} onValueChange={set('is_free_preview')}>Free preview (visible to everyone)</Switch>
            </div>
          )}
        </ModalBody>
        <ModalFooter><Button variant="light" onPress={onClose}>Cancel</Button><Button color="primary" onPress={() => { void save(); }} isLoading={busy} isDisabled={!f?.title?.trim()}>Save lesson</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface SectionBlockProps { section: Section; index: number; all: Section[]; onChange: () => void }

function SectionBlock({ section, index, all, onChange }: SectionBlockProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const modal = useDisclosure();
  const [lessonId, setLessonId] = useState<number | null>(null);

  async function moveSection(dir: -1 | 1) {
    const a = all[index], b = all[index + dir];
    if (!a || !b) return;
    await Promise.all([[a, index + dir + 1], [b, index + 1]].map(([s, order]) => api(`sections/${(s as Section).id}/`, { method: 'PATCH', body: { order } })));
    onChange();
  }
  async function moveLesson(i: number, dir: -1 | 1) {
    const a = section.lessons[i], b = section.lessons[i + dir];
    if (!a || !b) return;
    await Promise.all([[a, i + dir + 1], [b, i + 1]].map(([l, order]) => api(`lessons/${(l as Lesson).id}/`, { method: 'PATCH', body: { order } })));
    onChange();
  }
  async function rename() { await api(`sections/${section.id}/`, { method: 'PATCH', body: { title } }); setEditing(false); onChange(); }
  async function removeSection() {
    if (!window.confirm(`Delete section "${section.title}" and all its lessons?`)) return;
    await api(`sections/${section.id}/`, { method: 'DELETE' }); onChange();
  }
  async function removeLesson(l: Lesson) {
    if (!window.confirm(`Delete lesson "${l.title}"?`)) return;
    await api(`lessons/${l.id}/`, { method: 'DELETE' }); onChange();
  }

  return (
    <Card shadow="sm"><CardBody className="space-y-3">
      <div className="flex items-center gap-2">
        {editing ? (
          <><Input size="sm" aria-label="Section title" value={title} onValueChange={setTitle} /><Button size="sm" color="primary" onPress={() => { void rename(); }}>Save</Button><Button size="sm" variant="light" onPress={() => setEditing(false)}>Cancel</Button></>
        ) : (
          <>
            <p className="grow font-semibold">{section.title}</p>
            <Button isIconOnly size="sm" variant="light" aria-label="Move up" isDisabled={index === 0} onPress={() => { void moveSection(-1); }}><ArrowUp size={14} /></Button>
            <Button isIconOnly size="sm" variant="light" aria-label="Move down" isDisabled={index === all.length - 1} onPress={() => { void moveSection(1); }}><ArrowDown size={14} /></Button>
            <Button isIconOnly size="sm" variant="light" aria-label="Rename section" onPress={() => setEditing(true)}><Pencil size={14} /></Button>
            <Button isIconOnly size="sm" variant="light" color="danger" aria-label="Delete section" onPress={() => { void removeSection(); }}><Trash2 size={14} /></Button>
          </>
        )}
      </div>
      <ul className="divide-y divide-divider rounded-lg border border-divider">
        {section.lessons.length === 0 && <li className="p-3 text-sm text-default-500">No lessons yet.</li>}
        {section.lessons.map((l, i) => (
          <li key={l.id} className="flex items-center gap-2 p-2 pl-3 text-sm">
            <span className="grow">{l.title} <span className="text-xs text-default-400">· {l.kind}{l.is_free_preview ? ' · preview' : ''}</span></span>
            <Button isIconOnly size="sm" variant="light" aria-label="Move lesson up" isDisabled={i === 0} onPress={() => { void moveLesson(i, -1); }}><ArrowUp size={14} /></Button>
            <Button isIconOnly size="sm" variant="light" aria-label="Move lesson down" isDisabled={i === section.lessons.length - 1} onPress={() => { void moveLesson(i, 1); }}><ArrowDown size={14} /></Button>
            <Button isIconOnly size="sm" variant="light" aria-label="Edit lesson" onPress={() => { setLessonId(l.id); modal.onOpen(); }}><Pencil size={14} /></Button>
            <Button isIconOnly size="sm" variant="light" color="danger" aria-label="Delete lesson" onPress={() => { void removeLesson(l); }}><Trash2 size={14} /></Button>
          </li>
        ))}
      </ul>
      <Button size="sm" variant="flat" className="w-fit" startContent={<Plus size={14} />} onPress={() => { setLessonId(null); modal.onOpen(); }}>Add lesson</Button>
      <LessonModal sectionId={section.id} order={section.lessons.length + 1} lessonId={lessonId} isOpen={modal.isOpen} onClose={modal.onClose} onSaved={onChange} />
    </CardBody></Card>
  );
}

export default function CurriculumTab({ course, onChange }: { course: CourseDetail; onChange: () => void }) {
  const [title, setTitle] = useState('');
  async function add() {
    try { await api('sections/', { method: 'POST', body: { course: course.id, title, order: course.sections.length + 1 } }); setTitle(''); onChange(); }
    catch (e) { toast.error('Could not add section', errorMessage(e)); }
  }
  return (
    <div className="max-w-3xl space-y-4">
      {course.sections.map((s, i) => <SectionBlock key={s.id} section={s} index={i} all={course.sections} onChange={onChange} />)}
      <div className="flex gap-2">
        <Input aria-label="New section title" placeholder="New section title" value={title} onValueChange={setTitle} />
        <Button color="primary" onPress={() => { void add(); }} isDisabled={!title.trim()} startContent={<Plus size={16} />}>Add section</Button>
      </div>
    </div>
  );
}
