const BASE_URL = '/api/backend';

interface RequestOptions {
  method?: string;
  body?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.slice(0, 80).trim();
    throw new Error(
      res.ok
        ? 'El servidor respondió con un formato inválido'
        : `Error del servidor (${res.status}): ${preview || 'sin detalle'}. ¿Está corriendo el backend en el puerto 3000?`,
    );
  }
}

async function request<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body,
    credentials: 'include',
  });
  const data = await parseJsonResponse<{ message?: string | string[] }>(res);

  if (!res.ok) {
    const message = data.message;
    const text =
      typeof message === 'string'
        ? message
        : Array.isArray(message)
          ? message.join('. ')
          : 'Error en la solicitud';
    throw new Error(text);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
