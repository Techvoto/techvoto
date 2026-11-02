import { coordinatedRefresh, csrfHeader } from './auth-session.mjs';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function formatApiError(status, data) {
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);
  const first = Object.entries(data)[0];
  if (!first) return 'Something went wrong. Please try again.';
  const [field, value] = first;
  const message = Array.isArray(value) ? value[0] : typeof value === 'object' ? JSON.stringify(value) : value;
  return field === 'non_field_errors' ? String(message) : `${field.replace(/_/g, ' ')}: ${String(message)}`;
}

export class ClientApiError extends Error {
  constructor(status, data) {
    super(formatApiError(status, data) || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

/** Injectable transport used by the browser API module and integration tests. */
export function createApiClient({ base = '', fetchImpl, getCachedCsrf, setCachedCsrf, clearCachedCsrf, locks }) {
  const endpoint = (path) => `${base.replace(/\/$/, '')}/api/${path.replace(/^\/+/, '')}`;
  let csrfRequest = null;
  let refreshing = null;

  async function getCsrf() {
    const cached = getCachedCsrf();
    if (cached) return cached;
    if (!csrfRequest) {
      csrfRequest = fetchImpl(endpoint('auth/csrf/'), { credentials: 'include' })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.csrfToken) throw new ClientApiError(res.status, data);
          setCachedCsrf(data.csrfToken);
          return data.csrfToken;
        }).finally(() => { csrfRequest = null; });
    }
    return csrfRequest;
  }

  async function send(path, init = {}) {
    const headers = new Headers(init.headers);
    const method = (init.method ?? 'GET').toUpperCase();
    if (UNSAFE_METHODS.has(method)) {
      const [name, token] = await csrfHeader(getCsrf);
      headers.set(name, token);
    }
    return fetchImpl(endpoint(path), { ...init, headers, credentials: 'include' });
  }

  async function probeSession() {
    const res = await send('auth/me/', { method: 'GET' });
    if (res.ok) return 'authenticated';
    if (res.status === 401) return 'unauthenticated';
    throw new ClientApiError(res.status, await res.json().catch(() => null));
  }

  async function doRefresh() {
    const res = await send('auth/token/refresh/', { method: 'POST' });
    if (res.status === 401) { clearCachedCsrf(); return false; }
    if (!res.ok) throw new ClientApiError(res.status, await res.json().catch(() => null));
    return true;
  }

  function refreshAccess() {
    if (!refreshing) {
      refreshing = coordinatedRefresh({ locks, probeSession, refresh: doRefresh })
        .finally(() => { refreshing = null; });
    }
    return refreshing;
  }

  async function raw(path, init = {}) {
    const res = await send(path, init);
    if (res.status !== 401) return res;
    const refreshed = await refreshAccess();
    return refreshed ? send(path, init) : res;
  }

  async function api(path, { method = 'GET', body, form, auth = true } = {}) {
    const headers = {};
    let payload;
    if (form) payload = form;
    else if (body !== undefined) { headers['content-type'] = 'application/json'; payload = JSON.stringify(body); }
    const init = { method, headers, body: payload };
    const res = auth ? await raw(path, init) : await send(path, init);
    if (res.status === 204 || res.status === 205) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ClientApiError(res.status, data);
    return data;
  }

  async function reacquireCsrf() {
    clearCachedCsrf();
    try { await getCsrf(); return true; }
    catch { clearCachedCsrf(); return false; }
  }

  return { api, raw, send, getCsrf, reacquireCsrf, refreshAccess };
}
