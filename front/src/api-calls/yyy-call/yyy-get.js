import { getAuthHeaders } from '../../utils/helpers/passport';

const API_URL = process.env.REACT_APP_API_URL;

export async function getYyy(id) {
  const response = await fetch(`${API_URL}/yyy/${id}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener yyy');
  }

  return response.json();
}
