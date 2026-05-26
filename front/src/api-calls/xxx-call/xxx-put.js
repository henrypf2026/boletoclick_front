import { getAuthHeaders } from '../../utils/helpers/passport';

const API_URL = process.env.REACT_APP_API_URL;

export async function putXxx(payload) {
  const response = await fetch(`${API_URL}/xxx`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar xxx');
  }

  return response.json();
}
