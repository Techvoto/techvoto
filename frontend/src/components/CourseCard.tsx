import { Card, Progress } from '@heroui/react';
import { BookOpen, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { naira } from '@/lib/format';
import type { Course } from '@/types';

// Muted, professional placeholder palettes (used only when a course has no thumbnail).
const TONES = [
  'bg-[#e8f0fe] text-[#1a56b8] dark:bg-[#1c2a44] dark:text-[#8ab4f8]',
  'bg-[#e6f4ea] text-[#16692f] dark:bg-[#17301f] dark:text-[#81c995]',
  'bg-[#fef7e0] text-[#8a5a00] dark:bg-[#352a10] dark:text-[#fdd663]',
  'bg-[#fce8e6] text-[#a52714] dark:bg-[#3a1b18] dark:text-[#f28b82]',
  'bg-[#f3e8fd] text-[#6b2aa8] dark:bg-[#2b1f3d] dark:text-[#d7aefb]',
  'bg-[#e4f7fb] text-[#0b6577] dark:bg-[#12303a] dark:text-[#78d9ec]',
];

export function Thumb({ course, className = 'aspect-video' }: { course: Course; className?: string }) {
  if (course.thumbnail) return <img src={course.thumbnail} alt="" loading="lazy" decoding="async" className={`${className} w-full object-cover`} />;
  const tone = TONES[(course.id || 0) % TONES.length];
  return (
    <div className={`${className} grid w-full place-items-center ${tone}`} aria-hidden="true">
      <span className="text-5xl font-semibold opacity-80">{(course.title || '?')[0]}</span>
    </div>
  );
}

interface Props { course: Course; href?: string; progress?: number }

export default function CourseCard({ course, href, progress }: Props) {
  const instructor = course.instructor?.full_name || course.instructor_name;
  return (
    <Card as={Link} to={href || `/courses/${course.slug}`} isPressable shadow="sm" radius="lg"
      className="group h-full w-full overflow-hidden transition-shadow hover:shadow-medium">
      <Thumb course={course} />
      <div className="flex w-full grow flex-col gap-1.5 p-4 text-left">
        <p className="text-xs font-medium text-default-500">
          {[course.category?.name, course.level && course.level[0].toUpperCase() + course.level.slice(1)].filter(Boolean).join(' · ')}
          {course.status === 'draft' && <span className="ml-2 rounded bg-warning/20 px-1.5 py-0.5 text-warning-700">Draft</span>}
        </p>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">{course.title}</h3>
        {instructor && <p className="text-sm text-default-500">{instructor}</p>}
        <div className="mt-auto pt-3">
          {progress !== undefined ? (
            <Progress size="sm" value={progress} aria-label="Course progress" showValueLabel color={progress >= 100 ? 'success' : 'primary'} />
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-3 text-default-500">
                {course.avg_rating ? <span className="flex items-center gap-1 font-medium text-foreground"><Star size={14} className="fill-warning text-warning" />{course.avg_rating}</span> : null}
                {course.lesson_count != null && <span className="flex items-center gap-1"><BookOpen size={14} />{course.lesson_count} lessons</span>}
              </span>
              <span className="font-semibold">{naira(course.price_kobo)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
