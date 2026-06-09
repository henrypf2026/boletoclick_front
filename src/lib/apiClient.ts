const BASE_URL = '/api/backend';

interface RequestOptions {
  method?: string;
  body?: string;
  token?: string;
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
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body });
  const data = await parseJsonResponse<{ message?: string }>(res);

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
  get: <T>(path: string, token?: string) =>
    request<T>(path, { token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), token }),
};
