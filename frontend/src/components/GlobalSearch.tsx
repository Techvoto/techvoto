import { Button, Input, Modal, ModalBody, ModalContent, Spinner } from '@heroui/react';
import { BookOpen, GraduationCap, PlayCircle, Search, type LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { naira } from '@/lib/format';
import type { SearchResults } from '@/types';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return <div><p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-default-500">{title}</p><ul className="space-y-0.5">{children}</ul></div>;
}

interface RowProps { icon: LucideIcon; title: string; sub?: string; right?: string; onClick: () => void }
function Row({ icon: Icon, title, sub, right, onClick }: RowProps) {
  return (
    <li><button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-default-100">
      <Icon size={16} className="shrink-0 text-primary" />
      <span className="min-w-0 grow"><span className="block truncate text-sm font-medium">{title}</span>{sub && <span className="block truncate text-xs text-default-500">{sub}</span>}</span>
      {right && <span className="shrink-0 text-xs font-semibold text-primary">{right}</span>}
    </button></li>
  );
}

/** Search button + dialog. Opens with Ctrl/Cmd+K from anywhere. */
export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { const t = setTimeout(() => setQ(text.trim()), 250); return () => clearTimeout(t); }, [text]);

  const { data, isLoading } = useSWR<SearchResults>(
  q.length >= 2 ? `search/?q=${encodeURIComponent(q)}` : null,
  { keepPreviousData: true },
);
  const go = (href: string) => { setOpen(false); setText(''); navigate(href); };
  const empty = data && !data.courses.length && !data.instructors.length && !data.lessons.length;

  return (
    <>
      <Button variant="bordered" size="sm" onPress={() => setOpen(true)} aria-label="Search courses, instructors and lessons" startContent={<Search size={15} />}
        className="hidden w-56 justify-start border-default-300 text-default-500 md:flex"><span className="grow text-left text-sm">Search</span><kbd className="rounded border border-default-300 px-1.5 text-[10px]">Ctrl K</kbd></Button>
      <Button isIconOnly variant="light" radius="full" aria-label="Search" onPress={() => setOpen(true)} className="md:hidden"><Search size={18} /></Button>
      <Modal isOpen={open} onOpenChange={setOpen} placement="top" size="xl" scrollBehavior="inside">
        <ModalContent>
          <ModalBody className="gap-4 py-4">
            <Input autoFocus aria-label="Search" placeholder="Search courses, instructors and lessons" value={text} onValueChange={setText}
              startContent={<Search size={16} />} endContent={isLoading ? <Spinner size="sm" /> : null} />
            {q.length < 2 && <p className="py-6 text-center text-sm text-default-500">Type at least 2 characters.</p>}
            {empty && <p className="py-6 text-center text-sm text-default-500">No results for “{q}”.</p>}
            {data && data.courses.length > 0 && <Group title="Courses">{data.courses.map((c) => <Row key={c.id} icon={BookOpen} title={c.title} sub={`${c.instructor}${c.category ? ` · ${c.category}` : ''}`} right={naira(c.price_kobo)} onClick={() => go(`/courses/${c.slug}`)} />)}</Group>}
            {data && data.instructors.length > 0 && <Group title="Instructors">{data.instructors.map((u) => <Row key={u.id} icon={GraduationCap} title={u.full_name} sub={`${u.course_count} course${u.course_count === 1 ? '' : 's'}`} onClick={() => go(`/courses?search=${encodeURIComponent(u.full_name)}`)} />)}</Group>}
            {data && data.lessons.length > 0 && <Group title="Lessons">{data.lessons.map((l) => <Row key={l.id} icon={PlayCircle} title={l.title} sub={l.course_title} onClick={() => go(`/courses/${l.course_slug}`)} />)}</Group>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
