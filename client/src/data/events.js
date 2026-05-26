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

export const events = [
  {
    id: 'evt-001',
    title: 'Cruz Azul vs Chivas',
    subtitle: 'Semifinal Clausura 2026',
    category: 'partidos',
    teamId: 'cruz-azul',
    venue: 'Estadio Ciudad de los Deportes',
    city: 'CDMX',
    date: '2026-05-30',
    time: '21:00',
    priceFrom: 500,
    featured: true,
    badge: 'Preventa',
    imageGradient: 'linear-gradient(135deg, #0046ad 0%, #c8102e 100%)',
    zones: [
      { id: 'general', name: 'General', price: 500, available: 120 },
      { id: 'preferente', name: 'Preferente', price: 950, available: 80 },
      { id: 'vip', name: 'VIP', price: 1850, available: 40 },
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
    date: '2026-06-05',
    time: '19:00',
    priceFrom: 450,
    featured: true,
    badge: 'Alta demanda',
    imageGradient: 'linear-gradient(135deg, #ffcc00 0%, #003087 100%)',
    zones: [
      { id: 'general', name: 'General', price: 450, available: 200 },
      { id: 'preferente', name: 'Preferente', price: 890, available: 90 },
      { id: 'palco', name: 'Palco', price: 2200, available: 20 },
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
    date: '2026-06-06',
    time: '23:00',
    priceFrom: 350,
    featured: false,
    badge: 'Nuevo',
    imageGradient: 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
    zones: [
      { id: 'general', name: 'General', price: 350, available: 300 },
      { id: 'ringside', name: 'Ringside', price: 1200, available: 50 },
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
    date: '2026-06-12',
    time: '20:30',
    priceFrom: 890,
    featured: false,
    badge: 'Agotándose',
    imageGradient: 'linear-gradient(135deg, #7b2cbf 0%, #ff006e 100%)',
    zones: [
      { id: 'gramilla', name: 'Gramilla', price: 890, available: 45 },
      { id: 'preferente', name: 'Preferente', price: 1450, available: 120 },
      { id: 'vip', name: 'VIP', price: 3200, available: 15 },
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
    date: '2026-06-14',
    time: '19:06',
    priceFrom: 280,
    featured: false,
    badge: null,
    imageGradient: 'linear-gradient(135deg, #c8102e 0%, #000000 100%)',
    zones: [
      { id: 'general', name: 'General', price: 280, available: 500 },
      { id: 'preferente', name: 'Preferente', price: 620, available: 150 },
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
    date: '2026-06-19',
    time: '23:00',
    priceFrom: 420,
    featured: false,
    badge: null,
    imageGradient: 'linear-gradient(135deg, #2d6a4f 0%, #ffd166 100%)',
    zones: [
      { id: 'general', name: 'General', price: 420, available: 180 },
      { id: 'premium', name: 'Premium', price: 780, available: 60 },
    ],
  },
];

export function getEventById(id) {
  return events.find((event) => event.id === id);
}

export function formatEventDate(dateStr, timeStr) {
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

export function formatPrice(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}
