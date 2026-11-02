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
    <div role="status" className="no-print mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-warning-300 bg-warning-50 p-4 text-warning-900 dark:bg-warning/10 dark:text-warning-600">
      <MailWarning className="shrink-0" size={20} />
      <p className="grow text-sm"><strong>Verify your email to enroll in courses.</strong> We sent a link to {user.email}.</p>
      <Button size="sm" color="warning" variant="flat" onPress={resend} isLoading={busy} isDisabled={sent}>{sent ? 'Sent' : 'Resend email'}</Button>
    </div>
  );
}
