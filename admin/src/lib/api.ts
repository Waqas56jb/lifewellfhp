const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lw_admin_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('lw_admin_token', token);
  else localStorage.removeItem('lw_admin_token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json = (await res.json().catch(() => ({}))) as ApiResult<T>;

  if (res.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/login')) {
    setToken(null);
    localStorage.removeItem('lw_admin_user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const fallback =
      res.status === 404
        ? 'Login service is not running. In the server folder run npm run build, then npm start — or use npm run dev.'
        : `Request failed (${res.status})`;
    return {
      success: false,
      message: json.message && json.message !== 'Not found' ? json.message : fallback,
      errors: json.errors,
    };
  }

  return json;
}

export { API_URL };
