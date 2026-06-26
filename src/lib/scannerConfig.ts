import type { Html5QrcodeCameraScanConfig } from 'html5-qrcode';

export function isMobileScannerDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

export async function waitForScannerElement(
  elementId: string,
  maxAttempts = 20,
): Promise<HTMLElement> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const element = document.getElementById(elementId);
    if (element) return element;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  throw new Error(`Scanner element #${elementId} not found`);
}

export function buildScannerConfig(): Html5QrcodeCameraScanConfig {
  return {
    fps: 15,
    disableFlip: false,
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      const width = Math.max(viewfinderWidth, 1);
      const height = Math.max(viewfinderHeight, 1);
      const minEdge = Math.min(width, height);
      const margin = Math.max(24, Math.round(minEdge * 0.12));
      const maxSize = minEdge - margin * 2;
      const size = Math.max(
        50,
        Math.min(maxSize, Math.floor(minEdge * 0.72)),
      );
      return { width: size, height: size };
    },
    videoConstraints: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };
}

export function buildScannerFullConfig() {
  return {
    verbose: false,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true,
    },
  } as const;
}

/** Espera a que el contenedor tenga tamaño real antes de iniciar la cámara. */
export async function waitForScannerLayout(
  elementId: string,
  maxAttempts = 40,
): Promise<HTMLElement> {
  const element = await waitForScannerElement(elementId, maxAttempts);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (element.clientWidth >= 180 && element.clientHeight >= 180) {
      return element;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return element;
}

export function buildCameraAttempts(
  preferredCameraId?: string,
  mobileFirst = isMobileScannerDevice(),
): Array<string | MediaTrackConstraints> {
  const environmentConstraints: MediaTrackConstraints = {
    facingMode: { ideal: 'environment' },
  };

  if (mobileFirst) {
    const attempts: Array<string | MediaTrackConstraints> = [
      environmentConstraints,
      { facingMode: 'environment' },
    ];
    if (preferredCameraId) attempts.push(preferredCameraId);
    attempts.push({ facingMode: 'user' });
    return attempts;
  }

  const attempts: Array<string | MediaTrackConstraints> = [];
  if (preferredCameraId) attempts.push(preferredCameraId);
  attempts.push(environmentConstraints, { facingMode: 'environment' });
  attempts.push({ facingMode: 'user' });
  return attempts;
}
