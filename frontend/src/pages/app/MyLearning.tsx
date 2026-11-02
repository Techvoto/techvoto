import { Button, Tab, Tabs } from '@heroui/react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import CourseCard from '@/components/CourseCard';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { CardGridSkeleton } from '@/components/Skeletons';
import { list } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';
import type { Enrollment, Listish } from '@/types';

export default function MyLearning() {
  useTitle('My learning');
  const swr = useSWR<Listish<Enrollment>>('enrollments/');
  return (
    <>
      <PageHeader title="My learning" subtitle="All the courses you are enrolled in." />
      <DataState swr={swr} skeleton={<CardGridSkeleton />} isEmpty={(d) => list(d).length === 0}
        empty={<EmptyState title="You have not enrolled yet" text="Browse the catalogue and start your first course." action={<Button as={Link} to="/courses" color="primary">Browse courses</Button>} />}>
        {(d) => {
          const all = list(d);
          const groups: Record<string, Enrollment[]> = { all, progress: all.filter((e) => !e.completed_at), done: all.filter((e) => e.completed_at) };
          const tabs: [string, string][] = [['all', `All (${groups.all.length})`], ['progress', `In progress (${groups.progress.length})`], ['done', `Completed (${groups.done.length})`]];
          return (
            <Tabs aria-label="Filter courses" variant="underlined">
              {tabs.map(([k, label]) => (
                <Tab key={k} title={label}>
                  {groups[k].length === 0 ? <EmptyState title="Nothing here" /> : (
                    <div className="grid gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                      {groups[k].map((e) => <CourseCard key={e.id} course={e.course} href={`/learn/${e.course.slug}`} progress={e.progress_pct} />)}
                    </div>
                  )}
                </Tab>
              ))}
            </Tabs>
          );
        }}
      </DataState>
    </>
  );
}
