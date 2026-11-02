import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient } from '../src/lib/api-client.mjs';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json' },
});
function locks() {
  let tail = Promise.resolve();
  return { request: async (_name, fn) => {
    const before = tail; let release;
    tail = new Promise((resolve) => { release = resolve; });
    await before;
    try { return await fn(); } finally { release(); }
  } };
}
function fixture(fetchImpl, lockManager = locks()) {
  let csrf = null;
  const client = createApiClient({
    base: 'https://api.example.test/', fetchImpl,
    getCachedCsrf: () => csrf,
    setCachedCsrf: (v) => { csrf = v; },
    clearCachedCsrf: () => { csrf = null; },
    locks: lockManager,
  });
  return { client, getCsrf: () => csrf };
}

test('unsafe API call acquires CSRF, sends matching header and includes cookies', async () => {
  const calls = [];
  const { client } = fixture(async (url, init) => {
    calls.push({ url, init });
    if (String(url).endsWith('/auth/csrf/')) return json({ csrfToken: 'masked-1' });
    return json({ ok: true });
  });
  assert.deepEqual(await client.api('courses/enroll/', { method: 'POST', body: { course: 'abc' } }), { ok: true });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/api\/auth\/csrf\/$/);
  assert.equal(calls[0].init.credentials, 'include');
  assert.equal(calls[1].init.credentials, 'include');
  assert.equal(calls[1].init.headers.get('X-CSRFToken'), 'masked-1');
  assert.equal(calls[1].init.headers.get('content-type'), 'application/json');
  assert.equal(calls[1].init.body, JSON.stringify({ course: 'abc' }));
});

test('login CSRF reacquisition clears stale token and obtains a new masked token', async () => {
  let csrfCalls = 0;
  const { client, getCsrf } = fixture(async (url) => {
    if (String(url).endsWith('/auth/csrf/')) return json({ csrfToken: `masked-${++csrfCalls}` });
    return json({ user: { id: 7 } });
  });
  await client.api('auth/login/', { method: 'POST', body: { email: 'a@b.test', password: 'secret' }, auth: false });
  assert.equal(getCsrf(), 'masked-1');
  assert.equal(await client.reacquireCsrf(), true);
  assert.equal(getCsrf(), 'masked-2');
});

test('expired access probes session, rotates refresh cookie, and retries original request once', async () => {
  const calls = [];
  let protectedHits = 0;
  const { client } = fixture(async (url, init) => {
    const path = String(url).replace('https://api.example.test/api/', '');
    calls.push({ path, method: init.method });
    if (path === 'private/data/') return ++protectedHits === 1 ? json({ detail: 'expired' }, 401) : json({ value: 42 });
    if (path === 'auth/me/') return json({ detail: 'expired' }, 401);
    if (path === 'auth/csrf/') return json({ csrfToken: 'csrf' });
    if (path === 'auth/token/refresh/') return new Response(null, { status: 200 });
    throw new Error(`Unexpected ${path}`);
  });
  assert.deepEqual(await client.api('private/data/'), { value: 42 });
  assert.deepEqual(calls.map((c) => c.path), ['private/data/', 'auth/me/', 'auth/csrf/', 'auth/token/refresh/', 'private/data/']);
});

test('refresh 401 is not retried and is returned as the original unauthorized response', async () => {
  const { client } = fixture(async (url) => {
    const path = String(url);
    if (path.endsWith('/auth/me/')) return json({}, 401);
    if (path.endsWith('/auth/token/refresh/')) return json({}, 401);
    return json({}, 401);
  });
  await assert.rejects(client.api('private/data/'), (e) => e.status === 401);
});

test('transient auth probe errors propagate and never call refresh or disguise the 401', async () => {
  const paths = [];
  const { client } = fixture(async (url) => {
    const p = String(url); paths.push(p);
    if (p.endsWith('/auth/me/')) return json({ detail: 'temporarily unavailable' }, 503);
    return json({}, 401);
  });
  await assert.rejects(client.api('private/data/'), (e) => e.status === 503);
  assert.equal(paths.some((p) => p.endsWith('/auth/token/refresh/')), false);
});

test('refresh without Web Locks fails closed instead of racing another tab', async () => {
  let refreshCalls = 0;
  // Model a browser without Web Locks.
  const noLockClient = createApiClient({
    base: '', fetchImpl: async (url) => {
      const p = String(url);
      if (p.endsWith('/auth/me/')) return json({}, 401);
      if (p.endsWith('/auth/token/refresh/')) { refreshCalls += 1; return new Response(null, { status: 200 }); }
      return json({}, 401);
    }, getCachedCsrf: () => 'csrf', setCachedCsrf: () => {}, clearCachedCsrf: () => {}, locks: undefined,
  });
  await assert.rejects(noLockClient.api('private/data/'), /Web Locks support/);
  assert.equal(refreshCalls, 0);
});

test('multipart request keeps browser boundary ownership and sends CSRF', async () => {
  let seen;
  const form = new FormData(); form.set('title', 'hello');
  const { client } = fixture(async (url, init) => {
    if (String(url).endsWith('/auth/csrf/')) return json({ csrfToken: 'form-csrf' });
    seen = init; return json({ ok: true });
  });
  await client.api('upload/', { method: 'POST', form });
  assert.equal(seen.headers.get('X-CSRFToken'), 'form-csrf');
  assert.equal(seen.headers.has('content-type'), false);
  assert.equal(seen.body, form);
});

test('a late 401 observes the already-refreshed session and does not rotate twice', async () => {
  let authenticated = false;
  let refreshCount = 0;
  let protectedHits = 0;
  const { client } = fixture(async (url) => {
    const p = String(url);
    if (p.endsWith('/private/data/')) {
      protectedHits += 1;
      if (protectedHits === 1) return json({}, 401);
      return json({ ok: true });
    }
    if (p.endsWith('/auth/me/')) return authenticated ? json({ id: 1 }) : json({}, 401);
    if (p.endsWith('/auth/csrf/')) return json({ csrfToken: 'csrf' });
    if (p.endsWith('/auth/token/refresh/')) { refreshCount += 1; authenticated = true; return new Response(null, { status: 200 }); }
    throw new Error(`Unexpected ${p}`);
  });
  assert.deepEqual(await client.api('private/data/'), { ok: true });
  assert.equal(refreshCount, 1);
});

test('concurrent requests in one tab share the in-flight refresh', async () => {
  let authenticated = false;
  let refreshCount = 0;
  const { client } = fixture(async (url) => {
    const p = String(url);
    if (p.endsWith('/private/a/') || p.endsWith('/private/b/')) return authenticated ? json({ ok: true }) : json({}, 401);
    if (p.endsWith('/auth/me/')) return authenticated ? json({ id: 1 }) : json({}, 401);
    if (p.endsWith('/auth/csrf/')) return json({ csrfToken: 'csrf' });
    if (p.endsWith('/auth/token/refresh/')) {
      refreshCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      authenticated = true;
      return new Response(null, { status: 200 });
    }
    throw new Error(`Unexpected ${p}`);
  });
  const results = await Promise.all([client.api('private/a/'), client.api('private/b/')]);
  assert.deepEqual(results, [{ ok: true }, { ok: true }]);
  assert.equal(refreshCount, 1);
});
