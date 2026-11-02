import { Button, Card, CardBody, Spinner } from '@heroui/react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { classifyPaymentVerification } from '@/lib/payment-verification.mjs';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';

type VerificationState = 'checking' | 'success' | 'failed' | 'pending';

export default function CheckoutVerify() {
  useTitle('Confirming payment');
  const [params] = useSearchParams();
  const reference = params.get('reference');
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState>('checking');
  const [slug, setSlug] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!reference) { setState('failed'); return; }
    const paymentReference = reference;
    let tries = 0, stop = false;
    
    let timer: ReturnType<typeof setTimeout> | undefined;
    setState('checking');

    async function poll() {
      let status: string | null = null;
      let courseSlug = '';
      try {
        const result = await api<{ status: string; course_slug?: string }>(
          `payments/verify/${encodeURIComponent(paymentReference)}/`,
        );
        status = result.status;
        courseSlug = result.course_slug ?? '';
      } catch {
        // Network and gateway errors are inconclusive; keep the payment recoverable.
      }
      if (stop) return;
      tries += 1;
      const decision = classifyPaymentVerification(status, tries, 10);
      if (decision === 'success') {
        setSlug(courseSlug); setState('success');
        toast.success('Payment received. You are enrolled!');
        timer = setTimeout(() => navigate(`/learn/${courseSlug}`), 1500);
        return;
      }
      if (decision === 'failed') { setState('failed'); return; }
      if (decision === 'pending') { setState('pending'); return; }
      timer = setTimeout(poll, 2000);
    }

    void poll();
    return () => { stop = true; if (timer) clearTimeout(timer); };
  }, [reference, navigate, retryKey]);

  return (
    <div className="mx-auto max-w-md pt-10"><Card shadow="md"><CardBody className="items-center space-y-4 p-10 text-center">
      {state === 'checking' && <><Spinner size="lg" /><h1 className="text-xl font-semibold">Confirming your payment...</h1><p className="text-sm text-default-500">This only takes a moment. Please do not close this page.</p></>}
      {state === 'success' && <><CheckCircle2 size={48} className="text-success" /><h1 className="text-xl font-semibold">Payment successful</h1><Button as={Link} to={`/learn/${slug}`} color="primary">Start learning</Button></>}
      {state === 'pending' && <><Clock3 size={48} className="text-warning" /><h1 className="text-xl font-semibold">Payment is still being confirmed</h1><p className="text-sm text-default-500">We have not received a final result yet. If you were charged, do not pay again. You can safely check this reference again.</p><Button color="primary" onPress={() => setRetryKey((key) => key + 1)}>Check again</Button><Button as={Link} to="/billing" variant="flat">View billing</Button></>}
      {state === 'failed' && <><XCircle size={48} className="text-danger" /><h1 className="text-xl font-semibold">Payment was not successful</h1><p className="text-sm text-default-500">The payment provider reported a failed transaction. If your account was debited, contact support with your payment reference.</p><Button as={Link} to="/courses" variant="flat">Back to courses</Button></>}
    </CardBody></Card></div>
  );
}
