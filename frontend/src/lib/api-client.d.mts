export class ClientApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown);
}
export interface ApiClientOptions {
  base?: string;
  fetchImpl: typeof fetch;
  getCachedCsrf: () => string | null;
  setCachedCsrf: (token: string) => void;
  clearCachedCsrf: () => void;
  locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> };
}
export interface ApiOptions {
  method?: string;
  body?: unknown;
  form?: FormData;
  auth?: boolean;
}
export function createApiClient(options: ApiClientOptions): {
  api<T = unknown>(path: string, options?: ApiOptions): Promise<T>;
  raw(path: string, init?: RequestInit): Promise<Response>;
  send(path: string, init?: RequestInit): Promise<Response>;
  getCsrf(): Promise<string>;
  reacquireCsrf(): Promise<boolean>;
  refreshAccess(): Promise<boolean>;
};
