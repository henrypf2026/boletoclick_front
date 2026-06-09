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
  ticketTypeId: string;
  ticketTypeName: string;
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
  if (!token) return null;

  const attempts = [token.trim()];

  try {
    attempts.push(decodeURIComponent(token.trim()));
  } catch {
    // token ya decodificado
  }

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(fromBase64Url(candidate)) as TicketQrData;
      if (parsed?.id && parsed?.eventTitle) return parsed;
    } catch {
      // siguiente intento
    }
  }

  return null;
}

export function getQrPublicBaseUrl(fallbackOrigin = ''): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;

  const origin =
    fallbackOrigin ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return origin;
}

export function createTicketQrUrl(origin: string, data: TicketQrData): string {
  const encoded = encodeTicketQrData(data);
  const base = getQrPublicBaseUrl(origin);
  return `${base}/entradas/${data.id}?d=${encoded}`;
}

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

export function normalizeQrUrl(qrCode: string, fallbackOrigin = ''): string {
  const publicBase = getQrPublicBaseUrl(fallbackOrigin).replace(/\/$/, '');
  if (!publicBase) return qrCode;

  try {
    const url = new URL(
      qrCode.startsWith('http') ? qrCode : `${publicBase}${qrCode.startsWith('/') ? qrCode : `/${qrCode}`}`,
    );
    const base = new URL(publicBase);
    url.protocol = base.protocol;
    url.host = base.host;
    return url.toString();
  } catch {
    return qrCode;
  }
}

export function toScannableQrValue(value: string, fallbackOrigin = ''): string {
  const normalized = normalizeQrUrl(value, fallbackOrigin);
  if (normalized.startsWith('http')) return normalized;
  const base = getQrPublicBaseUrl(fallbackOrigin).replace(/\/$/, '');
  return `${base}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}
