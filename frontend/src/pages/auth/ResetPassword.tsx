import { Button, Input } from '@heroui/react';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';

export default function ResetPasswordPage() {
  useTitle('Choose a new password');
  const [params] = useSearchParams();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api('auth/password-reset/confirm/', { method: 'POST', body: { uid: params.get('uid'), token: params.get('token'), new_password: pw }, auth: false });
      setDone(true);
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      {done ? (
        <p className="mt-4 text-sm">Your password has been reset. <Link to="/login" className="text-primary">Log in</Link></p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <Input variant="bordered" labelPlacement="outside" placeholder=" " type="password" label="New password" value={pw} onValueChange={setPw} isRequired autoComplete="new-password" />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" color="primary" fullWidth isLoading={busy}>Set new password</Button>
        </form>
      )}
    </div>
  );
}
