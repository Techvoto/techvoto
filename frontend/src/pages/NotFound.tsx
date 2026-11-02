import { Link } from 'react-router-dom';
import { useTitle } from '@/lib/useTitle';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-1 text-3xl font-semibold">We could not find that page</h1>
        <p className="mt-2 text-default-500">The link may be broken, or the page may have been moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Go home</Link>
          <Link to="/courses" className="rounded-lg border border-default-300 px-4 py-2 text-sm font-medium hover:bg-default-100">Browse courses</Link>
        </div>
      </div>
    </div>
  );
}
