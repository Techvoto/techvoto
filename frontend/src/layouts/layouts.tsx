import { Award, BookOpenCheck, Video, type LucideIcon } from 'lucide-react';
import { Suspense, useEffect, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import Logo from '@/components/Logo';
import { CardGridSkeleton, PageSkeleton } from '@/components/Skeletons';
import SiteFooter from '@/components/SiteFooter';
import SiteNavbar from '@/components/SiteNavbar';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/auth';
import type { Role } from '@/types';

/** Marketing pages: navbar + footer. */
export function SiteLayout() {
  const { pathname, hash } = useLocation();
  // /#live and /#how: scroll to the section once the page has rendered.
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return undefined; }
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); clearInterval(t); } else if (++tries > 20) clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, [pathname, hash]);
  return (
    <>
      <SiteNavbar />
      <main id="main" className={pathname === '/' ? '' : 'mx-auto max-w-page px-6 py-10 sm:py-12'}>
        <Suspense fallback={<div className="mx-auto max-w-page px-6 py-10"><CardGridSkeleton /></div>}><Outlet /></Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

const POINTS: [LucideIcon, string, string][] = [
  [Video, 'Live, instructor-led classes', 'Learn in real time and replay anything you miss.'],
  [BookOpenCheck, 'Quizzes and graded assignments', 'Always know exactly where you stand.'],
  [Award, 'Certificates employers can verify', 'Every certificate has a public verification link.'],
];


function SessionRecovery({ onRetry, message = 'We could not verify your session. Retry the check or sign in again.' }: { onRetry: () => void; message?: string }) {
  return (
    <div role="alert" className="mb-5 rounded-large border border-warning/50 bg-warning/10 p-4 text-sm text-foreground">
      <p>{message}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="rounded-lg border border-warning px-3 py-2 font-medium" onClick={onRetry}>Retry session check</button>
        <Link to="/login" className="font-medium underline underline-offset-2">Sign in again</Link>
      </div>
    </div>
  );
}

/** Login / register / reset: split-screen, signed-in visitors are sent to their dashboard. */
export function AuthLayout() {
  const { user, status, retrySession, sessionError } = useAuth();
  if (status === 'authenticated' && user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] ">
      <aside className="surface-brand hidden flex-col justify-between p-12 lg:flex">
        <Logo href="/" light />
        <div className="max-w-md space-y-9">
          <h2 className="display text-4xl">Build job-ready skills with courses that are taught live.</h2>
          <ul className="space-y-5">
            {POINTS.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10"><Icon size={20} /></span>
                <span><span className="block font-semibold">{title}</span><span className="block text-sm leading-6 text-white/70">{text}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Techvoto</p>
      </aside>
      <main id="main" className="relative grid place-items-center bg-background px-5 py-12">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <div className="panel p-6 sm:p-10">
            {status === 'unknown' && <SessionRecovery message={sessionError instanceof Error ? sessionError.message : undefined} onRetry={() => { void retrySession(); }} />}
            <Suspense fallback={null}><Outlet /></Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Private pages. Replaces Next's middleware: signed-out visitors go to /login and come back afterwards. */
export function AppLayout() {
  const { user, status, retrySession, sessionError } = useAuth();
  const { pathname, search } = useLocation();
  if (status === 'loading') return <div className="mx-auto max-w-page p-6"><PageSkeleton /></div>;
  if (status === 'unknown') return <div className="mx-auto max-w-page p-6"><SessionRecovery message={sessionError instanceof Error ? sessionError.message : undefined} onRetry={() => { void retrySession(); }} /></div>;
  if (status === 'unauthenticated' || !user) return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />;
  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}><Outlet /></Suspense>
    </AppShell>
  );
}

/** Role gate nested inside AppLayout; other roles are sent to the dashboard. */
export function RoleGate({ roles, children }: { roles: Role[]; children?: ReactNode }) {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const ok = !!user && roles.includes(user.role);
  useEffect(() => { if (status === 'authenticated' && user && !ok) navigate('/dashboard', { replace: true }); }, [status, user, ok, navigate]);
  return status === 'authenticated' && ok ? <>{children ?? <Outlet />}</> : <PageSkeleton />;
}
