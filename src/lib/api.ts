const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface ApiError {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = data.success === false ? data : { success: false, message: data.message || 'Request failed' };
    throw new Error(err.message);
  }
  return data as T;
}

export const apiGet = <T>(path: string, token?: string | null) =>
  api<T>(path, { method: 'GET', token });
export const apiPost = <T>(path: string, body: unknown, token?: string | null) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body), token });
export const apiPatch = <T>(path: string, body: unknown, token?: string | null) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body), token });
export const apiDelete = <T>(path: string, token?: string | null) =>
  api<T>(path, { method: 'DELETE', token });
