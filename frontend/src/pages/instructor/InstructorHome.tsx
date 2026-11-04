import { Button } from '@heroui/react';
import { BookOpen, GraduationCap, Trophy, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import DataState from '@/components/DataState';
import LiveCard from '@/components/LiveCard';
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
      <div className="surface-brand mb-8 flex flex-wrap items-end justify-between gap-5 rounded-3xl px-7 py-8 sm:px-10 sm:py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Teaching workspace</p>
          <h1 className="display mt-2 text-3xl sm:text-4xl">Instructor overview</h1>
          <p className="mt-2 text-sm text-white/75">A clear view of your courses and learners.</p>
        </div>
        <Button as={Link} to="/instructor/courses/new" size="lg" className="bg-white font-semibold text-[#1e1b4b]">New course</Button>
      </div>
      <div className="space-y-10">
        <DataState swr={stats} skeleton={<StatsSkeleton count={5} />}>
          {(s) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Courses" value={s.courses} icon={GraduationCap} hint={`${s.published} published`} />
                <StatCard label="Students" value={s.students} icon={Users} tone="neutral" />
                <StatCard label="Completions" value={s.completions} icon={Trophy} tone="warning" />
                <StatCard label="Revenue" value={naira(s.revenue_kobo) === 'Free' ? '₦0' : naira(s.revenue_kobo)} icon={Wallet} tone="success" />
              </div>
              <section className="mt-8">
                <h2 className="mb-4 text-lg font-semibold tracking-tight">Students per course</h2>
                <div className="space-y-2">
                  {s.per_course.map((c) => (
                    <Link key={c.slug} to={`/instructor/courses/${c.slug}`} className="panel flex items-center justify-between px-4 py-3.5 transition hover:border-primary/50">
                      <span className="flex items-center gap-3 font-medium"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><BookOpen size={15} /></span>{c.title}</span><span className="text-sm tabular-nums text-default-500">{c.students} students</span>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </DataState>
        <section>
          <div className="mb-4 flex items-end justify-between gap-3"><h2 className="text-lg font-semibold tracking-tight">Upcoming live classes</h2><Link to="/live" className="text-sm font-semibold text-primary hover:underline">All classes</Link></div>
          <DataState swr={live} skeleton={<ListSkeleton rows={2} />} isEmpty={(d) => list(d).length === 0} empty={<p className="text-sm text-default-500">Nothing scheduled. Open a course to schedule a class.</p>}>
            {(d) => <div className="space-y-3">{list(d).slice(0, 4).map((l) => <LiveCard key={l.id} live={l} />)}</div>}
          </DataState>
        </section>
      </div>
    </>
  );
}
