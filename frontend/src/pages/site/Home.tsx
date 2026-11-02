import { Button } from '@heroui/react';
import { Award, BarChart3, BookOpenCheck, CheckCircle2, PlayCircle, Video, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import CourseCard from '@/components/CourseCard';
import DataState from '@/components/DataState';
import { CardGridSkeleton } from '@/components/Skeletons';
import { list } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';
import type { Course, Listish } from '@/types';

const FEATURES: [LucideIcon, string, string][] = [
  [Video, 'Live classes', 'Join scheduled sessions with your instructor, ask questions in real time and replay recordings.'],
  [BookOpenCheck, 'Hands-on assessments', 'Quizzes with instant grading and assignments with instructor feedback keep you moving.'],
  [BarChart3, 'Progress you can see', 'Track completion, streaks and XP across every course from one dashboard.'],
  [Award, 'Verifiable certificates', 'Every certificate has a public link so employers can confirm it in seconds.'],
];

const STEPS: [string, string][] = [
  ['Choose a course', 'Browse free and paid courses across programming, data, design and more.'],
  ['Learn and practise', 'Watch lessons, take quizzes, submit assignments and attend live classes.'],
  ['Earn your certificate', 'Complete the requirements and share a certificate anyone can verify.'],
];

/** A static product preview built from real UI pieces, so the hero shows the product rather than a stock image. */
function Preview() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="rounded-lg border border-divider bg-content1 p-5 shadow-large">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-xs text-default-500">Your progress</p><p className="text-base font-semibold">Full-Stack Web Development</p></div>
          <span className="rounded-md bg-success/15 px-2 py-1 text-xs font-semibold text-success">On track</span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-default-200"><div className="h-full w-[68%] rounded-full bg-primary" /></div>
        <ul className="space-y-2.5 text-sm">
          {([['Introduction to HTTP', true], ['Building REST APIs', true], ['Authentication with JWT', false]] as [string, boolean][]).map(([t, done]) => (
            <li key={t} className="flex items-center gap-3 rounded-lg border border-divider px-3 py-2.5">
              {done ? <CheckCircle2 size={18} className="text-success" /> : <PlayCircle size={18} className="text-primary" />}
              <span className={done ? 'text-default-500' : 'font-medium'}>{t}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden rounded-lg border border-divider bg-content1 p-4 shadow-medium sm:block">
        <p className="flex items-center gap-2 text-sm font-semibold"><Video size={16} className="text-danger" /> Live now</p>
        <p className="text-xs text-default-500">Databases Q&amp;A · 42 attending</p>
      </div>
    </div>
  );
}

export default function Home() {
  useTitle();
  const swr = useSWR<Listish<Course>>('courses/?ordering=-published_at');
  return (
    <div className="space-y-24">
      <section className="bg-grid -mx-6 -mt-10 border-b border-divider bg-content1 px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-page items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-semibold text-primary">Techvoto Learning</p>
            <h1 className="text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[3.5rem]">Learn the skills that tech teams hire for.</h1>
            <p className="mt-5 max-w-xl text-lg text-default-600">
              Expert-led courses, live classes and hands-on assessments, with certificates you can share and employers can verify.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/register" color="primary" size="lg" className="font-medium">Join for free</Button>
              <Button as={Link} to="/courses" variant="bordered" size="lg" className="font-medium">Explore courses</Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-default-600">
              {['Free courses available', 'Live instructor-led classes', 'Verifiable certificates'].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" />{t}</li>
              ))}
            </ul>
          </div>
          <Preview />
        </div>
      </section>

      <section id="live">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">Everything you need to learn and prove it</h2>
          <p className="mt-2 text-default-600">One platform for lessons, live teaching, assessment and certification.</p>
        </div>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([Icon, title, text]) => (
            <div key={title}>
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={22} /></div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-default-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><h2 className="text-2xl font-semibold sm:text-3xl">Popular courses</h2><p className="mt-1 text-default-600">Start with what other learners are taking.</p></div>
          <Link to="/courses" className="shrink-0 text-sm font-medium text-primary hover:underline">View all courses</Link>
        </div>
        <DataState swr={swr} skeleton={<CardGridSkeleton count={3} />} isEmpty={(d) => list(d).length === 0}>
          {(d) => <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list(d).slice(0, 6).map((c) => <CourseCard key={c.id} course={c} />)}</div>}
        </DataState>
      </section>

      <section id="how" className="rounded-lg border border-divider bg-content1 p-8 sm:p-12">
        <h2 className="mb-10 text-2xl font-semibold sm:text-3xl">How it works</h2>
        <ol className="grid gap-8 sm:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
              <span><span className="block text-base font-semibold">{t}</span><span className="mt-1 block text-sm text-default-600">{d}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg bg-[#0b1f3a] px-8 py-14 text-center text-white sm:px-12">
        <h2 className="text-2xl font-semibold sm:text-3xl">Start learning today</h2>
        <p className="mx-auto mt-2 max-w-lg text-white/75">Create a free account and enrol in your first course in minutes.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/register" size="lg" className="bg-white font-medium text-[#0b1f3a]">Join for free</Button>
          <Button as={Link} to="/courses" size="lg" variant="bordered" className="border-white/40 font-medium text-white">Browse the catalog</Button>
        </div>
      </section>
    </div>
  );
}
