import { Button, Card, CardBody, Input, Textarea } from '@heroui/react';
import { CheckCircle2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api, ApiError, errorMessage } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';

interface Form { name: string; email: string; subject: string; message: string; website: string }

export default function Contact() {
  useTitle('Contact us');
  const [f, setF] = useState<Form>({ name: '', email: '', subject: '', message: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof Form) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await api('contact/', { method: 'POST', body: f }); setDone(true); }
    catch (err) { setError(err instanceof ApiError && err.status === 429 ? 'You have sent several messages already. Please try again later.' : errorMessage(err)); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <h1 className="text-3xl font-semibold">Contact us</h1>
      <p className="mb-6 mt-1 text-default-500">Questions about courses, payments or training for your team? We usually reply within one business day.</p>
      <Card shadow="md"><CardBody className="p-6">
        {done ? (
          <div className="space-y-3 py-6 text-center"><CheckCircle2 size={44} className="mx-auto text-success" /><p className="font-semibold">Message sent</p><p className="text-sm text-default-500">Thanks for reaching out. We will reply to {f.email}.</p></div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Your name" value={f.name} onValueChange={set('name')} isRequired />
              <Input type="email" label="Email" value={f.email} onValueChange={set('email')} isRequired />
            </div>
            <Input label="Subject" value={f.subject} onValueChange={set('subject')} isRequired />
            <Textarea label="Message" minRows={5} value={f.message} onValueChange={set('message')} isRequired />
            {/* honeypot: hidden from people, tempting to bots */}
            <div aria-hidden="true" className="absolute -left-[9999px]"><input tabIndex={-1} autoComplete="off" name="website" value={f.website} onChange={(e) => set('website')(e.target.value)} /></div>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <Button type="submit" color="primary" isLoading={busy}>Send message</Button>
          </form>
        )}
      </CardBody></Card>
    </div>
  );
}
