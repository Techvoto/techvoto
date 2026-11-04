import { Button, Chip, Pagination, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { TableSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { naira } from '@/lib/format';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { Course, CourseStatus, Paged } from '@/types';

const STATUSES: CourseStatus[] = ['draft', 'published', 'archived'];

export default function AdminCourses() {
  useTitle('All courses');
  const [page, setPage] = useState(1);
  const swr = useSWR<Paged<Course>>(`courses/?all=1&page=${page}`, { keepPreviousData: true });
  async function setStatus(c: Course, status: string) {
    try { await api(`courses/${c.slug}/`, { method: 'PATCH', body: { status } }); toast.success('Course updated'); void swr.mutate(); }
    catch (e) { toast.error('Could not update', errorMessage(e)); }
  }
  return (
    <>
      <PageHeader title="All courses" />
      <DataState swr={swr} skeleton={<TableSkeleton />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No courses yet" />}>
        {(d) => (
          <>
            <Table aria-label="Courses" classNames={{ wrapper: 'overflow-x-auto' }}>
              <TableHeader><TableColumn>Course</TableColumn><TableColumn>Instructor</TableColumn><TableColumn>Price</TableColumn><TableColumn>Students</TableColumn><TableColumn>Status</TableColumn><TableColumn> </TableColumn></TableHeader>
              <TableBody>
                {list(d).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><p className="font-medium">{c.title}</p>{c.category && <Chip size="sm" variant="flat">{c.category.name}</Chip>}</TableCell>
                    <TableCell>{c.instructor?.full_name}</TableCell>
                    <TableCell>{naira(c.price_kobo)}</TableCell>
                    <TableCell>{c.student_count}</TableCell>
                    <TableCell>
                      <Select aria-label="Status" size="sm" className="w-36" selectedKeys={[c.status]} disallowEmptySelection onSelectionChange={(k) => { void setStatus(c, firstKey(k)); }}>
                        {STATUSES.map((s) => <SelectItem key={s} className="capitalize">{s}</SelectItem>)}
                      </Select>
                    </TableCell>
                    <TableCell><Button as={Link} size="sm" variant="flat" to={`/instructor/courses/${c.slug}`}>Manage</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {d.count > 20 && <div className="mt-6 flex justify-center"><Pagination page={page} total={Math.ceil(d.count / 20)} onChange={setPage} showControls /></div>}
          </>
        )}
      </DataState>
    </>
  );
}
