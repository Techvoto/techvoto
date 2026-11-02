import { Button, Card, CardBody, Progress } from '@heroui/react';
import { Award, BookOpen, Flame, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import CourseCard from '@/components/CourseCard';
import DataState, { EmptyState } from '@/components/DataState';
import LiveCard from '@/components/LiveCard';
import PageHeader from '@/components/PageHeader';
import { CardGridSkeleton, ListSkeleton, StatsSkeleton } from '@/components/Skeletons';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/context/auth';
import { list } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';
import type { Certificate, Enrollment, Listish, LiveClass } from '@/types';

export default function Dashboard() {
  useTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'instructor') navigate('/instructor', { replace: true });
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  const enr = useSWR<Listish<Enrollment>>(user?.role === 'student' ? 'enrollments/' : null);
  const certs = useSWR<Listish<Certificate>>(user?.role === 'student' ? 'certificates/' : null);
  const live = useSWR<Listish<LiveClass>>(user?.role === 'student' ? 'live-classes/?upcoming=1' : null);
  if (!user || user.role !== 'student') return <StatsSkeleton />;

  return (
    <>
      <PageHeader title={`Welcome back, ${user.first_name}`} subtitle="Here is where you stand today." />
      <DataState swr={enr} skeleton={<><StatsSkeleton /><div className="mt-8"><CardGridSkeleton count={3} /></div></>}>
        {(d) => {
          const all = list(d);
          const active = all.filter((e) => !e.completed_at);
          return (
            <div className="space-y-10">
              {active[0] && (
                <Card shadow="sm"><CardBody className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                  <div className="min-w-0 grow">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pick up where you left off</p>
                    <h2 className="mt-1 truncate text-xl font-semibold">{active[0].course.title}</h2>
                    <Progress size="sm" value={active[0].progress_pct} aria-label="Course progress" showValueLabel className="mt-4 max-w-md" />
                  </div>
                  <Button as={Link} to={`/learn/${active[0].course.slug}`} color="primary" size="lg" className="shrink-0 font-medium">Resume learning</Button>
                </CardBody></Card>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total XP" value={user.xp} icon={Trophy} />
                <StatCard label="Day streak" value={user.streak} icon={Flame} hint="Complete a lesson daily" />
                <StatCard label="In progress" value={active.length} icon={BookOpen} />
                <StatCard label="Certificates" value={certs.data ? list(certs.data).length : '–'} icon={Award} />
              </div>

              <section>
                <div className="mb-4 flex items-end justify-between"><h2 className="text-lg font-semibold">My courses</h2><Link to="/my-learning" className="text-sm font-medium text-primary hover:underline">View all</Link></div>
                {active.length === 0 ? (
                  <EmptyState title="No courses in progress" text="Find a course to start your learning journey." action={<Button as={Link} to="/courses" color="primary">Browse courses</Button>} />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {active.slice(0, 3).map((e) => <CourseCard key={e.id} course={e.course} href={`/learn/${e.course.slug}`} progress={e.progress_pct} />)}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-4 flex items-end justify-between"><h2 className="text-lg font-semibold">Upcoming live classes</h2><Link to="/live" className="text-sm font-medium text-primary hover:underline">View all</Link></div>
                <DataState swr={live} skeleton={<ListSkeleton rows={2} />} isEmpty={(x) => list(x).length === 0}
                  empty={<p className="text-sm text-default-500">No live classes scheduled right now.</p>}>
                  {(x) => <div className="space-y-3">{list(x).slice(0, 3).map((l) => <LiveCard key={l.id} live={l} />)}</div>}
                </DataState>
              </section>
            </div>
          );
        }}
      </DataState>
    </>
  );
}
