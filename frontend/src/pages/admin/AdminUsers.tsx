import { Chip, Input, Pagination, Select, SelectItem, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import DataState, { EmptyState } from '@/components/DataState';
import PageHeader from '@/components/PageHeader';
import { TableSkeleton } from '@/components/Skeletons';
import { useAuth } from '@/context/auth';
import { api, errorMessage, list } from '@/lib/api';
import { dateOnly } from '@/lib/format';
import { firstKey } from '@/lib/select';
import { toast } from '@/lib/toast';
import { useTitle } from '@/lib/useTitle';
import type { Paged, User } from '@/types';

const ROLES = ['student', 'instructor', 'admin'];

export default function AdminUsers() {
  useTitle('Users');
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { const t = setTimeout(() => { setQ(search); setPage(1); }, 350); return () => clearTimeout(t); }, [search]);
  const qs = new URLSearchParams({ page: String(page) });
  if (q) qs.set('search', q);
  if (role) qs.set('role', role);
  const swr = useSWR<Paged<User>>(`auth/admin/users/?${qs}`, undefined, { keepPreviousData: true });

  async function patch(u: User, body: Partial<Pick<User, 'role' | 'is_active'>>) {
    try { await api(`auth/admin/users/${u.id}/`, { method: 'PATCH', body }); toast.success('User updated'); void swr.mutate(); }
    catch (e) { toast.error('Could not update user', errorMessage(e)); }
  }

  return (
    <>
      <PageHeader title="Users" subtitle="Promote instructors and manage access." />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
        <Input aria-label="Search users" placeholder="Search by name or email" startContent={<Search size={16} />} value={search} onValueChange={setSearch} isClearable onClear={() => setSearch('')} />
        <Select aria-label="Role filter" placeholder="All roles" selectedKeys={role ? [role] : []} onSelectionChange={(k) => { setRole(firstKey(k)); setPage(1); }}>
          {ROLES.map((r) => <SelectItem key={r} className="capitalize">{r}</SelectItem>)}
        </Select>
      </div>
      <DataState swr={swr} skeleton={<TableSkeleton />} isEmpty={(d) => list(d).length === 0} empty={<EmptyState title="No users match" />}>
        {(d) => (
          <>
            <Table aria-label="Users" classNames={{ wrapper: 'overflow-x-auto' }}>
              <TableHeader><TableColumn>User</TableColumn><TableColumn>Role</TableColumn><TableColumn>Joined</TableColumn><TableColumn>Active</TableColumn></TableHeader>
              <TableBody>
                {list(d).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell><p className="font-medium">{u.full_name} {u.id === me?.id && <Chip size="sm" variant="flat">You</Chip>}</p><p className="text-xs text-default-400">{u.email}</p></TableCell>
                    <TableCell>
                      <Select aria-label={`Role for ${u.full_name}`} size="sm" className="w-36" selectedKeys={[u.role]} disallowEmptySelection isDisabled={u.id === me?.id}
                        onSelectionChange={(k) => { void patch(u, { role: firstKey(k) as User['role'] }); }}>
                        {ROLES.map((r) => <SelectItem key={r} className="capitalize">{r}</SelectItem>)}
                      </Select>
                    </TableCell>
                    <TableCell>{dateOnly(u.date_joined)}</TableCell>
                    <TableCell><Switch aria-label="Active" size="sm" isSelected={!!u.is_active} isDisabled={u.id === me?.id} onValueChange={(v) => { void patch(u, { is_active: v }); }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {d.count > 20 && <div className="mt-6 flex justify-center"><Pagination page={page} total={Math.ceil(d.count / 20)} onChange={setPage} showControls /></div>}
          </>
        )}
      </DataState>
    </>
  );
}
