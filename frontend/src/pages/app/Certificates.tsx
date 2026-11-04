import { Button } from '@heroui/react';
import { Award, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/Skeletons';
import { list } from '@/lib/api';
import { dateOnly } from '@/lib/format';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { Certificate, Listish } from '@/types';

export default function Certificates() {
  useTitle('Certificates');
  const swr = useSWR<Listish<Certificate>>('certificates/');
  const copy = async (token: string) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/verify/${token}`); toast.success('Verification link copied'); }
    catch { toast.error('Could not copy the link'); }
  };
  return (
    <>
      <PageHeader title="Certificates" subtitle="Share the link so anyone can verify your achievement." />
      <DataState swr={swr} skeleton={<ListSkeleton rows={3} />} isEmpty={(d) => list(d).length === 0}
        empty={<EmptyState icon={Award} title="No certificates yet" text="Complete every lesson (and pass required quizzes) to earn one." action={<Button as={Link} to="/my-learning" color="primary">Continue learning</Button>} />}>
        {(d) => (
          <div className="grid gap-4 sm:grid-cols-2">
            {list(d).map((c) => (
              <div key={c.id} className="panel relative overflow-hidden p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-indigo-400" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning-700 dark:text-warning"><Award size={22} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-default-500">Certificate of completion</p>
                    <p className="mt-1 text-lg font-semibold leading-snug">{c.course_title}</p>
                    <p className="mt-1 text-sm text-default-500">Issued {dateOnly(c.issued_at)}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-2 border-t border-divider pt-4">
                  <Button as={Link} to={`/verify/${c.token}`} size="sm" variant="flat" color="primary" startContent={<ExternalLink size={14} />}>View</Button>
                  <Button size="sm" variant="flat" startContent={<Copy size={14} />} onPress={() => { void copy(c.token); }}>Copy link</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DataState>
    </>
  );
}
