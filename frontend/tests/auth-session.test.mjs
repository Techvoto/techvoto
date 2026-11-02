import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completeAuthentication,
  completeLogout,
  coordinatedRefresh,
  csrfHeader,
  reacquireCsrfToken,
  restoreSession,
  sessionState,
} from '../src/lib/auth-session.mjs';

function webLockManager() {
  let tail = Promise.resolve();
  return {
    request: async (_name, callback) => {
      const previous = tail;
      let release;
      tail = new Promise((resolve) => { release = resolve; });
      await previous;
      try { return await callback(); } finally { release(); }
    },
  };
}

test('login completion reacquires CSRF before setting the authenticated session', async () => {
  const events = [];
  const user = { id: 1, email: 'one@example.test' };
  await completeAuthentication({
    user,
    refreshCsrf: async () => events.push('csrf'),
    clearCache: async () => events.push('cache'),
    setSession: async (session) => events.push(session.user.id),
  });
  assert.deepEqual(events, ['csrf', 'cache', 1]);
});

test('registration completion uses the same CSRF and cache isolation sequence', async () => {
  const events = [];
  const user = { id: 2, email: 'new@example.test' };
  await completeAuthentication({
    user,
    refreshCsrf: async () => events.push('csrf-reacquired'),
    clearCache: async () => events.push('cache-cleared'),
    setSession: async (session) => events.push(`session-${session.user.id}`),
  });
  assert.deepEqual(events, ['csrf-reacquired', 'cache-cleared', 'session-2']);
});

test('page reload restores a valid cookie session', async () => {
  const user = { id: 3 };
  assert.deepEqual(await restoreSession(async () => user), { user });
  assert.equal(sessionState({ user, loading: false, error: null }), 'authenticated');
});

test('expired access cookie triggers refresh only after auth/me confirms 401', async () => {
  let refreshed = 0;
  const result = await coordinatedRefresh({
    locks: webLockManager(),
    probeSession: async () => 'unauthenticated',
    refresh: async () => { refreshed += 1; return true; },
  });
  assert.equal(result, true);
  assert.equal(refreshed, 1);
});

test('refresh rotation: late 401 in another tab reuses the rotated cookie session', async () => {
  const locks = webLockManager();
  let authenticated = false;
  let refreshCount = 0;
  const refresh = () => coordinatedRefresh({
    locks,
    probeSession: async () => authenticated ? 'authenticated' : 'unauthenticated',
    refresh: async () => { refreshCount += 1; authenticated = true; return true; },
  });
  const first = await refresh();
  const second = await refresh(); // Represents a 401 delivered after the first tab completed rotation.
  assert.equal(first, true);
  assert.equal(second, true);
  assert.equal(refreshCount, 1);
});

test('CSRF invalidation clears the old token and reacquires a new masked token', async () => {
  let token = 'old-masked-token';
  const events = [];
  const ok = await reacquireCsrfToken({
    clear: () => { events.push('clear'); token = null; },
    get: async () => { events.push('fetch-csrf'); token = 'new-masked-token'; return token; },
  });
  assert.equal(ok, true);
  assert.equal(token, 'new-masked-token');
  const [header, value] = await csrfHeader(async () => token); // next unsafe request reads the reacquired token
  assert.equal(header, 'X-CSRFToken');
  assert.equal(value, 'new-masked-token');
  assert.deepEqual(events, ['clear', 'fetch-csrf']);
});

test('logout clears local session/cache even when the server request fails', async () => {
  const events = [];
  await assert.rejects(completeLogout({
    logoutRequest: async () => { events.push('request'); throw new Error('offline'); },
    clearCsrf: () => events.push('csrf-clear'),
    clearCache: async () => events.push('cache-clear'),
    setSession: async (session) => events.push(session.user),
    navigate: (path) => events.push(path),
  }), /offline/);
  assert.deepEqual(events, ['request', 'csrf-clear', 'cache-clear', null, '/login']);
});

test('account switching clears previous user cache before installing the next user', async () => {
  const events = [];
  await completeAuthentication({
    user: { id: 22 },
    refreshCsrf: async () => events.push('csrf'),
    clearCache: async () => events.push('old-user-cache-cleared'),
    setSession: async (session) => events.push(`user-${session.user.id}`),
  });
  assert.deepEqual(events, ['csrf', 'old-user-cache-cleared', 'user-22']);
});

test('temporary API outages do not become unauthenticated sessions', async () => {
  for (const status of [429, 500, 502, 503]) {
    await assert.rejects(restoreSession(async () => { throw Object.assign(new Error('temporary'), { status }); }), /temporary/);
    assert.equal(sessionState({ user: null, hasData: false, loading: false, error: new Error('temporary') }), 'unknown');
  }
  await assert.rejects(restoreSession(async () => { throw new TypeError('network down'); }), /network down/);
  assert.deepEqual(await restoreSession(async () => { throw Object.assign(new Error('expired'), { status: 401 }); }), { user: null });
});

test('simultaneous unauthorized tabs serialize refresh and refresh only once', async () => {
  const locks = webLockManager();
  let authenticated = false;
  let refreshCount = 0;
  const attempt = () => coordinatedRefresh({
    locks,
    probeSession: async () => authenticated ? 'authenticated' : 'unauthenticated',
    refresh: async () => {
      refreshCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      authenticated = true;
      return true;
    },
  });
  const results = await Promise.all([attempt(), attempt()]);
  assert.deepEqual(results, [true, true]);
  assert.equal(refreshCount, 1);
});

test('transient failure during the post-401 probe does not rotate or log out', async () => {
  let refreshCount = 0;
  await assert.rejects(coordinatedRefresh({
    locks: webLockManager(),
    probeSession: async () => { throw Object.assign(new Error('gateway unavailable'), { status: 502 }); },
    refresh: async () => { refreshCount += 1; return true; },
  }), /gateway unavailable/);
  assert.equal(refreshCount, 0);
});

test('a previously confirmed signed-out session stays signed out through a failed revalidation', () => {
  assert.equal(sessionState({ user: null, hasData: true, loading: false, error: new Error('gateway') }), 'unauthenticated');
});
