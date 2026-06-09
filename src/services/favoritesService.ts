export interface FavoriteEvent {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    eventDate: string;
    venue?: { name: string; city?: string };
    category?: { name: string };
    posterUrl?: string;
  };
}

export const favoritesService = {
  async toggle(eventId: string, token: string): Promise<{ added: boolean; message: string }> {
    const res = await fetch(`/api/backend/favorites/${eventId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al actualizar favorito');
    return res.json();
  },

  async getAll(token: string): Promise<FavoriteEvent[]> {
    const res = await fetch('/api/backend/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
  },
};
