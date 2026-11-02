import {
  Accordion, AccordionItem, Avatar, Button, Card, CardBody, Chip, Modal, ModalBody, ModalContent, ModalHeader,
  Select, SelectItem, Textarea,
} from '@heroui/react';
import { Clock, Download, FileText, PlayCircle, Star, Users, type LucideIcon } from 'lucide-react';
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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Learner reviews</h2>
      {canReview && (
        <Card shadow="sm"><CardBody className="space-y-3">
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
          <Card key={r.id} shadow="sm"><CardBody>
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
          <div className="space-y-10">
            <div className="-mx-6 -mt-10 border-b border-divider bg-content1 px-6 py-10">
              <div className="mx-auto grid max-w-page gap-8 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {c.category && <Chip color="primary" variant="flat" radius="sm">{c.category.name}</Chip>}
                    <Chip variant="flat" radius="sm" className="capitalize">{c.level}</Chip>
                    {c.status !== 'published' && <Chip color="warning" variant="flat" className="capitalize">{c.status}</Chip>}
                  </div>
                  <h1 className="text-3xl font-semibold sm:text-4xl">{c.title}</h1>
                  {c.subtitle && <p className="text-lg text-default-600">{c.subtitle}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-default-500">
                    {c.avg_rating && <span className="flex items-center gap-1"><Star size={15} className="fill-warning text-warning" />{c.avg_rating}</span>}
                    <span className="flex items-center gap-1"><Users size={15} />{c.student_count} students</span>
                    <span className="flex items-center gap-1"><Clock size={15} />{c.lesson_count} lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.instructor?.full_name} src={c.instructor?.avatar || undefined} size="sm" />
                    <div><p className="text-sm font-semibold">{c.instructor?.full_name}</p>{c.instructor?.bio && <p className="line-clamp-1 text-xs text-default-500">{c.instructor.bio}</p>}</div>
                  </div>
                </div>
                <Card shadow="md" className="h-fit overflow-hidden">
                  <Thumb course={c} className="h-48" />
                  <CardBody className="space-y-4 p-5">
                    <p className="text-3xl font-semibold">{naira(c.price_kobo)}</p>
                    {c.is_enrolled ? (
                      <Button as={Link} to={`/learn/${slug}`} color="primary" size="lg">{isOwner ? 'Open course' : c.progress_pct ? `Continue (${c.progress_pct}%)` : 'Start learning'}</Button>
                    ) : (
                      <Button color="primary" size="lg" onPress={() => { void enroll(c); }} isLoading={busy} isDisabled={c.status !== 'published'}>
                        {c.is_free ? 'Enroll for free' : 'Buy this course'}
                      </Button>
                    )}
                    {isOwner && <Button as={Link} to={`/instructor/courses/${slug}`} variant="flat">Manage course</Button>}
                    <p className="text-center text-xs text-default-500">Lifetime access · Certificate of completion</p>
                  </CardBody>
                </Card>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">About this course</h2>
              <Markdown>{c.description}</Markdown>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Course content</h2>
              <Accordion selectionMode="multiple" variant="bordered" className="bg-content1" defaultExpandedKeys={['0']}>
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
