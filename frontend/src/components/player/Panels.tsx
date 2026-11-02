import { Button, Card, CardBody, Chip, Input, Textarea } from '@heroui/react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import DownloadButton from '@/components/DownloadButton';
import LiveCard from '@/components/LiveCard';
import Markdown from '@/components/Markdown';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { dateTime, timeAgo } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { Announcement, Assignment, Listish, LiveClass, Quiz, Reply, Thread as ThreadType } from '@/types';

export function QuizPanel({ courseId }: { courseId: number }) {
  const swr = useSWR<Listish<Quiz>>(`quizzes/?course=${courseId}`);
  return (
    <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).filter((q) => q.is_published).length === 0}
      empty={<EmptyState title="No quizzes yet" text="Quizzes will appear here when your instructor publishes them." />}>
      {(d) => (
        <div className="space-y-3">
          {list(d).filter((q) => q.is_published).map((q) => (
            <Card key={q.id} shadow="sm"><CardBody className="flex flex-row flex-wrap items-center gap-4">
              <div className="grow">
                <p className="font-semibold">{q.title} {q.is_required && <Chip size="sm" color="warning" variant="flat" className="ml-1">Required</Chip>}</p>
                <p className="text-sm text-default-500">
                  {q.question_count} questions · pass mark {q.pass_mark_pct}%{q.time_limit_minutes ? ` · ${q.time_limit_minutes} min` : ''}
                  {q.max_attempts ? ` · ${q.attempts_used}/${q.max_attempts} attempts` : ''}
                  {q.best_score_pct != null ? ` · best ${q.best_score_pct}%` : ''}
                </p>
              </div>
              <Button as={Link} to={`/quizzes/${q.id}`} color="primary" variant={q.best_score_pct != null ? 'flat' : 'solid'}
                isDisabled={!!q.max_attempts && q.attempts_used >= q.max_attempts}>{q.attempts_used ? 'Retake' : 'Start'}</Button>
            </CardBody></Card>
          ))}
        </div>
      )}
    </DataState>
  );
}

function AssignmentCard({ a, onChange }: { a: Assignment; onChange: () => void }) {
  const [text, setText] = useState(a.my_submission?.text || '');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const sub = a.my_submission;
  const locked = !!sub?.graded_at;
  const overdue = !!a.due_at && new Date(a.due_at) < new Date() && !a.allow_late;

  async function submit() {
    const form = new FormData();
    if (text) form.append('text', text);
    if (file) form.append('file', file);
    setBusy(true);
    try { await api(`assignments/${a.id}/submit/`, { method: 'POST', form }); toast.success('Submitted'); onChange(); }
    catch (e) { toast.error('Could not submit', errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <Card shadow="sm"><CardBody className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{a.title}</p>
        <div className="flex gap-2">
          {a.due_at && <Chip size="sm" variant="flat" color={overdue ? 'danger' : 'default'}>Due {dateTime(a.due_at)}</Chip>}
          {sub?.graded_at ? <Chip size="sm" color="success" variant="flat">Graded {sub.score}/{a.max_score}</Chip>
            : sub ? <Chip size="sm" color="primary" variant="flat">Submitted</Chip> : <Chip size="sm" variant="flat">Not submitted</Chip>}
        </div>
      </div>
      <Markdown>{a.instructions}</Markdown>
      {sub?.feedback && <div className="rounded-lg bg-success/10 p-3 text-sm"><p className="font-semibold">Instructor feedback</p>{sub.feedback}</div>}
      {sub?.file && <DownloadButton file={sub.file} size="sm" variant="flat" className="w-fit">Download my file</DownloadButton>}
      {!locked && !overdue && (
        <div className="space-y-2">
          <Textarea aria-label="Your answer" placeholder="Write your answer or paste a link to your work" value={text} onValueChange={setText} />
          <input type="file" aria-label="Attach file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          <div><Button color="primary" onPress={submit} isLoading={busy} isDisabled={!text && !file}>{sub ? 'Resubmit' : 'Submit'}</Button></div>
        </div>
      )}
      {overdue && !sub && <p className="text-sm text-danger">The deadline has passed.</p>}
    </CardBody></Card>
  );
}

export function AssignmentPanel({ courseId }: { courseId: number }) {
  const swr = useSWR<Listish<Assignment>>(`assignments/?course=${courseId}`);
  return (
    <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).filter((a) => a.is_published).length === 0}
      empty={<EmptyState title="No assignments" text="Your instructor has not posted any assignments yet." />}>
      {(d) => <div className="space-y-4">{list(d).filter((a) => a.is_published).map((a) => <AssignmentCard key={a.id} a={a} onChange={() => { void swr.mutate(); }} />)}</div>}
    </DataState>
  );
}

export function AnnouncementPanel({ courseId }: { courseId: number }) {
  const swr = useSWR<Listish<Announcement>>(`announcements/?course=${courseId}`);
  return (
    <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0}
      empty={<EmptyState title="No announcements" />}>
      {(d) => <div className="space-y-3">{list(d).map((a) => (
        <Card key={a.id} shadow="sm"><CardBody>
          <p className="font-semibold">{a.title}</p>
          <p className="mb-2 text-xs text-default-400">{a.author_name} · {timeAgo(a.created_at)}</p>
          <Markdown>{a.body}</Markdown>
        </CardBody></Card>))}</div>}
    </DataState>
  );
}

export function LivePanel({ courseId }: { courseId: number }) {
  const swr = useSWR<Listish<LiveClass>>(`live-classes/?course=${courseId}`);
  return (
    <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0}
      empty={<EmptyState title="No live classes scheduled" />}>
      {(d) => <div className="space-y-3">{list(d).map((l) => <LiveCard key={l.id} live={l} />)}</div>}
    </DataState>
  );
}

function ThreadCard({ t, canModerate, onChange }: { t: ThreadType; canModerate: boolean; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const replies = useSWR<Listish<Reply>>(open ? `threads/${t.id}/replies/` : null);

  async function reply() {
    try { await api(`threads/${t.id}/replies/`, { method: 'POST', body: { body } }); setBody(''); void replies.mutate(); onChange(); }
    catch (e) { toast.error('Could not reply', errorMessage(e)); }
  }
  async function resolve() { await api(`threads/${t.id}/resolve/`, { method: 'POST' }); onChange(); }

  return (
    <Card shadow="sm"><CardBody className="space-y-2">
      <button className="text-left" onClick={() => setOpen(!open)}>
        <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{t.title}</p>
          {t.is_resolved && <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle2 size={12} />}>Resolved</Chip>}</div>
        <p className="text-xs text-default-400">{t.author_name} · {timeAgo(t.created_at)} · {t.reply_count} replies</p>
      </button>
      {open && (
        <div className="space-y-3 border-t border-divider pt-3">
          <p className="whitespace-pre-wrap text-sm">{t.body}</p>
          {(replies.data ? list(replies.data) : []).map((r) => (
            <div key={r.id} className="rounded-lg bg-default-100 p-3 text-sm">
              <p className="mb-1 text-xs font-semibold">{r.author_name} {r.author_role !== 'student' && <Chip size="sm" variant="flat" color="primary" className="ml-1 capitalize">{r.author_role}</Chip>}</p>
              <p className="whitespace-pre-wrap">{r.body}</p>
            </div>
          ))}
          <Textarea aria-label="Reply" placeholder="Write a reply" value={body} onValueChange={setBody} minRows={2} />
          <div className="flex gap-2">
            <Button size="sm" color="primary" onPress={reply} isDisabled={!body.trim()}>Reply</Button>
            {canModerate && <Button size="sm" variant="flat" onPress={resolve}>{t.is_resolved ? 'Reopen' : 'Mark resolved'}</Button>}
          </div>
        </div>
      )}
    </CardBody></Card>
  );
}

export function DiscussionPanel({ courseId, canManage }: { courseId: number; canManage: boolean }) {
  const swr = useSWR<Listish<ThreadType>>(`threads/?course=${courseId}`);
  const [form, setForm] = useState({ title: '', body: '' });
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try { await api('threads/', { method: 'POST', body: { course: courseId, ...form } }); setForm({ title: '', body: '' }); void swr.mutate(); }
    catch (e) { toast.error('Could not post', errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <Card shadow="sm"><CardBody className="space-y-3">
        <p className="flex items-center gap-2 font-semibold"><MessageSquare size={16} /> Ask a question</p>
        <Input aria-label="Title" placeholder="Title" value={form.title} onValueChange={(v) => setForm({ ...form, title: v })} />
        <Textarea aria-label="Details" placeholder="Describe your question" value={form.body} onValueChange={(v) => setForm({ ...form, body: v })} />
        <Button color="primary" className="w-fit" onPress={create} isLoading={busy} isDisabled={!form.title.trim() || !form.body.trim()}>Post</Button>
      </CardBody></Card>
      <DataState swr={swr} skeleton={<ListSkeleton rows={3} />} isEmpty={(d) => list(d).length === 0}
        empty={<EmptyState title="No discussions yet" text="Be the first to ask a question." />}>
        {(d) => <div className="space-y-3">{list(d).map((t) => <ThreadCard key={t.id} t={t} canModerate={canManage} onChange={() => { void swr.mutate(); }} />)}</div>}
      </DataState>
    </div>
  );
}
