import { Button, Chip } from '@heroui/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { dateTime } from '@/lib/format';
import type { LiveClass, LiveStatus } from '@/types';

const COLOR: Record<LiveStatus, 'primary' | 'danger' | 'default' | 'warning'> = { scheduled: 'primary', live: 'danger', ended: 'default', cancelled: 'warning' };

const month = (iso: string) => new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(iso));
const day = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(new Date(iso));

export default function LiveCard({ live, extra }: { live: LiveClass; extra?: ReactNode }) {
  const closed = live.status === 'ended' || live.status === 'cancelled';
  const isLive = live.status === 'live';
  return (
    <div className={`panel flex flex-wrap items-center gap-4 p-4 sm:p-5 ${isLive ? 'border-danger/40' : ''}`}>
      <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${isLive ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`} aria-hidden="true">
        <span className="text-[10px] font-semibold uppercase leading-none tracking-wider">{month(live.starts_at)}</span>
        <span className="mt-0.5 text-xl font-semibold leading-none tabular-nums">{day(live.starts_at)}</span>
      </div>
      <div className="min-w-0 grow">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{live.title}</p>
          <Chip size="sm" variant="flat" color={COLOR[live.status]} className="capitalize">{isLive ? '● Live now' : live.status}</Chip>
        </div>
        <p className="mt-0.5 text-sm text-default-500">{live.course_title} · {dateTime(live.starts_at)} · {live.duration_minutes} min · {live.host_name}</p>
      </div>
      <div className="flex gap-2">
        {extra}
        {!closed && (
          <Button as={Link} to={`/live/${live.id}`} color={isLive ? 'danger' : 'primary'} variant={live.can_join ? 'solid' : 'flat'}
            isDisabled={!live.can_join} className="font-semibold">
            {live.is_host ? 'Start class' : live.can_join ? 'Join' : 'Opens 15 min before'}
          </Button>
        )}
        {live.status === 'ended' && live.recording_url && <Button as="a" href={live.recording_url} target="_blank" rel="noopener noreferrer" variant="flat">Recording</Button>}
      </div>
    </div>
  );
}
