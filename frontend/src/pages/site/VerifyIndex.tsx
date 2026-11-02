import { Button, Card, CardBody, Input } from '@heroui/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitle } from '@/lib/useTitle';

export default function VerifyIndex() {
  useTitle('Verify a certificate');
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  return (
    <div className="mx-auto max-w-lg py-10">
      <Card shadow="md"><CardBody className="space-y-4 p-8 text-center">
        <ShieldCheck className="mx-auto text-primary" size={40} />
        <h1 className="text-2xl font-semibold">Verify a certificate</h1>
        <p className="text-sm text-default-500">Paste the certificate ID from the link or QR code you were given.</p>
        <Input aria-label="Certificate ID" placeholder="e.g. 3f2b8c1e-..." value={token} onValueChange={setToken} />
        <Button color="primary" isDisabled={!token.trim()} onPress={() => navigate(`/verify/${encodeURIComponent(token.trim())}`)}>Verify</Button>
      </CardBody></Card>
    </div>
  );
}
