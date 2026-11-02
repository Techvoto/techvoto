/** Only same-site paths are allowed as a post-login destination (no open redirects). */
export const safeNext = (next: string | null | undefined, fallback = '/dashboard') =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
