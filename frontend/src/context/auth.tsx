import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { api, ApiError, refreshCsrfAfterAuthentication } from '@/lib/api';
import { clearCsrfToken } from '@/lib/csrf';
import { completeAuthentication, completeLogout, restoreSession, sessionState, type SessionState } from '@/lib/auth-session.mjs';
import type { User } from '@/types';

export interface RegisterPayload { first_name: string; last_name: string; email: string; password: string; password2: string }

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  status: SessionState;
  sessionError: unknown;
  retrySession: () => Promise<unknown>;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = '__session';
interface Session { user: User | null }

async function loadSession(): Promise<Session> {
  // HttpOnly cookies cannot be inspected by JavaScript. Ask the backend to
  // validate the current access cookie; api() refreshes it once if necessary.
  return restoreSession(() => api<User>('auth/me/')); // Only a confirmed API 401 means signed out.
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<Session>(SESSION_KEY, loadSession, {
    revalidateOnFocus: false,
    errorRetryCount: 3,
    errorRetryInterval: 3000,
  });
  const { mutate: globalMutate } = useSWRConfig();
  const navigate = useNavigate();
  const user = data?.user ?? null;
  const status = sessionState({ user, hasData: data !== undefined, loading: isLoading, error });

  const login = useCallback(async (email: string, password: string) => {
    let d: { user: User };
    try { d = await api<{ user: User }>('auth/login/', { method: 'POST', body: { email, password }, auth: false }); }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) throw new ApiError(401, { detail: 'Incorrect email or password.' });
      throw e;
    }
    return completeAuthentication({
      user: d.user,
      refreshCsrf: refreshCsrfAfterAuthentication,
      clearCache: () => globalMutate(() => true, undefined, { revalidate: false }),
      setSession: (session) => mutate(session, false),
    });
  }, [globalMutate, mutate]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const d = await api<{ user: User }>('auth/register/', { method: 'POST', body: payload, auth: false });
    return completeAuthentication({
      user: d.user,
      refreshCsrf: refreshCsrfAfterAuthentication,
      clearCache: () => globalMutate(() => true, undefined, { revalidate: false }),
      setSession: (session) => mutate(session, false),
    });
  }, [globalMutate, mutate]);

  const logout = useCallback(async () => {
    await completeLogout({
      logoutRequest: () => api('auth/logout/', { method: 'POST' }), // Backend blacklists refresh cookie and clears auth cookies.
      clearCsrf: clearCsrfToken,
      clearCache: () => globalMutate(() => true, undefined, { revalidate: false }),
      setSession: (session) => mutate(session, false),
      navigate,
    });
  }, [globalMutate, mutate, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading: status === 'loading' || status === 'unknown', status, sessionError: error, retrySession: () => mutate(), login, register, logout, refresh: () => mutate() }),
    [user, status, error, login, register, logout, mutate],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
