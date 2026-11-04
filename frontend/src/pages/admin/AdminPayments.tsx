import { Button, Chip, Pagination, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
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
import type { Paged, Payment, PaymentStatus } from '@/types';

const COLOR: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'default'> = { success: 'success', pending: 'warning', failed: 'danger', refund_pending: 'warning', refunded: 'default', refund_failed: 'danger' };
const STATUSES: PaymentStatus[] = ['success', 'pending', 'failed', 'refund_pending', 'refunded', 'refund_failed'];

export default function AdminPayments() {
  useTitle('Payments');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const swr = useSWR<Paged<Payment>>(`payments/all/?page=${page}${status ? `&status=${status}` : ''}`, { keepPreviousData: true });
  async function refund(p: Payment) {
    if (!window.confirm(`Refund ${naira(p.amount_kobo)} to ${p.user_email}? Their access to the course will be removed.`)) return;
    try { await api(`payments/${p.id}/refund/`, { method: 'POST' }); toast.success('Refund submitted to Paystack'); void swr.mutate(); }
    catch (e) { toast.error('Refund failed', errorMessage(e)); }
  }
  return (
    <>
      <PageHeader title="Payments" subtitle="All Paystack transactions." />
      <Select aria-label="Status filter" placeholder="All statuses" className="mb-4 max-w-xs" selectedKeys={status ? [status] : []} onSelectionChange={(k) => { setStatus(firstKey(k)); setPage(1); }}>
        {STATUSES.map((s) => <SelectItem key={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
      </Select>
      <DataState swr={swr} skeleton={<TableSkeleton />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No payments yet" />}>
        {(d) => (
          <>
            <Table aria-label="Payments" classNames={{ wrapper: 'overflow-x-auto' }}>
              <TableHeader><TableColumn>Reference</TableColumn><TableColumn>Student</TableColumn><TableColumn>Course</TableColumn><TableColumn>Amount</TableColumn><TableColumn>Status</TableColumn><TableColumn>Date</TableColumn><TableColumn> </TableColumn></TableHeader>
              <TableBody>
                {list(d).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.reference}</TableCell><TableCell>{p.user_email}</TableCell><TableCell>{p.course_title}</TableCell>
                    <TableCell>{naira(p.amount_kobo)}</TableCell>
                    <TableCell><Chip size="sm" variant="flat" color={COLOR[p.status]} className="capitalize">{p.status.replace(/_/g, ' ')}</Chip></TableCell>
                    <TableCell>{dateTime(p.refunded_at || p.paid_at || p.created_at)}</TableCell>
                    <TableCell>{p.status === 'success' && <Button size="sm" variant="flat" color="danger" onPress={() => { void refund(p); }}>Refund</Button>}</TableCell>
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
