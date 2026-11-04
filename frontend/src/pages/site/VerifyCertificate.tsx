import { Button, Card, CardBody, Skeleton } from '@heroui/react';
import { Award, BadgeCheck, Printer, ShieldAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { dateOnly } from '@/lib/format';
import { useTitle } from '@/lib/useTitle';
import type { CertificateCheck } from '@/types';

export default function VerifyCertificate() {
  useTitle('Certificate verification');
  const { token = '' } = useParams();
  const { data, error, isLoading } = useSWR<CertificateCheck>(`certificates/verify/${encodeURIComponent(token)}/`);

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="rounded-lg"><div className="h-80" /></Skeleton></div>;
  if (error || !data?.valid) {
    return (
      <div className="mx-auto max-w-lg py-10"><Card shadow="md" className="border border-divider"><CardBody className="space-y-3 p-8 text-center">
        <ShieldAlert className="mx-auto text-danger" size={40} />
        <h1 className="text-2xl font-semibold">Certificate not found</h1>
        <p className="text-sm text-default-500">We could not verify this certificate. Check the ID and try again.</p>
      </CardBody></Card></div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="panel relative overflow-hidden p-1.5 shadow-large">
        <div className="rounded-[10px] border border-primary/25 px-6 py-12 text-center sm:px-12 sm:py-14">
          <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"><Award size={32} /></span>
          <p className="eyebrow">Certificate of completion</p>
          <p className="mt-6 text-sm text-default-500">This certifies that</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{data.holder}</h1>
          <p className="mt-6 text-sm text-default-500">has successfully completed</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{data.course}</h2>
          <div className="mx-auto my-8 h-px w-24 bg-divider" />
          <p className="text-sm text-default-500">Issued on {dateOnly(data.issued_at)} · Techvoto</p>
          <p className="mt-2 break-all text-xs text-default-400">ID: {token}</p>
          <p className="mx-auto mt-6 flex w-fit items-center gap-1.5 rounded-full bg-success/15 px-3.5 py-1.5 text-xs font-semibold text-success"><BadgeCheck size={14} />Verified authentic</p>
        </div>
      </div>
      <div className="no-print text-center"><Button variant="flat" startContent={<Printer size={16} />} onPress={() => window.print()}>Print or save as PDF</Button></div>
    </div>
  );
}
