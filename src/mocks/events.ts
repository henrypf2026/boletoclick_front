export const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'partidos', label: 'Partidos' },
  { id: 'conciertos', label: 'Conciertos' },
  { id: 'mma', label: 'MMA' },
  { id: 'otros', label: 'Otros' },
];

export const teams = [
  { id: 'all', name: 'Todos', emoji: '🎫' },
  { id: 'cruz-azul', name: 'Cruz Azul', emoji: '🔵' },
  { id: 'america', name: 'América', emoji: '🟡' },
  { id: 'chivas', name: 'Chivas', emoji: '🔴' },
  { id: 'pumas', name: 'Pumas', emoji: '🟡' },
];

export interface Zone {
  id: string;
  ticketTypeId: string;
  name: string;
  zone: string;
  price: number;
  available: number;
}

function mockZone(
  id: string,
  name: string,
  price: number,
  available: number,
  tribuna = name,
): Zone {
  return { id, ticketTypeId: id, name, zone: tribuna, price, available };
}

export interface EventCoordinates {
  lat: number;
  lng: number;
}

export interface Event {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  teamId: string;
  venue: string;
  city: string;
  address?: string;
  capacity?: number;
  coordinates: EventCoordinates;
  country: "MX" | "CO" | "AR" | null;
  date: string;
  time: string;
  priceFrom: number;
  featured: boolean;
  badge: string | null;
  imageGradient: string;
  zones: Zone[];
  posterUrl?: string | null;
  fallbackImageUrl?: string | null;
}

export const events: Event[] = [
  {
    id: 'evt-001',
    title: 'Cruz Azul vs Chivas',
    subtitle: 'Semifinal Clausura 2026',
    category: 'partidos',
    teamId: 'cruz-azul',
    venue: 'Estadio Ciudad de los Deportes',
    city: 'CDMX',
    coordinates: { lat: 19.3974, lng: -99.1794 },
    country: 'MX',
    date: '2026-05-30',
    time: '21:00',
    priceFrom: 500,
    featured: true,
    badge: 'Preventa',
    imageGradient: 'linear-gradient(135deg, #0046ad 0%, #c8102e 100%)',
    zones: [
      mockZone('general', 'General', 500, 120, 'Tribuna Norte'),
      mockZone('preferente', 'Preferente', 950, 80, 'Tribuna Sur'),
      mockZone('vip', 'VIP', 1850, 40, 'Palco VIP'),
    ],
  },
  {
    id: 'evt-002',
    title: 'América vs Pumas',
    subtitle: 'Clásico Capitalino',
    category: 'partidos',
    teamId: 'america',
    venue: 'Estadio Azteca',
    city: 'CDMX',
    coordinates: { lat: 19.3029, lng: -99.1506 },
    country: 'MX',
    date: '2026-06-05',
    time: '19:00',
    priceFrom: 450,
    featured: true,
    badge: 'Alta demanda',
    imageGradient: 'linear-gradient(135deg, #ffcc00 0%, #003087 100%)',
    zones: [
      mockZone('general', 'General', 450, 200, 'Tribuna Oriente'),
      mockZone('preferente', 'Preferente', 890, 90, 'Tribuna Poniente'),
      mockZone('palco', 'Palco', 2200, 20, 'Palco Presidencial'),
    ],
  },
  {
    id: 'evt-003',
    title: 'EMPIRE MMA 15',
    subtitle: 'Noche de campeonato',
    category: 'mma',
    teamId: 'all',
    venue: 'Arena CDMX',
    city: 'CDMX',
    coordinates: { lat: 19.4326, lng: -99.1332 },
    country: 'MX',
    date: '2026-06-06',
    time: '23:00',
    priceFrom: 350,
    featured: false,
    badge: 'Nuevo',
    imageGradient: 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
    zones: [
      mockZone('general', 'General', 350, 300, 'Grada General'),
      mockZone('ringside', 'Ringside', 1200, 50, 'Ringside'),
    ],
  },
  {
    id: 'evt-004',
    title: 'Bad Bunny World Tour',
    subtitle: 'Solo en México',
    category: 'conciertos',
    teamId: 'all',
    venue: 'Foro Sol',
    city: 'CDMX',
    coordinates: { lat: 19.4052, lng: -99.0907 },
    country: 'MX',
    date: '2026-06-12',
    time: '20:30',
    priceFrom: 890,
    featured: false,
    badge: 'Agotándose',
    imageGradient: 'linear-gradient(135deg, #7b2cbf 0%, #ff006e 100%)',
    zones: [
      mockZone('gramilla', 'Gramilla', 890, 45, 'Campo'),
      mockZone('preferente', 'Preferente', 1450, 120, 'Tribuna Alta'),
      mockZone('vip', 'VIP', 3200, 15, 'VIP Lounge'),
    ],
  },
  {
    id: 'evt-005',
    title: 'Chivas vs Atlas',
    subtitle: 'Clásico Tapatío',
    category: 'partidos',
    teamId: 'chivas',
    venue: 'Estadio Akron',
    city: 'Guadalajara',
    coordinates: { lat: 20.6818, lng: -103.4624 },
    country: 'MX',
    date: '2026-06-14',
    time: '19:06',
    priceFrom: 280,
    featured: false,
    badge: null,
    imageGradient: 'linear-gradient(135deg, #c8102e 0%, #000000 100%)',
    zones: [
      mockZone('general', 'General', 280, 500, 'Tribuna Popular'),
      mockZone('preferente', 'Preferente', 620, 150, 'Tribuna Preferente'),
    ],
  },
  {
    id: 'evt-006',
    title: 'Festival Reggae Invasion',
    subtitle: 'Protoje meets Tippy I',
    category: 'otros',
    teamId: 'all',
    venue: 'Teatro Metropolitan',
    city: 'CDMX',
    coordinates: { lat: 19.43, lng: -99.14 },
    country: 'MX',
    date: '2026-06-19',
    time: '23:00',
    priceFrom: 420,
    featured: false,
    badge: null,
    imageGradient: 'linear-gradient(135deg, #2d6a4f 0%, #ffd166 100%)',
    zones: [
      mockZone('general', 'General', 420, 180, 'Platea Baja'),
      mockZone('premium', 'Premium', 780, 60, 'Platea Alta'),
    ],
  },
];

export function getEventById(id: string): Event | undefined {
  return events.find((event) => event.id === id);
}

export function formatEventDate(dateStr: string, timeStr: string) {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
    weekday: date.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', ''),
    full: date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: timeStr,
  };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}
