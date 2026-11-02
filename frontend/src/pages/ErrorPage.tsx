import { Button } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';
import { Link, useRouteError } from 'react-router-dom';

/** Router-level error boundary (replaces app/error.js and global-error.js). */
export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div className="max-w-md">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger"><AlertTriangle size={24} /></span>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-default-500">An unexpected error occurred. You can try again, or head back to the home page.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button color="primary" onPress={() => window.location.reload()}>Try again</Button>
          <Button as={Link} to="/" variant="bordered">Go home</Button>
        </div>
      </div>
    </div>
  );
}
