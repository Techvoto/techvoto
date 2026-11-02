import { Button } from '@heroui/react';
import { GraduationCap, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import CourseCard from '@/components/CourseCard';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { CardGridSkeleton } from '@/components/Skeletons';
import { list } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';
import type { Course, Listish } from '@/types';

export default function MyCourses() {
  useTitle('My courses');
  const swr = useSWR<Listish<Course>>('courses/?mine=1');
  return (
    <>
      <PageHeader title="My courses" actions={<Button as={Link} to="/instructor/courses/new" color="primary" startContent={<Plus size={16} />}>New course</Button>} />
      <DataState swr={swr} skeleton={<CardGridSkeleton />} isEmpty={(d) => list(d).length === 0}
        empty={<EmptyState icon={GraduationCap} title="You have not created a course yet" action={<Button as={Link} to="/instructor/courses/new" color="primary">Create your first course</Button>} />}>
        {(d) => <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list(d).map((c) => <CourseCard key={c.id} course={c} href={`/instructor/courses/${c.slug}`} />)}</div>}
      </DataState>
    </>
  );
}
