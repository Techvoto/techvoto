import { Button, Card, CardBody, Input } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/Skeletons';
import { api, errorMessage, list } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { Category, Listish } from '@/types';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminCategories() {
  useTitle('Categories');
  const swr = useSWR<Listish<Category>>('categories/');
  const [name, setName] = useState('');
  async function add() {
    try { await api('categories/', { method: 'POST', body: { name, slug: slugify(name) } }); setName(''); void swr.mutate(); }
    catch (e) { toast.error('Could not add category', errorMessage(e)); }
  }
  async function remove(c: Category) {
    if (!window.confirm(`Delete "${c.name}"? Courses in it will become uncategorised.`)) return;
    await api(`categories/${c.slug}/`, { method: 'DELETE' }); void swr.mutate();
  }
  return (
    <div className="max-w-xl">
      <PageHeader title="Categories" subtitle="Used to organise the course catalogue." />
      <div className="mb-4 flex gap-2">
        <Input aria-label="Category name" placeholder="New category name" value={name} onValueChange={setName} />
        <Button color="primary" onPress={() => { void add(); }} isDisabled={!name.trim()}>Add</Button>
      </div>
      <DataState swr={swr} skeleton={<ListSkeleton rows={4} />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No categories yet" />}>
        {(d) => <div className="space-y-2">{list(d).map((c) => (
          <Card key={c.id} shadow="sm"><CardBody className="flex flex-row items-center justify-between"><span className="font-medium">{c.name}</span>
            <Button isIconOnly size="sm" variant="light" color="danger" aria-label={`Delete ${c.name}`} onPress={() => { void remove(c); }}><Trash2 size={14} /></Button></CardBody></Card>
        ))}</div>}
      </DataState>
    </div>
  );
}
