import { Button, Chip, Tab, Tabs } from '@heroui/react';
import { ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { ErrorBox } from '@/components/DataState';
import AnnouncementsTab from '@/components/instructor/AnnouncementsTab';
import AssignmentsTab from '@/components/instructor/AssignmentsTab';
import CourseForm from '@/components/instructor/CourseForm';
import CurriculumTab from '@/components/instructor/CurriculumTab';
import LiveTab from '@/components/instructor/LiveTab';
import QuizzesTab from '@/components/instructor/QuizzesTab';
import StudentsTab from '@/components/instructor/StudentsTab';
import PageHeader from '@/components/PageHeader';
import { PageSkeleton } from '@/components/Skeletons';
import { useTitle } from '@/lib/useTitle';
import type { CourseDetail } from '@/types';

export default function CourseEditor() {
  const { slug = '' } = useParams();
  const swr = useSWR<CourseDetail>(`courses/${slug}/`);
  useTitle(swr.data ? `Manage: ${swr.data.title}` : 'Manage course');
  if (swr.error) return <ErrorBox error={swr.error} retry={swr.mutate} />;
  if (swr.isLoading || !swr.data) return <PageSkeleton />;
  const c = swr.data;
  if (!c.can_manage) return <ErrorBox error={{ message: 'You do not have permission to manage this course.' }} />;
  const refresh = () => { void swr.mutate(); };

  return (
    <>
      <PageHeader title={c.title} subtitle={<span className="flex items-center gap-2"><Chip size="sm" variant="flat" color={c.status === 'published' ? 'success' : 'warning'} className="capitalize">{c.status}</Chip>{c.student_count} students · {c.lesson_count} lessons</span>}
        actions={<Button as={Link} to={`/courses/${slug}`} variant="flat" endContent={<ExternalLink size={14} />}>View public page</Button>} />
      <Tabs aria-label="Course editor" variant="underlined" destroyInactiveTabPanel className="max-w-full overflow-x-auto">
        <Tab key="details" title="Details"><div className="pt-4"><CourseForm course={c} onSaved={refresh} /></div></Tab>
        <Tab key="curriculum" title="Curriculum"><div className="pt-4"><CurriculumTab course={c} onChange={refresh} /></div></Tab>
        <Tab key="quizzes" title="Quizzes"><div className="pt-4"><QuizzesTab course={c} /></div></Tab>
        <Tab key="assignments" title="Assignments"><div className="pt-4"><AssignmentsTab course={c} /></div></Tab>
        <Tab key="live" title="Live classes"><div className="pt-4"><LiveTab course={c} /></div></Tab>
        <Tab key="students" title="Students & grades"><div className="pt-4"><StudentsTab course={c} /></div></Tab>
        <Tab key="announcements" title="Announcements"><div className="pt-4"><AnnouncementsTab course={c} /></div></Tab>
      </Tabs>
    </>
  );
}
