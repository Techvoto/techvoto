import {
  Avatar, Badge, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Dropdown, DropdownItem,
  DropdownMenu, DropdownTrigger, useDisclosure,
} from '@heroui/react';
import {
  Award, Bell, BookOpen, CreditCard, GraduationCap, HelpCircle, Inbox, LayoutDashboard, LogOut, Menu, Radio,
  Receipt, Search, Tags, Undo2, User, Users, Video, type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '@/context/auth';
import GlobalSearch from './GlobalSearch';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import VerifyBanner from './VerifyBanner';

type NavItem = [label: string, href: string, icon: LucideIcon];
type NavGroup = [title: string | null, items: NavItem[]];

const NAV: Record<'student' | 'instructor' | 'admin', NavGroup[]> = {
  student: [
    [null, [['Home', '/dashboard', LayoutDashboard], ['My learning', '/my-learning', BookOpen]]],
    ['Explore', [['Course catalog', '/courses', Search], ['Live classes', '/live', Video]]],
    ['Achievements', [['Certificates', '/certificates', Award], ['Billing', '/billing', Receipt]]],
  ],
  instructor: [
    [null, [['Overview', '/instructor', LayoutDashboard], ['My courses', '/instructor/courses', GraduationCap]]],
    ['Teaching', [['Live classes', '/live', Video]]],
    ['Learning', [['Course catalog', '/courses', Search], ['My learning', '/my-learning', BookOpen]]],
  ],
  admin: [
    [null, [['Overview', '/admin', LayoutDashboard]]],
    ['Manage', [['Users', '/admin/users', Users], ['Courses', '/admin/courses', GraduationCap], ['Categories', '/admin/categories', Tags], ['Live classes', '/live', Radio]]],
    ['Finance', [['Payments', '/admin/payments', CreditCard], ['Refunds', '/admin/refunds', Undo2]]],
    ['Support', [['Messages', '/admin/messages', Inbox], ['Course catalog', '/courses', Search]]],
  ],
};

const ACCOUNT: NavGroup[] = [['Account', [['Profile', '/profile', User], ['Notifications', '/notifications', Bell]]]];

function NavLinks({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  // The most specific matching link wins, so /instructor/courses does not also light up /instructor.
  const all = groups.flatMap(([, items]) => items.map(([, href]) => href));
  const best = all.filter((h) => pathname === h || pathname.startsWith(`${h}/`)).sort((a, b) => b.length - a.length)[0];
  return (
    <nav className="flex flex-col gap-6" aria-label="Primary">
      {groups.map(([title, items], gi) => (
        <div key={title || gi}>
          {title && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-default-500">{title}</p>}
          <ul className="space-y-1">
            {items.map(([label, href, Icon]) => {
              const active = href === best;
              return (
                <li key={href}>
                  <Link
                    to={href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-default-600 hover:bg-default-100 hover:text-foreground'}`}
                  >
                    {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" aria-hidden="true" />}
                    <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />{label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Signed-in chrome. Auth gating happens in the route (see layouts/AppLayout), so `user` is always set here. */
export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const drawer = useDisclosure();
  const { data: unread } = useSWR<{ count: number }>(user ? 'notifications/unread-count/' : null, { refreshInterval: 60000 });
  if (!user) return null;
  const groups = NAV[user.role === 'admin' ? 'admin' : user.role === 'instructor' ? 'instructor' : 'student'];

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-divider bg-background/80 px-3 backdrop-blur-xl sm:px-5">
        <Button isIconOnly variant="light" aria-label="Open menu" onPress={drawer.onOpen} className="lg:hidden"><Menu size={20} /></Button>
        <Logo href="/dashboard" />
        <div className="ml-auto flex items-center gap-1">
          <GlobalSearch />
          <Button as={Link} to="/contact" isIconOnly variant="light" radius="full" aria-label="Help and support" className="hidden sm:flex"><HelpCircle size={19} /></Button>
          <ThemeToggle />
          <Badge content={unread?.count || ''} color="danger" size="sm" isInvisible={!unread?.count} shape="circle">
            <Button as={Link} to="/notifications" isIconOnly variant="light" radius="full" aria-label={`Notifications${unread?.count ? `, ${unread.count} unread` : ''}`}><Bell size={19} /></Button>
          </Badge>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar as="button" size="sm" isBordered color="primary" className="ml-2 cursor-pointer" name={user.full_name} src={user.avatar || undefined} aria-label="Account menu" />
            </DropdownTrigger>
            <DropdownMenu aria-label="Account">
              <DropdownItem key="who" isReadOnly className="opacity-100" textValue="account">
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-xs text-default-500">{user.email}</p>
                <p className="text-xs capitalize text-default-500">{user.role}</p>
              </DropdownItem>
              <DropdownItem key="profile" href="/profile" startContent={<User size={16} />}>Profile</DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut size={16} />} onPress={() => { void logout(); }}>Sign out</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      <div className="flex">
        <aside className="no-print scroll-thin sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-divider bg-content1 p-4 lg:flex">
          <NavLinks groups={groups} />
          <div className="mt-auto space-y-4 border-t border-divider pt-4">
            <NavLinks groups={ACCOUNT} />
            <div className="flex items-center gap-3 rounded-xl bg-default-100 p-3">
              <Avatar size="sm" name={user.full_name} src={user.avatar || undefined} />
              <div className="min-w-0 grow">
                <p className="truncate text-sm font-semibold">{user.full_name}</p>
                <p className="text-xs capitalize text-default-500">{user.role}</p>
              </div>
              <Button isIconOnly size="sm" variant="light" aria-label="Sign out" onPress={() => { void logout(); }}><LogOut size={16} /></Button>
            </div>
          </div>
        </aside>
        <main id="main" className="min-w-0 grow">
          <div className="mx-auto w-full max-w-page p-4 sm:p-8 lg:p-10"><VerifyBanner />{children}</div>
        </main>
      </div>

      <Drawer isOpen={drawer.isOpen} onOpenChange={drawer.onOpenChange} placement="left" size="xs">
        <DrawerContent>
          {(close) => (
            <>
              <DrawerHeader><Logo href="/dashboard" /></DrawerHeader>
              <DrawerBody className="gap-6 pb-6">
                <NavLinks groups={groups} onNavigate={close} />
                <div className="border-t border-divider pt-4"><NavLinks groups={ACCOUNT} onNavigate={close} /></div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
