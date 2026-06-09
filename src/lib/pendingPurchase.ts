import type { PurchaseInput } from '@/services/ticketService';

const PENDING_PURCHASE_KEY = 'boletoclick_pending_purchase';

export function savePendingPurchase(data: PurchaseInput): void {
  sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(data));
}

export function readPendingPurchase(): PurchaseInput | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PURCHASE_KEY);
    return raw ? (JSON.parse(raw) as PurchaseInput) : null;
  } catch {
    return null;
  }
}

export function clearPendingPurchase(): void {
  sessionStorage.removeItem(PENDING_PURCHASE_KEY);
}
