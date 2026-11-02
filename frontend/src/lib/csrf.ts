// Django owns the access and refresh tokens in HttpOnly cookies. The CSRF token
// is intentionally kept in memory only and is sent in X-CSRFToken on unsafe requests.
let csrfToken: string | null = null;

export const getCsrfToken = () => csrfToken;
export const setCsrfToken = (token: string) => { csrfToken = token; };
export const clearCsrfToken = () => { csrfToken = null; };
