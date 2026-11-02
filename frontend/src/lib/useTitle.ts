import { useEffect } from 'react';

/** Replaces Next's `metadata.title`. */
export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Techvoto` : 'Techvoto | Learn in-demand tech skills';
  }, [title]);
}
