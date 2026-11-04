import { Progress } from '@heroui/react';
import { ArrowUpRight, BookOpen, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { naira } from '@/lib/format';
import type { Course } from '@/types';

/** Cover fallbacks when a course has no thumbnail; chosen by course id so a course always keeps its colour. */
const COVERS = [
  'from-indigo-500 to-violet-600',
  'from-sky-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-orange-500',
  'from-amber-500 to-orange-600',
  'from-fuchsia-500 to-purple-600',
];

export function Thumb({ course, className = 'aspect-video' }: { course: Course; className?: string }) {
  if (course.thumbnail) {
    return (
      <img
        src={course.thumbnail}
        alt={`${course.title} course cover`}
        loading="lazy"
        decoding="async"
        className={`${className} w-full object-cover transition duration-500 group-hover:scale-[1.04]`}
      />
    );
  }
  const cover = COVERS[(course.id || 0) % COVERS.length];
  return (
    <div className={`${className} relative grid w-full place-items-center overflow-hidden bg-gradient-to-br ${cover}`} aria-hidden="true">
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/20" />
      <div className="absolute -bottom-12 -left-10 h-44 w-44 rounded-full border border-white/15" />
      <span className="relative text-6xl font-semibold text-white/90">{(course.title || '?')[0]}</span>
    </div>
  );
}

interface Props { course: Course; href?: string; progress?: number }

export default function CourseCard({ course, href, progress }: Props) {
  const instructor = course.instructor?.full_name || course.instructor_name;
  const rating = course.avg_rating ? Number(course.avg_rating) : null;
  const free = !course.price_kobo;
  return (
    <Link
      to={href || `/courses/${course.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-large border border-divider bg-content1 shadow-small transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-large motion-reduce:transform-none"
    >
      <div className="relative overflow-hidden">
        <Thumb course={course} />
        {course.level && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold capitalize text-foreground shadow-small backdrop-blur">
            {course.level}
          </span>
        )}
      </div>
      <div className="flex grow flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-primary">{course.category?.name || 'Course'}</span>
          <ArrowUpRight size={16} className="shrink-0 text-default-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 tracking-tight">{course.title}</h3>
        {instructor && <p className="text-sm text-default-500">{instructor}</p>}
        <div className="mt-auto border-t border-divider pt-4">
          {progress !== undefined ? (
            <Progress size="sm" value={progress} aria-label="Course progress" showValueLabel color={progress >= 100 ? 'success' : 'primary'} />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3 text-xs text-default-500">
                {rating ? (
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Star size={13} className="fill-warning text-warning" />{course.avg_rating}
                  </span>
                ) : null}
                {course.lesson_count != null && (
                  <span className="flex items-center gap-1"><BookOpen size={13} />{course.lesson_count} lessons</span>
                )}
              </span>
              <span className={`text-sm font-semibold ${free ? 'text-success' : ''}`}>{naira(course.price_kobo)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
