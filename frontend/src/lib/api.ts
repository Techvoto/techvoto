import { clearCsrfToken, getCsrfToken, setCsrfToken } from './csrf';
import type { Listish } from '@/types';
import { createApiClient, ClientApiError } from './api-client.mjs';

/** Empty = same origin (Vite dev proxy or a production /api reverse proxy). */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');


export function errorMessage(err: unknown): string {
  const e = err as { data?: unknown; message?: string } | null | undefined;
  const data = e?.data;
  if (!data) return e?.message || 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  const d = data as Record<string, unknown>;
  if (d.detail) return String(d.detail);
  const first = Object.entries(d)[0];
  if (!first) return 'Something went wrong. Please try again.';
  const [field, msg] = first;
  const text = Array.isArray(msg) ? msg[0] : typeof msg === 'object' ? JSON.stringify(msg) : msg;
  return field === 'non_field_errors' ? String(text) : `${field.replace(/_/g, ' ')}: ${String(text)}`;
}

export class ApiError extends ClientApiError {}

const client = createApiClient({
  base: API_BASE,
  fetchImpl: (...args: Parameters<typeof fetch>) => fetch(...args),
  getCachedCsrf: getCsrfToken,
  setCachedCsrf: setCsrfToken,
  clearCachedCsrf: clearCsrfToken,
  locks: typeof navigator !== 'undefined'
    ? (navigator as Navigator & { locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> } }).locks
    : undefined,
});

export const raw = client.raw;
export const api = client.api;
export const refreshCsrfAfterAuthentication = client.reacquireCsrf;
export const fetcher = <T = unknown>(path: string) => api(path) as Promise<T>;
export const list = <T>(data: Listish<T> | null | undefined): T[] => (Array.isArray(data) ? data : data?.results ?? []);

/** Permission-checked API files use the same HttpOnly-cookie session. */
export async function downloadFile(fileLink: string, fallbackName = 'download') {
  const i = fileLink.indexOf('/api/');
  const res = i >= 0 ? await raw(fileLink.slice(i + 5)) : await fetch(fileLink);
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') ?? '';
  const m = /filename\\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  const base = fileLink.split('?')[0].split('/').filter(Boolean).pop();
  const name = m ? decodeURIComponent(m[1]) : base ? decodeURIComponent(base) : fallbackName;
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

