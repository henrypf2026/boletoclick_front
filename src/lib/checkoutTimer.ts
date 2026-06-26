export const CHECKOUT_TIMER_SECONDS = 10 * 60;

export function getCheckoutStorageKeys(ticketTypeId: string) {
  return {
    sessionKey: `checkoutSession_${ticketTypeId}`,
    startKey: `checkoutStart_${ticketTypeId}`,
  };
}

export function initCheckoutTimer(ticketTypeId: string): void {
  if (typeof window === 'undefined') return;
  const { sessionKey, startKey } = getCheckoutStorageKeys(ticketTypeId);
  if (
    !window.localStorage.getItem(sessionKey) &&
    !window.localStorage.getItem(startKey)
  ) {
    window.localStorage.setItem(startKey, String(Date.now()));
  }
}

/** Renueva el contador local eliminando sesiones de pago vencidas. */
export function renewCheckoutTimer(ticketTypeId: string): void {
  if (typeof window === 'undefined') return;
  const { sessionKey, startKey } = getCheckoutStorageKeys(ticketTypeId);
  window.localStorage.removeItem(sessionKey);
  window.localStorage.setItem(startKey, String(Date.now()));
}

export function clearCheckoutTimer(ticketTypeId: string): void {
  if (typeof window === 'undefined') return;
  const { sessionKey, startKey } = getCheckoutStorageKeys(ticketTypeId);
  window.localStorage.removeItem(sessionKey);
  window.localStorage.removeItem(startKey);
}

export function readRemainingSeconds(ticketTypeId: string): number {
  if (typeof window === 'undefined') return CHECKOUT_TIMER_SECONDS;

  const { sessionKey, startKey } = getCheckoutStorageKeys(ticketTypeId);
  const storedSession = window.localStorage.getItem(sessionKey);

  if (storedSession) {
    try {
      const parsed = JSON.parse(storedSession) as { expiresAt?: string };
      if (parsed.expiresAt) {
        return Math.floor(
          (new Date(parsed.expiresAt).getTime() - Date.now()) / 1000,
        );
      }
    } catch {
      window.localStorage.removeItem(sessionKey);
    }
  }

  const storedStart = window.localStorage.getItem(startKey);
  if (!storedStart) return CHECKOUT_TIMER_SECONDS;

  const elapsed = Math.floor((Date.now() - Number(storedStart)) / 1000);
  return CHECKOUT_TIMER_SECONDS - elapsed;
}
