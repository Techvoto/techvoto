import { Button, Card, CardBody, Chip, Skeleton } from '@heroui/react';
import { ExternalLink, PhoneOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import DataState from '@/components/DataState';
import { api, errorMessage } from '@/lib/api';
import { dateTime } from '@/lib/format';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { LiveClass, LiveConnection } from '@/types';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = () => resolve(); s.onerror = () => reject(new Error('Could not load the meeting client.'));
    document.body.appendChild(s);
  });
}

function Room({ live }: { live: LiveClass }) {
  const navigate = useNavigate();
  const host = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const [conn, setConn] = useState<LiveConnection | null>(null);
  const [state, setState] = useState<'idle' | 'joining' | 'in'>('idle');
  const [error, setError] = useState('');

  useEffect(() => () => apiRef.current?.dispose?.(), []);

  async function join() {
    setState('joining'); setError('');
    try {
      const c = await api<LiveConnection>(`live-classes/${live.id}/join/`, { method: 'POST' });
      setConn(c);
      await loadScript(`https://${c.domain}/external_api.js`);
      setState('in');
      requestAnimationFrame(() => {
        apiRef.current = new window.JitsiMeetExternalAPI(c.domain, {
          roomName: c.room, jwt: c.jwt || undefined, parentNode: host.current, width: '100%', height: '100%',
          userInfo: { displayName: c.display_name, email: c.email },
          configOverwrite: { prejoinPageEnabled: false, disableDeepLinking: true },
        });
        apiRef.current.addListener('readyToClose', () => navigate('/live'));
      });
    } catch (e) { setError(errorMessage(e)); setState('idle'); }
  }

  async function endClass() {
    if (!window.confirm('End this class for everyone?')) return;
    try { await api(`live-classes/${live.id}/end/`, { method: 'POST' }); toast.success('Class ended'); apiRef.current?.dispose?.(); navigate('/live'); }
    catch (e) { toast.error('Could not end class', errorMessage(e)); }
  }

  if (state === 'in') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">{live.title}</p>
          <div className="flex gap-2">
            {conn && !conn.jwt && <Button as="a" size="sm" variant="flat" href={`https://${conn.domain}/${conn.room}`} target="_blank" rel="noopener noreferrer" endContent={<ExternalLink size={14} />}>Open in new tab</Button>}
            {conn?.is_moderator && <Button size="sm" color="danger" startContent={<PhoneOff size={14} />} onPress={() => { void endClass(); }}>End class</Button>}
          </div>
        </div>
        <div ref={host} className="h-[75vh] w-full overflow-hidden rounded-lg bg-black" />
      </div>
    );
  }

  return (
    <Card shadow="md" className="mx-auto max-w-xl"><CardBody className="space-y-4 p-8 text-center">
      <Chip className="mx-auto capitalize" color={live.status === 'live' ? 'danger' : 'primary'} variant="flat">{live.status === 'live' ? '● Live now' : live.status}</Chip>
      <h1 className="text-2xl font-semibold">{live.title}</h1>
      <p className="text-sm text-default-500">{live.course_title} · {dateTime(live.starts_at)} · {live.duration_minutes} min</p>
      {live.description && <p className="text-sm">{live.description}</p>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button color="primary" size="lg" onPress={() => { void join(); }} isLoading={state === 'joining'} isDisabled={!live.can_join}>
        {live.is_host ? 'Start class' : 'Join class'}
      </Button>
      {!live.can_join && <p className="text-xs text-default-500">You can join 15 minutes before the start time.</p>}
      <p className="text-xs text-default-400">Your browser will ask to use your camera and microphone.</p>
    </CardBody></Card>
  );
}

export default function LiveRoomPage() {
  useTitle('Live class');
  const { id = '' } = useParams();
  const swr = useSWR<LiveClass>(`live-classes/${id}/`);
  return (
    <DataState swr={swr} skeleton={<Skeleton className="mx-auto max-w-xl rounded-lg"><div className="h-72" /></Skeleton>}>
      {(live) => <Room live={live} />}
    </DataState>
  );
}
