import { Button, Input } from '@heroui/react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { errorMessage } from '@/lib/api';
import { safeNext } from '@/lib/safeNext';
import { useTitle } from '@/lib/useTitle';

export default function LoginPage() {
  useTitle('Sign in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await login(email, password);
      navigate(safeNext(params.get('next')), { replace: true });
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mb-8 mt-1 text-sm text-default-500">Sign in to continue learning.</p>
      <form onSubmit={submit} className="space-y-4">
        <Input variant="bordered" labelPlacement="outside" placeholder=" " type="email" label="Email" value={email} onValueChange={setEmail} isRequired autoComplete="email" />
        <Input variant="bordered" labelPlacement="outside" placeholder=" " type="password" label="Password" value={password} onValueChange={setPassword} isRequired autoComplete="current-password" />
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" color="primary" fullWidth isLoading={busy}>Sign in</Button>
      </form>
      <div className="mt-5 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-primary">Forgot password?</Link>
        <Link to="/register" className="text-primary">Create account</Link>
      </div>
    </div>
  );
}
