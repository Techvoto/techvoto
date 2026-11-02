import { Button, Input } from '@heroui/react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError, errorMessage } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';

export default function ForgotPasswordPage() {
  useTitle('Reset your password');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api('auth/password-reset/', { method: 'POST', body: { email }, auth: false });
      setDone(true);
    } catch (err) {
      // The API answers the same whether or not the account exists; only throttling is worth telling the visitor about.
      if (err instanceof ApiError && err.status === 429) setError('Too many requests. Please wait a while and try again.');
      else if (err instanceof ApiError && err.status < 500) setDone(true);
      else setError(errorMessage(err));
    } finally { setBusy(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      {done ? (
        <p className="mt-4 text-sm text-default-600">If an account exists for <strong>{email}</strong>, we have sent a reset link. Check your inbox.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <p className="text-sm text-default-500">Enter your email and we will send you a link.</p>
          <Input variant="bordered" labelPlacement="outside" placeholder=" " type="email" label="Email" value={email} onValueChange={setEmail} isRequired />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" color="primary" fullWidth isLoading={busy}>Send reset link</Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm"><Link to="/login" className="text-primary">Back to log in</Link></p>
    </div>
  );
}
