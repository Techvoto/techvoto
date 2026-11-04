import { Button } from '@heroui/react';
import {
  ArrowRight, Award, BookOpenCheck, Check, Flame, GraduationCap, MessageSquare, PlayCircle, Presentation, Video,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import CourseCard from '@/components/CourseCard';
import DataState from '@/components/DataState';
import { CardGridSkeleton } from '@/components/Skeletons';
import { list } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';
import type { Course, Listish } from '@/types';

const HIGHLIGHTS = ['Learn at your own pace', 'Live instructor sessions', 'Verifiable certificates'];

const STEPS: [n: string, title: string, text: string][] = [
  ['01', 'Pick a course', 'Browse expert-led courses by category and level, and preview free lessons before you commit.'],
  ['02', 'Learn and practise', 'Work through structured lessons, join live classes, and test yourself with quizzes and assignments.'],
  ['03', 'Get certified', 'Finish the course to earn a certificate that anyone can verify with a public link.'],
];

const FEATURES: [icon: LucideIcon, title: string, text: string][] = [
  [Video, 'Live classes', 'Join instructor-led sessions, ask questions in real time and rewatch recordings.'],
  [BookOpenCheck, 'Quizzes and assignments', 'Timed quizzes, graded assignments and clear feedback so you always know where you stand.'],
  [Award, 'Verifiable certificates', 'Every certificate carries a public verification link you can share with employers.'],
  [Flame, 'Progress you can see', 'Earn XP, build a daily streak and pick up exactly where you left off.'],
  [MessageSquare, 'Discussions and announcements', 'Ask questions on each course and stay up to date with your instructor.'],
  [Presentation, 'Built for instructors', 'Create courses, schedule live classes, grade work and track your students in one place.'],
];

/** Decorative product illustration. It shows the interface, not real data. */
function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]" aria-hidden="true">
      <div className="absolute -inset-4 rounded-[2rem] bg-primary/15 blur-3xl" />
      <div className="panel relative overflow-hidden shadow-large">
        <div className="flex items-center gap-1.5 border-b border-divider px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-default-300" /><span className="h-2.5 w-2.5 rounded-full bg-default-300" /><span className="h-2.5 w-2.5 rounded-full bg-default-300" />
        </div>
        <div className="grid sm:grid-cols-[1fr_190px]">
          <div className="p-5">
            <div className="surface-brand relative grid aspect-video place-items-center rounded-xl">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 backdrop-blur"><PlayCircle size={30} /></span>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="h-3.5 w-3/4 rounded-full bg-default-200" />
              <div className="h-3 w-full rounded-full bg-default-100" />
              <div className="h-3 w-5/6 rounded-full bg-default-100" />
            </div>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-default-100"><div className="h-full w-3/5 rounded-full bg-primary" /></div>
          </div>
          <div className="hidden space-y-2 border-l border-divider bg-default-50 p-4 sm:block">
            {[true, true, false, false, false].map((done, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-lg p-2 ${i === 2 ? 'bg-primary/10' : ''}`}>
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${done ? 'bg-success text-white' : 'border border-default-300'}`}>{done && <Check size={12} />}</span>
                <span className="h-2.5 grow rounded-full bg-default-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel absolute -bottom-5 -left-3 hidden items-center gap-3 px-4 py-3 shadow-large sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-success/10 text-success"><Award size={18} /></span>
        <div><p className="text-xs text-default-500">Certificate</p><p className="text-sm font-semibold">Verified authentic</p></div>
      </div>
    </div>
  );
}

export default function Home() {
  useTitle();
  const swr = useSWR<Listish<Course>>('courses/?ordering=-published_at');
  return (
    <>
      {/* Hero */}
      <section className="glow relative overflow-hidden border-b border-divider">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-page items-center gap-14 px-6 pb-24 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-divider bg-content1 px-3.5 py-1.5 text-xs font-semibold text-default-700 shadow-small">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>
              Live classes, quizzes and certificates
            </p>
            <h1 className="display text-5xl sm:text-6xl lg:text-[4.25rem]">
              Learn the skills that <span className="text-primary">move your career</span> forward.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-default-600">
              Practical, expert-led courses with live instruction, hands-on assessments and certificates employers can verify.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button as={Link} to="/courses" color="primary" size="lg" className="h-12 px-7 font-semibold" endContent={<ArrowRight size={17} />}>Explore courses</Button>
              <Button as={Link} to="/register" size="lg" variant="bordered" className="h-12 px-7 font-semibold">Create free account</Button>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-default-600">
              {HIGHLIGHTS.map((h) => <li key={h} className="flex items-center gap-2"><Check size={16} className="text-success" />{h}</li>)}
            </ul>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-page px-6 py-20 sm:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Courses</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Start with a course worth your time</h2>
            <p className="mt-3 max-w-xl text-default-500">Newly published courses from our instructors.</p>
          </div>
          <Button as={Link} to="/courses" variant="flat" color="primary" className="font-semibold" endContent={<ArrowRight size={16} />}>Browse all courses</Button>
        </div>
        <DataState swr={swr} skeleton={<CardGridSkeleton count={3} />} isEmpty={(d) => list(d).length === 0}>
          {(d) => <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list(d).slice(0, 6).map((course) => <CourseCard key={course.id} course={course} />)}</div>}
        </DataState>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-y border-divider bg-content1">
        <div className="mx-auto max-w-page px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">From first lesson to verified certificate</h2>
          </div>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map(([n, title, text]) => (
              <li key={n} className="relative rounded-large border border-divider bg-background p-7">
                <span className="text-sm font-semibold tabular-nums text-primary">{n}</span>
                <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-default-500">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Live classes + platform features */}
      <section id="live" className="mx-auto max-w-page scroll-mt-20 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Live classes and more</p>
          <h2 className="display mt-3 text-3xl sm:text-4xl">More than watching videos</h2>
          <p className="mt-4 text-default-500">Learn with your instructor and your classmates, practise as you go, and see your progress add up.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([Icon, title, text]) => (
            <article key={title} className="lift rounded-large border border-divider bg-content1 p-6 shadow-small">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={21} /></span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-default-500">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-page px-6 pb-4">
        <div className="surface-brand rounded-3xl px-7 py-14 text-center sm:px-14 sm:py-20">
          <span className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10"><GraduationCap size={24} /></span>
          <h2 className="display mx-auto max-w-2xl text-3xl sm:text-5xl">Ready to start learning?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">Create a free account, explore the catalogue and take your first lesson today.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/register" size="lg" className="h-12 bg-white px-7 font-semibold text-[#1e1b4b]">Create free account</Button>
            <Button as={Link} to="/courses" size="lg" variant="bordered" className="h-12 border-white/30 px-7 font-semibold text-white">Browse courses</Button>
          </div>
        </div>
      </section>
    </>
  );
}
