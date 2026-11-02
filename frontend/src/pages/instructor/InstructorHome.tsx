import { Button } from '@heroui/react';
import { BookOpen, GraduationCap, Trophy, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import DataState from '@/components/DataState';
import LiveCard from '@/components/LiveCard';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton, StatsSkeleton } from '@/components/Skeletons';
import StatCard from '@/components/StatCard';
import { list } from '@/lib/api';
import { naira } from '@/lib/format';
import { useTitle } from '@/lib/useTitle';
import type { InstructorStats, Listish, LiveClass } from '@/types';

export default function InstructorHome() {
  useTitle('Instructor overview');
  const stats = useSWR<InstructorStats>('stats/instructor/');
  const live = useSWR<Listish<LiveClass>>('live-classes/?upcoming=1');
  return (
    <>
      <PageHeader title="Instructor overview" subtitle="How your courses are doing." actions={<Button as={Link} to="/instructor/courses/new" color="primary">New course</Button>} />
      <div className="space-y-10">
        <DataState swr={stats} skeleton={<StatsSkeleton count={5} />}>
          {(s) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Courses" value={s.courses} icon={GraduationCap} hint={`${s.published} published`} />
                <StatCard label="Students" value={s.students} icon={Users} />
                <StatCard label="Completions" value={s.completions} icon={Trophy} />
                <StatCard label="Revenue" value={naira(s.revenue_kobo) === 'Free' ? '₦0' : naira(s.revenue_kobo)} icon={Wallet} />
              </div>
              <section className="mt-10">
                <h2 className="mb-3 text-xl font-semibold">Students per course</h2>
                <div className="space-y-2">
                  {s.per_course.map((c) => (
                    <Link key={c.slug} to={`/instructor/courses/${c.slug}`} className="flex items-center justify-between rounded-lg border border-divider bg-content1 px-4 py-3 hover:border-primary">
                      <span className="flex items-center gap-2 font-medium"><BookOpen size={16} />{c.title}</span><span className="text-sm text-default-500">{c.students} students</span>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </DataState>
        <section>
          <div className="mb-3 flex items-end justify-between"><h2 className="text-xl font-semibold">Upcoming live classes</h2><Link to="/live" className="text-sm text-primary">All classes</Link></div>
          <DataState swr={live} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0} empty={<p className="text-sm text-default-500">Nothing scheduled. Open a course to schedule a class.</p>}>
            {(d) => <div className="space-y-3">{list(d).slice(0, 4).map((l) => <LiveCard key={l.id} live={l} />)}</div>}
          </DataState>
        </section>
      </div>
    </>
  );
}
