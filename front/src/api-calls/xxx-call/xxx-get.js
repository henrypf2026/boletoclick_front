const API_URL = process.env.REACT_APP_API_URL;

export async function getXxx() {
  const response = await fetch(`${API_URL}/xxx`);

  if (!response.ok) {
    throw new Error('Error al obtener xxx');
  }

  return response.json();
}
