export const DUPLICATE_SCAN_MESSAGE =
  'Este boleto ya fue escaneado. No se puede repetir la lectura.';

export function isDuplicateScanError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('ya utilizado') ||
    normalized.includes('ya fue escaneado') ||
    normalized.includes('no se puede repetir') ||
    normalized.includes('duplicado') ||
    normalized.includes('already') ||
    normalized.includes('used')
  );
}

export function vibrateMobile(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
