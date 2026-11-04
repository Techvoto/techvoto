import { Link } from 'react-router-dom';
import { useTitle } from '@/lib/useTitle';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="glow grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="max-w-md">
        <p className="display text-8xl text-primary/90">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">We could not find that page</h1>
        <p className="mt-3 text-default-500">The link may be broken, or the page may have been moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-small transition hover:opacity-90">Go home</Link>
          <Link to="/courses" className="rounded-lg border border-default-300 bg-content1 px-5 py-2.5 text-sm font-semibold transition hover:bg-default-100">Browse courses</Link>
        </div>
      </div>
    </div>
  );
}
