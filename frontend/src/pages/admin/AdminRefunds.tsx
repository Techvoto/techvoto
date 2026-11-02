import { Button, Chip, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { TableSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { dateTime, naira } from '@/lib/format';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { Listish, RefundRequest } from '@/types';

const COLOR: Record<RefundRequest['status'], 'warning' | 'success' | 'danger'> = { pending: 'warning', processing: 'warning', approved: 'success', rejected: 'danger', failed: 'danger' };

export default function AdminRefunds() {
  useTitle('Refund requests');
  const [status, setStatus] = useState('pending');
  const swr = useSWR<Listish<RefundRequest>>(`payments/refund-requests/?status=${status}`);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function decide(r: RefundRequest, action: 'approve' | 'reject') {
    const note = action === 'reject' ? window.prompt('Reason shown to the student (optional):') : '';
    if (note === null) return;
    if (action === 'approve' && !window.confirm(`Refund ${naira(r.amount_kobo)} to ${r.student}? They will lose access to the course.`)) return;
    setBusyId(r.id);
    try { await api(`payments/refund-requests/${r.id}/${action}/`, { method: 'POST', body: { note } }); toast.success(action === 'approve' ? 'Refund submitted to Paystack' : 'Request declined'); void swr.mutate(); }
    catch (e) { toast.error('Action failed', errorMessage(e)); } finally { setBusyId(null); }
  }

  return (
    <>
      <PageHeader title="Refund requests" />
      <Select aria-label="Status" className="mb-4 max-w-xs" selectedKeys={[status]} disallowEmptySelection onSelectionChange={(k) => setStatus(firstKey(k))}>
        {['pending', 'processing', 'approved', 'rejected', 'failed'].map((s) => <SelectItem key={s} className="capitalize">{s}</SelectItem>)}
      </Select>
      <DataState swr={swr} skeleton={<TableSkeleton />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title={`No ${status} requests`} />}>
        {(d) => (
          <Table aria-label="Refund requests" classNames={{ wrapper: 'overflow-x-auto' }}>
            <TableHeader><TableColumn>Student</TableColumn><TableColumn>Course</TableColumn><TableColumn>Amount</TableColumn><TableColumn>Reason</TableColumn><TableColumn>Progress</TableColumn><TableColumn>Status</TableColumn><TableColumn> </TableColumn></TableHeader>
            <TableBody>
              {list(d).map((r) => (
                <TableRow key={r.id}>
                  <TableCell><p className="font-medium">{r.student}</p><p className="text-xs text-default-400">{r.email}</p></TableCell>
                  <TableCell>{r.course_title}</TableCell>
                  <TableCell>{naira(r.amount_kobo)}</TableCell>
                  <TableCell className="max-w-xs"><p className="line-clamp-3 text-sm">{r.reason}</p><p className="text-xs text-default-400">{dateTime(r.created_at)}</p></TableCell>
                  <TableCell>{r.progress_pct ?? '–'}%</TableCell>
                  <TableCell><Chip size="sm" variant="flat" color={COLOR[r.status]} className="capitalize">{r.status}</Chip></TableCell>
                  <TableCell>{r.status === 'pending' && <div className="flex gap-2">
                    <Button size="sm" color="primary" isLoading={busyId === r.id} onPress={() => { void decide(r, 'approve'); }}>Approve</Button>
                    <Button size="sm" variant="flat" color="danger" onPress={() => { void decide(r, 'reject'); }}>Decline</Button></div>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataState>
    </>
  );
}
