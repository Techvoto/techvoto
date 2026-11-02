import { Button, Card, CardBody, Spinner } from '@heroui/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { api, errorMessage } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';

export default function VerifyEmail() {
  useTitle('Verify your email');
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const [state, setState] = useState<'working' | 'ok' | 'error'>('working');
  const [msg, setMsg] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;      // React strict mode runs effects twice in dev; the token is only needed once
    ran.current = true;
    api<{ detail: string }>('auth/verify-email/', { method: 'POST', body: { uid: params.get('uid'), token: params.get('token') }, auth: false })
      .then((d) => { setMsg(d.detail); setState('ok'); void refresh(); })
      .catch((e: unknown) => { setMsg(errorMessage(e)); setState('error'); });
  }, [params, refresh]);

  return (
    <div className="mx-auto max-w-md pt-10"><Card shadow="md"><CardBody className="items-center space-y-4 p-10 text-center">
      {state === 'working' && <><Spinner size="lg" /><p>Verifying your email...</p></>}
      {state === 'ok' && <><CheckCircle2 size={48} className="text-success" /><h1 className="text-xl font-semibold">Email verified</h1><p className="text-sm text-default-500">{msg}</p><Button as={Link} to="/dashboard" color="primary">Go to dashboard</Button></>}
      {state === 'error' && <><XCircle size={48} className="text-danger" /><h1 className="text-xl font-semibold">Link not valid</h1><p className="text-sm text-default-500">{msg}</p><Button as={Link} to="/dashboard" variant="flat">Request a new link from your dashboard</Button></>}
    </CardBody></Card></div>
  );
}
