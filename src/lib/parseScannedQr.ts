const JWT_PATTERN =
  /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ParsedScannedQr {
  qrCode?: string;
  ticketId?: string;
}

/** Normaliza lo leído por la cámara al formato que entiende el backend. */
export function parseScannedQr(raw: string): ParsedScannedQr {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  const jwtMatch = trimmed.match(JWT_PATTERN);
  if (jwtMatch) {
    return { qrCode: jwtMatch[0] };
  }

  const ticketFromUrl = trimmed.match(
    /\/entradas\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  if (ticketFromUrl) {
    return { ticketId: ticketFromUrl[1] };
  }

  if (UUID_PATTERN.test(trimmed)) {
    return { ticketId: trimmed };
  }

  return { qrCode: trimmed };
}
