import { ArrowUpRight, BookOpen, CreditCard, GraduationCap, MessageSquare, Tags, Trophy, UserCheck, Users, Wallet, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import DataState from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { StatsSkeleton } from '@/components/Skeletons';
import StatCard from '@/components/StatCard';
import { naira } from '@/lib/format';
import { useTitle } from '@/lib/useTitle';
import type { AdminStats } from '@/types';

const SHORTCUTS: [label: string, href: string, icon: LucideIcon, description: string][] = [
  ['Manage users', '/admin/users', Users, 'Review accounts and roles'],
  ['Review courses', '/admin/courses', GraduationCap, 'Moderate course publishing'],
  ['Payments', '/admin/payments', CreditCard, 'Track transactions'],
  ['Support messages', '/admin/messages', MessageSquare, 'Respond to learner requests'],
  ['Categories', '/admin/categories', Tags, 'Organise the catalogue'],
];

export default function AdminHome() {
  useTitle('Admin overview');
  const swr = useSWR<AdminStats>('stats/admin/');
  return (
    <>
      <PageHeader title="Admin overview" subtitle="Platform health at a glance." />
      <DataState swr={swr} skeleton={<StatsSkeleton count={6} />}>
        {(s) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Students" value={s.users.student || 0} icon={Users} />
            <StatCard label="Instructors" value={s.users.instructor || 0} icon={UserCheck} />
            <StatCard label="Published courses" value={s.courses.published || 0} icon={GraduationCap} hint={`${s.courses.draft || 0} drafts`} />
            <StatCard label="Enrollments" value={s.enrollments} icon={BookOpen} />
            <StatCard label="Completions" value={s.completions} icon={Trophy} />
            <StatCard label="Revenue" value={s.revenue_kobo ? naira(s.revenue_kobo) : '₦0'} icon={Wallet} />
          </div>
        )}
      </DataState>
      <section className="mt-8">
        <div className="mb-3"><h2 className="text-lg font-semibold">Platform management</h2><p className="mt-1 text-sm text-default-500">Jump straight into the areas that keep Techvoto running.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SHORTCUTS.map(([label, href, Icon, description]) => (
            <Link key={href} to={href} className="group flex items-center gap-3 rounded-lg border border-divider bg-content1 p-4 transition hover:border-primary/50 hover:shadow-medium">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={19} /></span>
              <span className="min-w-0 grow"><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-default-500">{description}</span></span>
              <ArrowUpRight size={16} className="text-default-400 transition group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
