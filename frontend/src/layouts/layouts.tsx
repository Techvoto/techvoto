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
      <main id="main" className="mx-auto max-w-page px-6 py-10">
        <Suspense fallback={<CardGridSkeleton />}><Outlet /></Suspense>
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
    <div role="alert" className="mb-5 rounded-xl border border-warning/50 bg-warning/10 p-4 text-sm text-foreground">
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
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1f3a] p-12 text-white lg:flex">
        <div className="relative z-10"><Logo href="/" /></div>
        <div className="relative z-10 max-w-md space-y-8">
          <h2 className="text-3xl font-semibold leading-tight">Build job-ready skills with courses that are taught live.</h2>
          <ul className="space-y-5">
            {POINTS.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10"><Icon size={20} /></span>
                <span><span className="block font-medium">{title}</span><span className="block text-sm text-white/70">{text}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/50">© {new Date().getFullYear()} Techvoto</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full border border-white/10" aria-hidden="true" />
      </aside>
      <main id="main" className="relative grid place-items-center bg-content1 px-5 py-12">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          {status === 'unknown' && <SessionRecovery message={sessionError instanceof Error ? sessionError.message : undefined} onRetry={() => { void retrySession(); }} />}
          <Suspense fallback={null}><Outlet /></Suspense>
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
  if (status === 'unknown') return <div className="mx-auto max-w-page p-6"><SessionRecovery onRetry={() => { void retrySession(); }} /></div>;
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
