import { Button, Card, CardBody, Chip } from '@heroui/react';
import { Radio, Video } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { dateTime } from '@/lib/format';
import type { LiveClass, LiveStatus } from '@/types';

const COLOR: Record<LiveStatus, 'primary' | 'danger' | 'default' | 'warning'> = { scheduled: 'primary', live: 'danger', ended: 'default', cancelled: 'warning' };

export default function LiveCard({ live, extra }: { live: LiveClass; extra?: ReactNode }) {
  const closed = live.status === 'ended' || live.status === 'cancelled';
  return (
    <Card shadow="sm"><CardBody className="flex flex-row flex-wrap items-center gap-4">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${live.status === 'live' ? 'bg-danger/15 text-danger' : 'bg-primary/10 text-primary'}`}>
        {live.status === 'live' ? <Radio size={22} /> : <Video size={22} />}
      </div>
      <div className="min-w-0 grow">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{live.title}</p>
          <Chip size="sm" variant="flat" color={COLOR[live.status]} className="capitalize">{live.status === 'live' ? '● Live now' : live.status}</Chip>
        </div>
        <p className="text-sm text-default-500">{live.course_title} · {dateTime(live.starts_at)} · {live.duration_minutes} min · {live.host_name}</p>
      </div>
      <div className="flex gap-2">
        {extra}
        {!closed && (
          <Button as={Link} to={`/live/${live.id}`} color={live.status === 'live' ? 'danger' : 'primary'} variant={live.can_join ? 'solid' : 'flat'}
            isDisabled={!live.can_join}>
            {live.is_host ? 'Start class' : live.can_join ? 'Join' : 'Opens 15 min before'}
          </Button>
        )}
        {live.status === 'ended' && live.recording_url && <Button as="a" href={live.recording_url} target="_blank" rel="noopener noreferrer" variant="flat">Recording</Button>}
      </div>
    </CardBody></Card>
  );
}
