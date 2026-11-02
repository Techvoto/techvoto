import { Input, Pagination, Select, SelectItem } from '@heroui/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import CourseCard from '@/components/CourseCard';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { CardGridSkeleton } from '@/components/Skeletons';
import { list } from '@/lib/api';
import { firstKey } from '@/lib/select';
import { useTitle } from '@/lib/useTitle';
import type { Category, Course, Listish, Paged } from '@/types';

const PAGE_SIZE = 20;

export default function CatalogPage() {
  useTitle('Course catalog');
  const [params] = useSearchParams();
  const initial = params.get('search') ?? '';
  const [search, setSearch] = useState(initial);
  const [q, setQ] = useState(initial);
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [ordering, setOrdering] = useState('-published_at');
  const [page, setPage] = useState(1);

  useEffect(() => { const t = setTimeout(() => { setQ(search); setPage(1); }, 350); return () => clearTimeout(t); }, [search]);

  const qs = new URLSearchParams({ ordering, page: String(page) });
  if (q) qs.set('search', q);
  if (level) qs.set('level', level);
  if (category) qs.set('category__slug', category);
  const swr = useSWR<Paged<Course>>(key, {
  keepPreviousData: true,
});
  const { data: cats } = useSWR<Listish<Category>>('categories/');

  return (
    <>
      <PageHeader title="Course catalog" subtitle="Find the skill you want to learn next." />
      <div className="mb-6 grid gap-3 rounded-lg border border-divider bg-content1 p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <Input variant="bordered" aria-label="Search courses" placeholder="Search courses" value={search} onValueChange={setSearch}
          startContent={<Search size={16} />} isClearable onClear={() => setSearch('')} />
        <Select variant="bordered" aria-label="Category" placeholder="All categories" selectedKeys={category ? [category] : []}
          onSelectionChange={(k) => { setCategory(firstKey(k)); setPage(1); }}>
          {list(cats).map((c) => <SelectItem key={c.slug}>{c.name}</SelectItem>)}
        </Select>
        <Select variant="bordered" aria-label="Level" placeholder="All levels" selectedKeys={level ? [level] : []}
          onSelectionChange={(k) => { setLevel(firstKey(k)); setPage(1); }}>
          {['beginner', 'intermediate', 'advanced'].map((l) => <SelectItem key={l} className="capitalize">{l}</SelectItem>)}
        </Select>
        <Select variant="bordered" aria-label="Sort" selectedKeys={[ordering]} disallowEmptySelection onSelectionChange={(k) => { setOrdering(firstKey(k)); setPage(1); }}>
          <SelectItem key="-published_at">Newest</SelectItem>
          <SelectItem key="price_kobo">Price: low to high</SelectItem>
          <SelectItem key="-price_kobo">Price: high to low</SelectItem>
        </Select>
      </div>
      <DataState swr={swr} skeleton={<CardGridSkeleton />} isEmpty={(d) => list(d).length === 0}
        empty={<EmptyState title="No courses found" text="Try a different search or clear the filters." icon={Search} />}>
        {(d) => {
          const total = d.count ?? list(d).length;
          return (
            <>
              <p className="mb-4 text-sm text-default-500" aria-live="polite">{total} course{total === 1 ? '' : 's'}</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list(d).map((c) => <CourseCard key={c.id} course={c} />)}</div>
              {d.count > PAGE_SIZE && (
                <div className="mt-8 flex justify-center">
                  <Pagination page={page} total={Math.ceil(d.count / PAGE_SIZE)} onChange={setPage} showControls />
                </div>
              )}
            </>
          );
        }}
      </DataState>
    </>
  );
}
