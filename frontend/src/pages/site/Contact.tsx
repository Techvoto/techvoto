import { Button, Card, CardBody, Input, Textarea } from '@heroui/react';
import { CheckCircle2, Clock, LifeBuoy } from 'lucide-react';
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
    <div className="mx-auto grid max-w-5xl gap-10 py-4 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Talk to the Techvoto team</h1>
        <p className="mt-5 max-w-md leading-7 text-default-600">Questions about courses, payments or training for your team? Send us a message and we will get back to you.</p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Clock size={18} /></span>We usually reply within one business day</li>
          <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><LifeBuoy size={18} /></span>Help with courses, payments and certificates</li>
        </ul>
      </div>
      <Card shadow="md" className="h-fit border border-divider"><CardBody className="p-6 sm:p-8">
        {done ? (
          <div className="space-y-3 py-8 text-center"><CheckCircle2 size={44} className="mx-auto text-success" /><p className="text-lg font-semibold">Message sent</p><p className="text-sm text-default-500">Thanks for reaching out. We will reply to {f.email}.</p></div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input variant="bordered" label="Your name" value={f.name} onValueChange={set('name')} isRequired />
              <Input variant="bordered" type="email" label="Email" value={f.email} onValueChange={set('email')} isRequired />
            </div>
            <Input variant="bordered" label="Subject" value={f.subject} onValueChange={set('subject')} isRequired />
            <Textarea variant="bordered" label="Message" minRows={5} value={f.message} onValueChange={set('message')} isRequired />
            {/* honeypot: hidden from people, tempting to bots */}
            <div aria-hidden="true" className="absolute -left-[9999px]"><input tabIndex={-1} autoComplete="off" name="website" value={f.website} onChange={(e) => set('website')(e.target.value)} /></div>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <Button type="submit" color="primary" size="lg" className="w-full font-semibold" isLoading={busy}>Send message</Button>
          </form>
        )}
      </CardBody></Card>
    </div>
  );
}
