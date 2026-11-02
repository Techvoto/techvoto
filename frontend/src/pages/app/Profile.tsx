import { Avatar, Button, Card, CardBody, Input, Textarea } from '@heroui/react';
import { useRef, useState, type ChangeEvent } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/auth';
import { api, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';

export default function Profile() {
  useTitle('Profile');
  const { user, refresh } = useAuth();
  const [f, setF] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', bio: user?.bio || '' });
  const [pw, setPw] = useState({ old_password: '', new_password: '' });
  const [busy, setBusy] = useState('');
  const file = useRef<HTMLInputElement>(null);

  async function save() {
    setBusy('profile');
    try { await api('auth/me/', { method: 'PATCH', body: f }); await refresh(); toast.success('Profile updated'); }
    catch (e) { toast.error('Could not save', errorMessage(e)); } finally { setBusy(''); }
  }
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const form = new FormData(); form.append('avatar', picked);
    setBusy('avatar');
    try { await api('auth/me/', { method: 'PATCH', form }); await refresh(); toast.success('Photo updated'); }
    catch (err) { toast.error('Could not upload', errorMessage(err)); } finally { setBusy(''); }
  }
  async function changePassword() {
    setBusy('pw');
    try { await api('auth/change-password/', { method: 'POST', body: pw }); setPw({ old_password: '', new_password: '' }); toast.success('Password changed'); }
    catch (e) { toast.error('Could not change password', errorMessage(e)); } finally { setBusy(''); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Profile" subtitle={user?.email} />
      <Card shadow="sm"><CardBody className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar size="lg" name={user?.full_name} src={user?.avatar || undefined} />
          <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void upload(e); }} />
          <Button variant="flat" onPress={() => file.current?.click()} isLoading={busy === 'avatar'}>Change photo</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={f.first_name} onValueChange={(v) => setF({ ...f, first_name: v })} />
          <Input label="Last name" value={f.last_name} onValueChange={(v) => setF({ ...f, last_name: v })} />
        </div>
        <Textarea label="Bio" value={f.bio} onValueChange={(v) => setF({ ...f, bio: v })} />
        <Button color="primary" className="w-fit" onPress={save} isLoading={busy === 'profile'}>Save changes</Button>
      </CardBody></Card>
      <Card shadow="sm"><CardBody className="space-y-4">
        <h2 className="text-lg font-semibold">Change password</h2>
        <Input type="password" label="Current password" value={pw.old_password} onValueChange={(v) => setPw({ ...pw, old_password: v })} autoComplete="current-password" />
        <Input type="password" label="New password" value={pw.new_password} onValueChange={(v) => setPw({ ...pw, new_password: v })} autoComplete="new-password" />
        <Button variant="flat" className="w-fit" onPress={changePassword} isLoading={busy === 'pw'} isDisabled={!pw.old_password || !pw.new_password}>Update password</Button>
      </CardBody></Card>
    </div>
  );
}
