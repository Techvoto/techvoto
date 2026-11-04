import { Button, Card, CardBody, Progress, Tab, Tabs } from '@heroui/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Download, FileText, PlayCircle, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { ErrorBox } from '@/components/DataState';
import DownloadButton from '@/components/DownloadButton';
import Markdown from '@/components/Markdown';
import { AnnouncementPanel, AssignmentPanel, DiscussionPanel, LivePanel, QuizPanel } from '@/components/player/Panels';
import { ListSkeleton, PlayerSkeleton } from '@/components/Skeletons';
import VideoEmbed from '@/components/VideoEmbed';
import { useAuth } from '@/context/auth';
import { api, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { CompleteResult, CourseDetail, Lesson, Progress as ProgressData } from '@/types';

const ICON: Record<string, LucideIcon> = { video: PlayCircle, text: FileText, file: Download };

export default function Player() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const course = useSWR<CourseDetail>(`courses/${slug}/`);
  useTitle(course.data?.title);
  const enrolled = course.data?.is_enrolled;
  const progress = useSWR<ProgressData>(enrolled ? `courses/${slug}/progress/` : null);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const lessons = useMemo(() => (course.data?.sections || []).flatMap((s) => s.lessons), [course.data]);
  const done = useMemo(() => new Set(progress.data?.completed_lesson_ids || []), [progress.data]);

  useEffect(() => {
    if (lessonId || !lessons.length || !progress.data) return;
    setLessonId((lessons.find((l) => !done.has(l.id)) || lessons[0]).id);   // resume at the first unfinished lesson
  }, [lessons, progress.data, done, lessonId]);

  useEffect(() => { if (course.data && !enrolled) navigate(`/courses/${slug}`, { replace: true }); }, [course.data, enrolled, navigate, slug]);

  const lesson = useSWR<Lesson>(lessonId ? `lessons/${lessonId}/` : null);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const next = lessons[idx + 1];
  const prev = lessons[idx - 1];

  async function complete() {
    if (lessonId == null) return;
    setBusy(true);
    try {
      const r = await api<CompleteResult>(`lessons/${lessonId}/complete/`, { method: 'POST' });
      if (r.xp_awarded) toast.success(`+${r.xp_awarded} XP`, 'Lesson completed');
      if (r.course_completed) toast.success('Course complete! 🎉', 'Your certificate is ready.');
      await progress.mutate(); void refresh();
      if (next) setLessonId(next.id);
    } catch (e) { toast.error('Could not save progress', errorMessage(e)); } finally { setBusy(false); }
  }

  if (course.error) return <ErrorBox error={course.error} retry={course.mutate} />;
  if (course.isLoading || !course.data || !enrolled || !progress.data || lessonId == null) return <PlayerSkeleton />;
  const c = course.data;
  const pct = progress.data.progress_pct;
  const isDone = done.has(lessonId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={`/courses/${slug}`} className="text-sm font-medium text-primary hover:underline">← Course overview</Link>
          <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
        </div>
        <div className="w-full sm:w-64"><Progress aria-label="Course progress" value={pct} showValueLabel label="Progress" size="sm" /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          {lesson.isLoading || !lesson.data ? (lesson.error ? <ErrorBox error={lesson.error} retry={lesson.mutate} /> : <ListSkeleton rows={3} />) : (
            <>
              <VideoEmbed url={lesson.data.video_url} title={lesson.data.title} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">{lesson.data.title}</h2>
                <Button color={isDone ? 'success' : 'primary'} variant={isDone ? 'flat' : 'solid'} onPress={() => { void complete(); }} isLoading={busy}
                  startContent={isDone ? <CheckCircle2 size={16} /> : null}>{isDone ? 'Completed' : next ? 'Complete and continue' : 'Complete lesson'}</Button>
              </div>
              <Markdown>{lesson.data.content}</Markdown>
              {lesson.data.resource && <DownloadButton file={lesson.data.resource} variant="flat">Download lesson file</DownloadButton>}
              <div className="flex justify-between pt-2">
                <Button variant="light" startContent={<ChevronLeft size={16} />} isDisabled={!prev} onPress={() => prev && setLessonId(prev.id)}>Previous</Button>
                <Button variant="light" endContent={<ChevronRight size={16} />} isDisabled={!next} onPress={() => next && setLessonId(next.id)}>Next</Button>
              </div>
            </>
          )}
        </div>

        <Card shadow="sm" className="h-fit border border-divider lg:sticky lg:top-24" as="aside" aria-label="Course content"><CardBody className="max-h-[70vh] space-y-4 overflow-y-auto">
          {c.sections.map((s) => (
            <div key={s.id}>
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-default-500">{s.title}</p>
              <ul className="space-y-0.5">
                {s.lessons.map((l) => {
                  const Icon = ICON[l.kind] || PlayCircle;
                  return (
                    <li key={l.id}>
                      <button onClick={() => setLessonId(l.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${l.id === lessonId ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-default-100'}`}>
                        {done.has(l.id) ? <CheckCircle2 size={16} className="shrink-0 text-success" /> : <Circle size={16} className="shrink-0 text-default-300" />}
                        <span className="grow">{l.title}</span><Icon size={14} className="shrink-0 text-default-400" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </CardBody></Card>
      </div>

      <Tabs aria-label="Course sections" variant="underlined" destroyInactiveTabPanel>
        <Tab key="quizzes" title="Quizzes"><div className="pt-4"><QuizPanel courseId={c.id} /></div></Tab>
        <Tab key="assignments" title="Assignments"><div className="pt-4"><AssignmentPanel courseId={c.id} /></div></Tab>
        <Tab key="live" title="Live classes"><div className="pt-4"><LivePanel courseId={c.id} /></div></Tab>
        <Tab key="discussion" title="Discussion"><div className="pt-4"><DiscussionPanel courseId={c.id} canManage={!!c.can_manage} /></div></Tab>
        <Tab key="announcements" title="Announcements"><div className="pt-4"><AnnouncementPanel courseId={c.id} /></div></Tab>
      </Tabs>
    </div>
  );
}
