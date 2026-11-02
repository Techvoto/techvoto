import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, useDisclosure } from '@heroui/react';
import { Receipt } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { TableSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { dateTime, naira } from '@/lib/format';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { Listish, Payment, PaymentStatus } from '@/types';

const COLOR: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'default'> = { success: 'success', pending: 'warning', failed: 'danger', refund_pending: 'warning', refunded: 'default', refund_failed: 'danger' };

export default function Billing() {
  useTitle('Billing');
  const swr = useSWR<Listish<Payment>>('payments/mine/');
  const modal = useDisclosure();
  const [target, setTarget] = useState<Payment | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestRefund() {
    if (!target) return;
    setBusy(true);
    try {
      await api(`payments/${target.id}/request-refund/`, { method: 'POST', body: { reason } });
      toast.success('Refund requested', 'We will review it and email you.'); setReason(''); modal.onClose(); void swr.mutate();
    } catch (e) { toast.error('Could not request refund', errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title="Billing" subtitle="Your payments and refund requests." />
      <DataState swr={swr} skeleton={<TableSkeleton />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState icon={Receipt} title="No payments yet" text="Paid courses you buy will show up here." />}>
        {(d) => (
          <Table aria-label="Payments" classNames={{ wrapper: 'overflow-x-auto' }}>
            <TableHeader><TableColumn>Course</TableColumn><TableColumn>Amount</TableColumn><TableColumn>Status</TableColumn><TableColumn>Date</TableColumn><TableColumn> </TableColumn></TableHeader>
            <TableBody>
              {list(d).map((p) => (
                <TableRow key={p.id}>
                  <TableCell><p className="font-medium">{p.course_title}</p><p className="font-mono text-xs text-default-400">{p.reference}</p></TableCell>
                  <TableCell>{naira(p.amount_kobo)}</TableCell>
                  <TableCell><Chip size="sm" variant="flat" color={COLOR[p.status]} className="capitalize">{p.status.replace(/_/g, ' ')}</Chip>
                    {p.refund_request_status === 'pending' && <p className="mt-1 text-xs text-default-500">Refund requested</p>}
                    {p.refund_request_status === 'processing' && <p className="mt-1 text-xs text-warning">Refund being processed</p>}
                    {p.refund_request_status === 'approved' && <p className="mt-1 text-xs text-default-500">Refund submitted to provider</p>}
                    {p.refund_request_status === 'rejected' && <p className="mt-1 text-xs text-danger">Refund declined</p>}
                    {p.refund_request_status === 'failed' && <p className="mt-1 text-xs text-danger">Refund could not be processed</p>}</TableCell>
                  <TableCell>{dateTime(p.refunded_at || p.paid_at || p.created_at)}</TableCell>
                  <TableCell>{p.can_request_refund && <Button size="sm" variant="flat" onPress={() => { setTarget(p); modal.onOpen(); }}>Request refund</Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataState>
      <p className="mt-4 text-xs text-default-500">Refunds are available shortly after purchase, before you have completed much of the course. If approved, access to the course is removed.</p>
      <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalContent><ModalHeader>Request a refund</ModalHeader>
          <ModalBody><p className="text-sm text-default-500">{target?.course_title} · {target ? naira(target.amount_kobo) : ''}</p>
            <Textarea label="Why are you requesting a refund?" minRows={3} value={reason} onValueChange={setReason} /></ModalBody>
          <ModalFooter><Button variant="light" onPress={modal.onClose}>Cancel</Button><Button color="primary" onPress={requestRefund} isLoading={busy} isDisabled={reason.trim().length < 10}>Submit request</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
