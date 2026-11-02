import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useState, type ChangeEvent } from 'react';
import useSWR from 'swr';
import { api, errorMessage, list } from '@/lib/api';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import type { Category, Course, Listish } from '@/types';

interface Form { title: string; subtitle: string; description: string; category: string; level: string; price: string; status: string }

export default function CourseForm({ course, onSaved }: { course?: Course; onSaved?: (saved?: Course) => void }) {
  const { data: cats } = useSWR<Listish<Category>>('categories/');
  const [f, setF] = useState<Form>({
    title: course?.title || '', subtitle: course?.subtitle || '', description: course?.description || '',
    category: course?.category?.id ? String(course.category.id) : '', level: course?.level || 'beginner',
    price: course ? String(course.price_kobo / 100) : '0', status: course?.status || 'draft',
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Form) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    setBusy(true);
    try {
      const body: Record<string, unknown> = { title: f.title, subtitle: f.subtitle, description: f.description, level: f.level,
        category: f.category ? Number(f.category) : null, price_kobo: Math.round(Number(f.price || 0) * 100) };
      if (course) body.status = f.status;
      const saved = await api<Course>(course ? `courses/${course.slug}/` : 'courses/', { method: course ? 'PATCH' : 'POST', body });
      toast.success(course ? 'Course saved' : 'Course created');
      onSaved?.(saved);
    } catch (e) { toast.error('Could not save', errorMessage(e)); } finally { setBusy(false); }
  }

  async function thumb(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !course) return;
    const form = new FormData(); form.append('thumbnail', file);
    try { await api(`courses/${course.slug}/`, { method: 'PATCH', form }); toast.success('Thumbnail updated'); onSaved?.(); }
    catch (err) { toast.error('Upload failed', errorMessage(err)); }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Input label="Title" value={f.title} onValueChange={set('title')} isRequired />
      <Input label="Subtitle" value={f.subtitle} onValueChange={set('subtitle')} />
      <Textarea label="Description (Markdown supported)" minRows={5} value={f.description} onValueChange={set('description')} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Category" selectedKeys={f.category ? [f.category] : []} onSelectionChange={(k) => set('category')(firstKey(k))}>
          {list(cats).map((c) => <SelectItem key={String(c.id)}>{c.name}</SelectItem>)}
        </Select>
        <Select label="Level" selectedKeys={[f.level]} disallowEmptySelection onSelectionChange={(k) => set('level')(firstKey(k))}>
          {['beginner', 'intermediate', 'advanced'].map((l) => <SelectItem key={l} className="capitalize">{l}</SelectItem>)}
        </Select>
        <Input type="number" min="0" label="Price (₦)" description="0 makes the course free" value={f.price} onValueChange={set('price')} />
        {course && (
          <Select label="Status" selectedKeys={[f.status]} disallowEmptySelection onSelectionChange={(k) => set('status')(firstKey(k))}
            description="Publishing needs at least one lesson">
            {['draft', 'published', 'archived'].map((l) => <SelectItem key={l} className="capitalize">{l}</SelectItem>)}
          </Select>
        )}
      </div>
      {course && <div><label className="mb-1 block text-sm text-default-600">Thumbnail (PNG/JPG/WebP, max 3 MB)</label>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { void thumb(e); }} className="text-sm" /></div>}
      <Button color="primary" onPress={save} isLoading={busy} isDisabled={!f.title.trim()}>{course ? 'Save changes' : 'Create course'}</Button>
    </div>
  );
}
