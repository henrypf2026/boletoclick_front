import { api } from '@/lib/apiClient';
import { getCategoryImage } from '@/lib/categoryImages';
import { teams, type Event, type Zone } from '@/mocks/events';

interface ApiVenue {
  id: string;
  name: string;
  address?: string;
  city: string;
  capacity?: number;
  imgUrl?: string | null;
  latitude?: number | string;
  longitude?: number | string;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

interface ApiTicketType {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  zone?: string | null;
}

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  posterUrl?: string | null;
  venue?: ApiVenue | null;
  category?: ApiCategory | null;
  ticketTypes?: ApiTicketType[] | null;
}

export interface CategoryOption {
  id: string;
  label: string;
}

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)';
const FEATURED_BADGES = new Set(['Preventa', 'Alta demanda', 'Clasico', 'Clásico', 'F1', 'Mundial']);

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function splitEventDate(isoDate: string): { date: string; time: string } {
  const d = new Date(isoDate);
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

function parseDescription(description = ''): { subtitle: string; badge: string | null } {
  const parts = description.split('. ').filter(Boolean);
  const badgePart = parts.find((part) => part.startsWith('Etiqueta: '));
  const badge = badgePart ? badgePart.replace('Etiqueta: ', '') : null;
  const subtitle = badgePart
    ? parts.filter((p) => p !== badgePart).join('. ')
    : parts[0] || description;

  return { subtitle: subtitle || description, badge };
}

function inferTeamId(title = ''): string {
  const lower = title.toLowerCase();
  for (const team of teams) {
    if (team.id === 'all') continue;
    if (lower.includes(team.name.toLowerCase())) return team.id;
  }
  return 'all';
}

function mapApiEvent(apiEvent: ApiEvent): Event {
  const { date, time } = splitEventDate(apiEvent.eventDate);
  const { subtitle, badge } = parseDescription(apiEvent.description);
  const venue = apiEvent.venue ?? null;
  const ticketTypes = apiEvent.ticketTypes ?? [];
  const prices = ticketTypes
    .map((ticket) => Number(ticket.price))
    .filter((n) => !Number.isNaN(n));
  const categorySlug = apiEvent.category?.slug ?? 'otros';
  const categoryImage = getCategoryImage(categorySlug, apiEvent.id);

  const zones: Zone[] = ticketTypes.map((ticket) => ({
    id: ticket.zone || ticket.id,
    name: ticket.name,
    price: Number(ticket.price),
    available: ticket.stock,
  }));

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    subtitle,
    category: categorySlug,
    teamId: inferTeamId(apiEvent.title),
    venue: venue?.name ?? 'Por confirmar',
    city: venue?.city ?? '',
    address: venue?.address ?? undefined,
    capacity: venue?.capacity ?? undefined,
    coordinates: {
      lat: Number(venue?.latitude) || 19.4326,
      lng: Number(venue?.longitude) || -99.1332,
    },
    date,
    time,
    priceFrom: prices.length ? Math.min(...prices) : 0,
    featured: badge ? FEATURED_BADGES.has(badge) : false,
    badge,
    imageGradient: DEFAULT_GRADIENT,
    zones,
    posterUrl: apiEvent.posterUrl || categoryImage || venue?.imgUrl || null,
    fallbackImageUrl: venue?.imgUrl || null,
  };
}

export const eventService = {
  async getEvents(): Promise<Event[]> {
    const data = await api.get<ApiEvent[]>('/events');
    return Array.isArray(data) ? data.map(mapApiEvent) : [];
  },

  async getEventById(id: string): Promise<Event | null> {
    try {
      const data = await api.get<ApiEvent>(`/events/${id}`);
      return data ? mapApiEvent(data) : null;
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<CategoryOption[]> {
    const data = await api.get<ApiCategory[]>('/categories');
    if (!Array.isArray(data)) return [];
    return data
      .filter((category) => category?.slug && category?.name)
      .map((category) => ({ id: category.slug, label: category.name }));
  },
};
