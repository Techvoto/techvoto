import {
  Accordion, AccordionItem, Avatar, Button, Card, CardBody, Chip, Modal, ModalBody, ModalContent, ModalHeader,
  Select, SelectItem, Textarea,
} from '@heroui/react';
import { Check, Clock, Download, FileText, PlayCircle, Star, Users, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { Thumb } from '@/components/CourseCard';
import DataState, { ErrorBox } from '@/components/DataState';
import DownloadButton from '@/components/DownloadButton';
import Markdown from '@/components/Markdown';
import { ListSkeleton, PlayerSkeleton } from '@/components/Skeletons';
import VideoEmbed from '@/components/VideoEmbed';
import { useAuth } from '@/context/auth';
import { api, errorMessage, list } from '@/lib/api';
import { dateOnly, naira } from '@/lib/format';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { CourseDetail as CourseDetailType, Lesson, Listish, Review } from '@/types';

const KIND_ICON: Record<string, LucideIcon> = { video: PlayCircle, text: FileText, file: Download };

function PreviewModal({ lessonId, onClose }: { lessonId: number | null; onClose: () => void }) {
  const { data, error, isLoading } = useSWR<Lesson>(lessonId ? `lessons/${lessonId}/` : null);
  return (
    <Modal isOpen={!!lessonId} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{data?.title || 'Preview'}</ModalHeader>
        <ModalBody className="pb-6">
          {isLoading && <PlayerSkeleton />}
          {error && <ErrorBox error={error} />}
          {data && (<><VideoEmbed url={data.video_url} title={data.title} /><Markdown>{data.content}</Markdown>
            {data.resource && <DownloadButton file={data.resource} variant="flat">Download file</DownloadButton>}</>)}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Reviews({ slug, canReview }: { slug: string; canReview: boolean }) {
  const swr = useSWR<Listish<Review>>(`courses/${slug}/reviews/`);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await api(`courses/${slug}/reviews/`, { method: 'POST', body: { rating: Number(rating), comment } });
      toast.success('Thanks for your review!'); setComment(''); void swr.mutate();
    } catch (e) { toast.error('Could not save review', errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <section className="max-w-3xl space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Learner reviews</h2>
      {canReview && (
        <Card shadow="sm" className="border border-divider"><CardBody className="space-y-3 p-5">
          <Select aria-label="Rating" label="Your rating" selectedKeys={[rating]} disallowEmptySelection onSelectionChange={(k) => setRating(firstKey(k))} className="max-w-xs">
            {[5, 4, 3, 2, 1].map((n) => <SelectItem key={String(n)}>{'★'.repeat(n)} {n}/5</SelectItem>)}
          </Select>
          <Textarea aria-label="Comment" placeholder="What did you think of the course?" value={comment} onValueChange={setComment} maxLength={2000} />
          <Button color="primary" onPress={submit} isLoading={busy} className="w-fit">Submit review</Button>
        </CardBody></Card>
      )}
      <DataState swr={swr} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0}
        empty={<p className="text-sm text-default-500">No reviews yet.</p>}>
        {(d) => <>{list(d).map((r) => (
          <Card key={r.id} shadow="sm" className="border border-divider"><CardBody className="p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{r.user_name}</p>
              <span className="flex text-warning">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} className="fill-warning" />)}</span>
            </div>
            {r.comment && <p className="mt-1 text-sm text-default-600">{r.comment}</p>}
            <p className="mt-1 text-xs text-default-400">{dateOnly(r.created_at)}</p>
          </CardBody></Card>
        ))}</>}
      </DataState>
    </section>
  );
}

export default function CourseDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const swr = useSWR<CourseDetailType>(`courses/${slug}/`);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  useTitle(swr.data?.title);

  async function enroll(course: CourseDetailType) {
    if (!user) { navigate(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`); return; }
    setBusy(true);
    try {
      if (course.is_free) {
        await api(`courses/${slug}/enroll/`, { method: 'POST' });
        toast.success('You are enrolled!'); navigate(`/learn/${slug}`);
      } else {
        const d = await api<{ authorization_url: string }>('payments/checkout/', { method: 'POST', body: { course_slug: slug } });
        window.location.href = d.authorization_url;   // Paystack hosted checkout
      }
    } catch (e) { toast.error('Could not continue', errorMessage(e)); setBusy(false); }
  }

  return (
    <DataState swr={swr} skeleton={<PlayerSkeleton />}>
      {(c) => {
        const isOwner = !!c.can_manage;
        return (
          <div className="space-y-12">
            <div className="band glow -mt-10 pb-12 pt-12 sm:-mt-12 sm:pt-14">
              <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {c.category && <Chip color="primary" variant="flat" radius="sm">{c.category.name}</Chip>}
                    <Chip variant="flat" radius="sm" className="capitalize">{c.level}</Chip>
                    {c.status !== 'published' && <Chip color="warning" variant="flat" radius="sm" className="capitalize">{c.status}</Chip>}
                  </div>
                  <h1 className="display text-4xl sm:text-5xl">{c.title}</h1>
                  {c.subtitle && <p className="max-w-2xl text-lg leading-8 text-default-600">{c.subtitle}</p>}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-default-600">
                    {c.avg_rating && <span className="flex items-center gap-1.5 font-semibold text-foreground"><Star size={15} className="fill-warning text-warning" />{c.avg_rating}</span>}
                    <span className="flex items-center gap-1.5"><Users size={15} />{c.student_count} students</span>
                    <span className="flex items-center gap-1.5"><Clock size={15} />{c.lesson_count} lessons</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Avatar name={c.instructor?.full_name} src={c.instructor?.avatar || undefined} />
                    <div>
                      <p className="text-xs text-default-500">Taught by</p>
                      <p className="text-sm font-semibold">{c.instructor?.full_name}</p>
                    </div>
                  </div>
                  {c.instructor?.bio && <p className="max-w-2xl text-sm leading-6 text-default-500">{c.instructor.bio}</p>}
                </div>
                <div className="panel overflow-hidden shadow-large lg:sticky lg:top-24">
                  <div className="overflow-hidden"><Thumb course={c} /></div>
                  <div className="space-y-4 p-6">
                    <p className={`text-3xl font-semibold tracking-tight ${c.is_free ? 'text-success' : ''}`}>{naira(c.price_kobo)}</p>
                    {c.is_enrolled ? (
                      <Button as={Link} to={`/learn/${slug}`} color="primary" size="lg" className="w-full font-semibold">{isOwner ? 'Open course' : c.progress_pct ? `Continue (${c.progress_pct}%)` : 'Start learning'}</Button>
                    ) : (
                      <Button color="primary" size="lg" className="w-full font-semibold" onPress={() => { void enroll(c); }} isLoading={busy} isDisabled={c.status !== 'published'}>
                        {c.is_free ? 'Enroll for free' : 'Buy this course'}
                      </Button>
                    )}
                    {isOwner && <Button as={Link} to={`/instructor/courses/${slug}`} variant="flat" className="w-full">Manage course</Button>}
                    <ul className="space-y-2 border-t border-divider pt-4 text-sm text-default-600">
                      <li className="flex items-center gap-2"><Check size={15} className="text-success" />Lifetime access</li>
                      <li className="flex items-center gap-2"><Check size={15} className="text-success" />Certificate of completion</li>
                      <li className="flex items-center gap-2"><Check size={15} className="text-success" />{c.lesson_count} lessons</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <section className="max-w-3xl space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">About this course</h2>
              <Markdown>{c.description}</Markdown>
            </section>

            <section className="max-w-3xl space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Course content</h2>
              <Accordion selectionMode="multiple" variant="bordered" className="bg-content1 shadow-small" defaultExpandedKeys={['0']}>
                {c.sections.map((s, i) => (
                  <AccordionItem key={String(i)} title={<span className="font-semibold">{s.title}</span>} subtitle={`${s.lessons.length} lessons`}>
                    <ul className="divide-y divide-divider">
                      {s.lessons.map((l) => {
                        const Icon = KIND_ICON[l.kind] || PlayCircle;
                        return (
                          <li key={l.id} className="flex items-center gap-3 py-2.5 text-sm">
                            <Icon size={16} className="text-default-400" />
                            <span className="grow">{l.title}</span>
                            {l.is_free_preview && <Button size="sm" variant="flat" color="primary" onPress={() => setPreview(l.id)}>Preview</Button>}
                            {l.duration_minutes > 0 && <span className="text-xs text-default-400">{l.duration_minutes} min</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <Reviews slug={slug} canReview={!!c.is_enrolled && !isOwner} />
            <PreviewModal lessonId={preview} onClose={() => setPreview(null)} />
          </div>
        );
      }}
    </DataState>
  );
}
