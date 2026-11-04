import { Button } from '@heroui/react';
import { MailWarning } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { api, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function VerifyBanner() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  if (!user || user.email_verified) return null;

  async function resend() {
    setBusy(true);
    try { await api('auth/resend-verification/', { method: 'POST' }); setSent(true); toast.success('Verification email sent', 'Check your inbox (and spam folder).'); }
    catch (e) { toast.error('Could not send', errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <div role="status" className="no-print mb-6 flex flex-wrap items-center gap-3 rounded-large border border-warning/40 bg-warning/10 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-warning/20 text-warning-700 dark:text-warning"><MailWarning size={18} /></span>
      <p className="grow text-sm"><strong className="font-semibold">Verify your email to enroll in courses.</strong> We sent a link to {user.email}.</p>
      <Button size="sm" color="warning" variant="flat" onPress={resend} isLoading={busy} isDisabled={sent}>{sent ? 'Sent' : 'Resend email'}</Button>
    </div>
  );
}
