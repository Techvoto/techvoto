export const naira = (kobo?: number | null) =>
  !kobo ? 'Free' : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);

export const dateTime = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '';
export const dateOnly = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(iso)) : '';

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const units: [string, number][] = [['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [name, secs] of units) if (s >= secs) { const n = Math.floor(s / secs); return `${n} ${name}${n > 1 ? 's' : ''} ago`; }
  return 'just now';
}

export function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith('/embed/')) return url;
    }
  } catch { /* not a URL */ }
  return null;
}

export const toLocalInput = (iso?: string | null) => {
  const d = iso ? new Date(iso) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
