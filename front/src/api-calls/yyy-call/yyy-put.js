import { getAuthHeaders } from '../../utils/helpers/passport';

const API_URL = process.env.REACT_APP_API_URL;

export async function putYyy(id, payload) {
  const response = await fetch(`${API_URL}/yyy/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar yyy');
  }

  return response.json();
}
