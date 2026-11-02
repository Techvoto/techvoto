import { Button, Card, CardBody, Skeleton } from '@heroui/react';
import { Award, Printer, ShieldAlert } from 'lucide-react';
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
      <div className="mx-auto max-w-lg py-10"><Card shadow="md"><CardBody className="space-y-3 p-8 text-center">
        <ShieldAlert className="mx-auto text-danger" size={40} />
        <h1 className="text-2xl font-semibold">Certificate not found</h1>
        <p className="text-sm text-default-500">We could not verify this certificate. Check the ID and try again.</p>
      </CardBody></Card></div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card shadow="lg" className="border-2 border-primary/30"><CardBody className="space-y-4 p-10 text-center">
        <Award className="mx-auto text-primary" size={48} />
        <p className="text-xs uppercase tracking-[0.3em] text-default-500">Certificate of completion</p>
        <p className="text-sm text-default-500">This certifies that</p>
        <h1 className="text-4xl font-semibold">{data.holder}</h1>
        <p className="text-sm text-default-500">has successfully completed</p>
        <h2 className="text-2xl font-semibold">{data.course}</h2>
        <p className="text-sm text-default-500">Issued on {dateOnly(data.issued_at)} · Techvoto</p>
        <p className="break-all text-xs text-default-400">ID: {token}</p>
        <p className="mx-auto w-fit rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">✓ Verified authentic</p>
      </CardBody></Card>
      <div className="no-print text-center"><Button variant="flat" startContent={<Printer size={16} />} onPress={() => window.print()}>Print or save as PDF</Button></div>
    </div>
  );
}
