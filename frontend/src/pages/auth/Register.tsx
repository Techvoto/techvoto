import { Button, Checkbox, Input } from '@heroui/react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type RegisterPayload } from '@/context/auth';
import { errorMessage } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';

export default function RegisterPage() {
  useTitle('Create account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState<RegisterPayload>({ first_name: '', last_name: '', email: '', password: '', password2: '' });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof RegisterPayload) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (f.password !== f.password2) { setError('Passwords do not match.'); return; }
    setBusy(true); setError('');
    try { await register(f); navigate('/dashboard?welcome=1', { replace: true }); }
    catch (err) { setError(errorMessage(err)); setBusy(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mb-8 mt-1 text-sm text-default-500">Start learning in under a minute.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input variant="bordered" labelPlacement="outside" placeholder=" " label="First name" value={f.first_name} onValueChange={set('first_name')} isRequired autoComplete="given-name" />
          <Input variant="bordered" labelPlacement="outside" placeholder=" " label="Last name" value={f.last_name} onValueChange={set('last_name')} isRequired autoComplete="family-name" />
        </div>
        <Input variant="bordered" labelPlacement="outside" placeholder=" " type="email" label="Email" value={f.email} onValueChange={set('email')} isRequired autoComplete="email" />
        <Input variant="bordered" labelPlacement="outside" placeholder=" " type="password" label="Password" description="At least 8 characters; avoid common passwords." value={f.password} onValueChange={set('password')} isRequired autoComplete="new-password" />
        <Input variant="bordered" labelPlacement="outside" placeholder=" " type="password" label="Confirm password" value={f.password2} onValueChange={set('password2')} isRequired autoComplete="new-password" />
        <Checkbox isSelected={agree} onValueChange={setAgree} size="sm">
          I agree to the <Link to="/terms" className="text-primary">Terms</Link> and <Link to="/privacy" className="text-primary">Privacy Policy</Link>
        </Checkbox>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" color="primary" fullWidth isLoading={busy} isDisabled={!agree}>Create account</Button>
      </form>
      <p className="mt-5 text-center text-sm">Already have an account? <Link to="/login" className="text-primary">Sign in</Link></p>
    </div>
  );
}
