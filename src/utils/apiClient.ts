async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `So'rov muvaffaqiyatsiz tugadi (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // javob JSON emas — standart xabar bilan qolamiz
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiGet = <T,>(path: string): Promise<T> => request<T>(path);

export const apiPost = <T,>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiPut = <T,>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiPatch = <T,>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiDelete = <T,>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' });
