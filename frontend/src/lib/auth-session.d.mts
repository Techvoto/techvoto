export type SessionState = 'loading' | 'authenticated' | 'unauthenticated' | 'unknown';
export function reacquireCsrfToken(handlers: { clear: () => void; get: () => Promise<string> }): Promise<boolean>;
export function sessionState(input: { user: unknown; hasData?: boolean; loading: boolean; error: unknown }): SessionState;
export function csrfHeader(getToken: () => Promise<string>): Promise<[string, string]>;
export function coordinatedRefresh(input: {
  locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> };
  probeSession: () => Promise<'authenticated' | 'unauthenticated' | 'unknown'>;
  refresh: () => Promise<boolean>;
}): Promise<boolean>;
export function restoreSession<T>(getCurrentUser: () => Promise<T>): Promise<{ user: T | null }>;
export function completeAuthentication<T>(input: { user: T; refreshCsrf: () => Promise<unknown>; clearCache: () => Promise<unknown>; setSession: (session: { user: T }) => Promise<unknown> }): Promise<T>;
export function completeLogout(input: { logoutRequest: () => Promise<unknown>; clearCsrf: () => void; clearCache: () => Promise<unknown>; setSession: (session: { user: null }) => Promise<unknown>; navigate: (path: string, options: { replace: boolean }) => void }): Promise<void>;
