import { Tab, Tabs } from '@heroui/react';
import { Video } from 'lucide-react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import LiveCard from '@/components/LiveCard';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/Skeletons';
import { list } from '@/lib/api';
import { useTitle } from '@/lib/useTitle';
import type { Listish, LiveClass } from '@/types';

function Group({ url, empty }: { url: string; empty: string }) {
  const swr = useSWR<Listish<LiveClass>>(url);
  return (
    <DataState swr={swr} skeleton={<ListSkeleton rows={3} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState icon={Video} title={empty} />}>
      {(d) => <div className="space-y-3 pt-4">{list(d).map((l) => <LiveCard key={l.id} live={l} />)}</div>}
    </DataState>
  );
}

export default function LivePage() {
  useTitle('Live classes');
  return (
    <>
      <PageHeader title="Live classes" subtitle="Join interactive sessions with your instructors." />
      <Tabs aria-label="Live classes" variant="underlined">
        <Tab key="up" title="Upcoming & live"><Group url="live-classes/?upcoming=1" empty="No upcoming classes" /></Tab>
        <Tab key="past" title="Past"><Group url="live-classes/?status=ended&ordering=-starts_at" empty="No past classes yet" /></Tab>
      </Tabs>
    </>
  );
}
