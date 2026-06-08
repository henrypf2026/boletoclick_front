export interface TicketQrData {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  city?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  date: string;
  time: string;
  zone: string;
  quantity: number;
  total: number;
  purchasedAt: string;
}

function toBase64Url(text: string): string {
  return btoa(unescape(encodeURIComponent(text)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(token: string): string {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeTicketQrData(data: TicketQrData): string {
  return toBase64Url(JSON.stringify(data));
}

export function decodeTicketQrData(token: string): TicketQrData | null {
  try {
    return JSON.parse(fromBase64Url(token)) as TicketQrData;
  } catch {
    return null;
  }
}

/** Base URL accesible desde el celular al escanear el QR. */
export function getQrPublicBaseUrl(fallbackOrigin = ''): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;

  const origin =
    fallbackOrigin ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (origin && !isLocalHost(origin)) {
    return origin;
  }

  return origin;
}

function isLocalHost(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/** Reescribe entradas guardadas con localhost para que el QR abra en el celular. */
export function resolveTicketQrUrl(storedQrCode: string, fallbackOrigin = ''): string {
  if (!storedQrCode.startsWith('http')) return storedQrCode;

  try {
    const url = new URL(storedQrCode);
    const publicBase = getQrPublicBaseUrl(fallbackOrigin);
    if (!publicBase || isLocalHost(publicBase)) return storedQrCode;

    const publicOrigin = new URL(publicBase);
    url.protocol = publicOrigin.protocol;
    url.host = publicOrigin.host;
    return url.toString();
  } catch {
    return storedQrCode;
  }
}

export function createTicketQrUrl(origin: string, data: TicketQrData): string {
  const encoded = encodeTicketQrData(data);
  const base = getQrPublicBaseUrl(origin);
  return `${base}/entradas/${data.id}?d=${encoded}`;
}

/** Ruta interna para navegar sin cambiar de host (localhost ↔ IP). */
export function getEntryPathFromQrUrl(storedQrCode: string): string {
  if (storedQrCode.startsWith('http')) {
    try {
      const url = new URL(storedQrCode);
      return `${url.pathname}${url.search}`;
    } catch {
      return storedQrCode;
    }
  }
  if (storedQrCode.startsWith('/')) return storedQrCode;
  return storedQrCode;
}

/** URL absoluta lista para escanear desde el celular. */
export function toScannableQrValue(value: string, fallbackOrigin = ''): string {
  if (value.startsWith('http')) {
    return resolveTicketQrUrl(value, fallbackOrigin);
  }
  if (value.startsWith('/')) {
    const base = getQrPublicBaseUrl(fallbackOrigin).replace(/\/$/, '');
    return `${base}${value}`;
  }
  return value;
}

export function decodeTicketFromStorage(ticketId: string): TicketQrData | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem('boletoclick_tickets');
    if (!raw) return null;

    const tickets = JSON.parse(raw) as Array<{
      id: string;
      eventId: string;
      eventTitle: string;
      venue: string;
      date: string;
      time: string;
      zone: string;
      quantity: number;
      total: number;
      purchasedAt: string;
      qrCode: string;
    }>;

    const found = tickets.find((t) => t.id === ticketId);
    if (!found) return null;

    const entryPath = getEntryPathFromQrUrl(found.qrCode);
    const dParam = new URL(entryPath, window.location.origin).searchParams.get('d');
    if (dParam) {
      const decoded = decodeTicketQrData(dParam);
      if (decoded) return decoded;
    }

    return {
      id: found.id,
      eventId: found.eventId,
      eventTitle: found.eventTitle,
      venue: found.venue,
      date: found.date,
      time: found.time,
      zone: found.zone,
      quantity: found.quantity,
      total: found.total,
      purchasedAt: found.purchasedAt,
    };
  } catch {
    return null;
  }
}

export function isQrScannableFromMobile(qrUrl: string): boolean {
  if (!qrUrl.startsWith('http')) return false;
  try {
    return !isLocalHost(new URL(qrUrl).origin);
  } catch {
    return false;
  }
}
