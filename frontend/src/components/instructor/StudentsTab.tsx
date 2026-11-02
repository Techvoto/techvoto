import { Progress, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { Users } from 'lucide-react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import { TableSkeleton } from '@/components/Skeletons';
import type { CourseDetail, Gradebook } from '@/types';

export default function StudentsTab({ course }: { course: CourseDetail }) {
  const swr = useSWR<Gradebook>(`courses/${course.slug}/gradebook/`);
  return (
    <DataState swr={swr} skeleton={<TableSkeleton />} isEmpty={(d) => d.rows.length === 0} empty={<EmptyState icon={Users} title="No students yet" text="Students appear here once they enroll." />}>
      {(d) => (
        <Table aria-label="Gradebook" isHeaderSticky classNames={{ wrapper: 'overflow-x-auto' }}>
          <TableHeader>{[
            <TableColumn key="student">Student</TableColumn>,
            <TableColumn key="progress">Progress</TableColumn>,
            ...d.quizzes.map((q) => <TableColumn key={`q${q.id}`}>{q.title}</TableColumn>),
            ...d.assignments.map((a) => <TableColumn key={`a${a.id}`}>{a.title} /{a.max_score}</TableColumn>),
          ]}</TableHeader>
          <TableBody>
            {d.rows.map((r) => (
              <TableRow key={r.student_id}>{[
                <TableCell key="student"><p className="font-medium">{r.student}</p><p className="text-xs text-default-400">{r.email}</p></TableCell>,
                <TableCell key="progress"><Progress aria-label="Progress" size="sm" value={r.progress_pct} color={r.completed ? 'success' : 'primary'} className="min-w-28" showValueLabel /></TableCell>,
                ...d.quizzes.map((q) => <TableCell key={`q${q.id}`}>{r.quizzes[q.id] != null ? `${r.quizzes[q.id]}%` : '–'}</TableCell>),
                ...d.assignments.map((a) => <TableCell key={`a${a.id}`}>{r.assignments[a.id] != null ? r.assignments[a.id] : '–'}</TableCell>),
              ]}</TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataState>
  );
}
