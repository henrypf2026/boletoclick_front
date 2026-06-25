import { api } from '@/lib/apiClient';

export interface ApiVenueEvent {
  id: string;
  title: string;
  eventDate: string;
  status: string;
}

export interface ApiVenue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  imgUrl: string | null;
  latitude: number | string;
  longitude: number | string;
  municipality: { name: string } | null;
  events: ApiVenueEvent[];
}

export const venueService = {
  async getAll(): Promise<ApiVenue[]> {
    const data = await api.get<ApiVenue[]>('/venues');
    return Array.isArray(data) ? data : [];
  },

  async getByIdWithEvents(id: string): Promise<ApiVenue | null> {
    const venues = await venueService.getAll();
    return venues.find((v) => v.id === id) ?? null;
  },
};
