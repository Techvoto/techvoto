/** Pure helpers shared by the cookie-auth client and dependency-free regression tests. */
export async function reacquireCsrfToken({ clear, get }) {
  clear();
  try {
    await get();
    return true;
  } catch {
    // Leave the cache empty so the next unsafe request retries acquisition.
    clear();
    return false;
  }
}

export function sessionState({ user, hasData, loading, error }) {
  if (user) return 'authenticated';
  // A cached { user: null } is the result of a confirmed 401, even if a later
  // background revalidation failed temporarily.
  if (hasData) return 'unauthenticated';
  if (loading) return 'loading';
  if (error) return 'unknown';
  return 'unauthenticated';
}

/**
 * After an initial 401, acquire the cross-tab lock and check whether another tab
 * has already refreshed the shared HttpOnly cookies before rotating again.
 */
export async function coordinatedRefresh({ locks, probeSession, refresh }) {
  const run = async () => {
    const probe = await probeSession();
    if (probe === 'authenticated') return true;
    if (probe !== 'unauthenticated') {
      throw new Error('Session status is temporarily unknown; refresh was not attempted.');
    }
    return refresh();
  };
  if (!locks?.request) {
    // Fail closed: an unlocked refresh can race another tab and invalidate the
    // shared rotating refresh cookie. Do not pretend this is safe.
    throw new Error('Cross-tab session refresh requires browser Web Locks support. Please sign in again or use a supported browser.');
  }
  return locks.request('techvoto-auth-refresh', run);
}

export async function csrfHeader(getToken) {
  return ['X-CSRFToken', await getToken()];
}

/** A confirmed 401 is signed-out; every other failure remains an error/unknown. */
export async function restoreSession(getCurrentUser) {
  try {
    return { user: await getCurrentUser() };
  } catch (error) {
    if (error && error.status === 401) return { user: null };
    throw error;
  }
}

/** Apply a successful login/register without retaining another account's cache. */
export async function completeAuthentication({ user, refreshCsrf, clearCache, setSession }) {
  await refreshCsrf();
  await clearCache();
  await setSession({ user });
  return user;
}

/** Always clear local identity/cache even if the server logout request fails. */
export async function completeLogout({ logoutRequest, clearCsrf, clearCache, setSession, navigate }) {
  try {
    await logoutRequest();
  } finally {
    clearCsrf();
    await clearCache();
    await setSession({ user: null });
    navigate('/login', { replace: true });
  }
}
