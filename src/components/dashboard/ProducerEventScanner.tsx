'use client';

import { authenticatedFetch } from '@/lib/authenticatedFetch';
import {
  DUPLICATE_SCAN_MESSAGE,
  isDuplicateScanError,
  vibrateMobile,
} from '@/lib/scannerFeedback';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import ProducerScannerAuth from '@/components/dashboard/ProducerScannerAuth';

interface AccesoLog {
  id: string;
  ticketId: string;
  sector: string;
  hora: string;
  estado: 'VALIDO' | 'INVALIDO' | 'USADO';
  mensaje?: string;
}

interface CameraDevice {
  id: string;
  label: string;
}

export interface ScannerEventStats {
  total: number;
  arrived: number;
  pending: number;
  percentage: number;
}

interface ProducerEventScannerProps {
  eventId?: string;
  eventTitle?: string;
  stats?: ScannerEventStats | null;
  onScanComplete?: () => void;
  compact?: boolean;
  requireAuth?: boolean;
}

const QR_STORAGE_KEY = 'HTML5_QRCODE_DATA';

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1,
};

function pickPreferredCamera(cameras: CameraDevice[]): string | null {
  if (cameras.length === 0) return null;

  const backCamera = cameras.find((camera) =>
    /back|rear|environment|trasera|trase/i.test(camera.label),
  );
  if (backCamera) return backCamera.id;

  const builtInCamera = cameras.find((camera) =>
    /front|user|integrated|built|webcam|facetime|hd camera/i.test(camera.label),
  );
  if (builtInCamera) return builtInCamera.id;

  return cameras[0].id;
}

function getCameraErrorMessage(error: unknown): string {
  const name =
    error instanceof DOMException
      ? error.name
      : error instanceof Error
        ? error.name
        : '';

  if (name === 'NotFoundError') {
    return 'No se encontró ninguna cámara. Usá el ingreso manual.';
  }
  if (name === 'NotAllowedError') {
    return 'Permiso de cámara denegado. Habilitalo en el navegador.';
  }
  if (name === 'NotReadableError') {
    return 'La cámara está en uso por otra app. Cerrala e intentá de nuevo.';
  }

  return 'No se pudo iniciar la cámara. Probá el ingreso manual.';
}

export default function ProducerEventScanner({
  eventId,
  eventTitle,
  stats,
  onScanComplete,
  compact = false,
  requireAuth = true,
}: ProducerEventScannerProps) {
  const reactId = useId().replace(/:/g, '');
  const scannerElementId = `qr-reader-${reactId}`;

  const [scannerAuthorized, setScannerAuthorized] = useState(!requireAuth);

  useEffect(() => {
    if (requireAuth) {
      setScannerAuthorized(false);
    }
  }, [eventId, requireAuth]);

  const [ticketCodigo, setTicketCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusScanner, setStatusScanner] = useState<
    'idle' | 'success' | 'error' | 'used'
  >('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [ultimosAccesos, setUltimosAccesos] = useState<AccesoLog[]>([]);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const scannedCodesRef = useRef<Set<string>>(new Set());

  const procesarCodigoTicket = useCallback(
    async (codigo: string) => {
      const normalizedCode = codigo.trim();
      if (!normalizedCode) return;

      if (scannedCodesRef.current.has(normalizedCode)) {
        setStatusScanner('used');
        setFeedbackMsg(DUPLICATE_SCAN_MESSAGE);
        vibrateMobile([100, 50, 100]);
        setUltimosAccesos((prev) => [
          {
            id: Math.random().toString(),
            ticketId: `${normalizedCode.substring(0, 8)}...`,
            sector: 'N/A',
            hora: new Date().toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            estado: 'USADO',
            mensaje: DUPLICATE_SCAN_MESSAGE,
          },
          ...prev.slice(0, 9),
        ]);
        return;
      }

      setLoading(true);
      setStatusScanner('idle');
      setFeedbackMsg('');

      try {
        const response = await authenticatedFetch('/api/backend/tickets/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            qrCode: normalizedCode,
            ...(eventId ? { eventId } : {}),
          }),
        });

        const data = await response.json().catch(() => ({}));
        const horaActual = new Date().toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const sector =
          data.ticket?.ticketType?.zone ??
          data.ticket?.ticketType?.name ??
          'General';

        if (response.ok) {
          scannedCodesRef.current.add(normalizedCode);
          setStatusScanner('success');
          setFeedbackMsg(`¡Acceso permitido! Sector: ${sector}`);
          vibrateMobile(200);
          onScanComplete?.();

          setUltimosAccesos((prev) => [
            {
              id: Math.random().toString(),
              ticketId: `${normalizedCode.substring(0, 8)}...`,
              sector,
              hora: horaActual,
              estado: 'VALIDO',
            },
            ...prev.slice(0, 9),
          ]);
        } else {
          const rawMessage =
            typeof data.message === 'string'
              ? data.message
              : 'El ticket no es válido para este evento.';
          const esUsado = isDuplicateScanError(rawMessage);
          const message = esUsado ? DUPLICATE_SCAN_MESSAGE : rawMessage;

          if (esUsado) {
            scannedCodesRef.current.add(normalizedCode);
            vibrateMobile([100, 50, 100]);
          } else {
            vibrateMobile(400);
          }

          setStatusScanner(esUsado ? 'used' : 'error');
          setFeedbackMsg(message);

          setUltimosAccesos((prev) => [
            {
              id: Math.random().toString(),
              ticketId: `${normalizedCode.substring(0, 8)}...`,
              sector: 'N/A',
              hora: horaActual,
              estado: esUsado ? 'USADO' : 'INVALIDO',
              mensaje: message,
            },
            ...prev.slice(0, 9),
          ]);
        }
      } catch {
        setStatusScanner('error');
        setFeedbackMsg('Error de red al validar el ticket.');
        vibrateMobile(400);
      } finally {
        setLoading(false);
        setTicketCodigo('');
      }
    },
    [eventId, onScanComplete],
  );

  const onScanSuccess = useCallback(
    (decodedText: string) => {
      if (processingRef.current || loading) return;
      processingRef.current = true;
      void procesarCodigoTicket(decodedText).finally(() => {
        processingRef.current = false;
      });
    },
    [loading, procesarCodigoTicket],
  );

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      const state = scanner.getState();
      if (state === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // ignore cleanup errors
    }
  }, []);

  const startScanner = useCallback(
    async (cameraId?: string) => {
      setCameraError(null);
      setCameraReady(false);
      await stopScanner();

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerElementId);
      }

      const scanner = scannerRef.current;
      const targetCameraId = cameraId || selectedCameraId;

      const attempts: Array<string | { facingMode: string }> = [];
      if (targetCameraId) attempts.push(targetCameraId);
      attempts.push({ facingMode: 'environment' });
      attempts.push({ facingMode: 'user' });

      for (const cameraConfig of attempts) {
        try {
          await scanner.start(cameraConfig, SCANNER_CONFIG, onScanSuccess, () => {});
          setCameraReady(true);
          return;
        } catch {
          await stopScanner();
        }
      }

      setCameraError(getCameraErrorMessage(new DOMException('', 'NotFoundError')));
    },
    [onScanSuccess, scannerElementId, selectedCameraId, stopScanner],
  );

  useEffect(() => {
    if (!scannerAuthorized) return;

    localStorage.removeItem(QR_STORAGE_KEY);

    let mounted = true;
    scannerRef.current = new Html5Qrcode(scannerElementId);

    const startWithConfig = async (cameraConfig: string | { facingMode: string }) => {
      const scanner = scannerRef.current;
      if (!scanner) return false;

      try {
        await scanner.start(cameraConfig, SCANNER_CONFIG, onScanSuccess, () => {});
        return true;
      } catch {
        try {
          const state = scanner.getState();
          if (state === Html5QrcodeScannerState.SCANNING) {
            await scanner.stop();
          }
          scanner.clear();
        } catch {
          // ignore
        }
        return false;
      }
    };

    const initCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;

        const mapped = devices.map((device) => ({
          id: device.id,
          label: device.label || `Cámara ${device.id.slice(0, 6)}`,
        }));

        setCameras(mapped);

        const preferredId = pickPreferredCamera(mapped);
        if (preferredId) setSelectedCameraId(preferredId);

        const attempts: Array<string | { facingMode: string }> = [];
        if (preferredId) attempts.push(preferredId);
        attempts.push({ facingMode: 'environment' });
        attempts.push({ facingMode: 'user' });

        for (const cameraConfig of attempts) {
          const started = await startWithConfig(cameraConfig);
          if (!mounted) return;
          if (started) {
            setCameraReady(true);
            setCameraError(null);
            return;
          }
        }

        setCameraError(getCameraErrorMessage(new DOMException('', 'NotFoundError')));
      } catch (error) {
        if (!mounted) return;
        setCameraError(getCameraErrorMessage(error));
      }
    };

    void initCameras();

    return () => {
      mounted = false;
      void stopScanner();
      scannerRef.current = null;
    };
  }, [onScanSuccess, scannerAuthorized, scannerElementId, stopScanner]);

  const handleLockScanner = useCallback(async () => {
    await stopScanner();
    setCameraReady(false);
    setScannerAuthorized(false);
    setStatusScanner('idle');
    setFeedbackMsg('');
  }, [stopScanner]);

  if (requireAuth && !scannerAuthorized) {
    return (
      <ProducerScannerAuth
        eventTitle={eventTitle}
        onAuthorized={() => setScannerAuthorized(true)}
      />
    );
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void procesarCodigoTicket(ticketCodigo);
  };

  return (
    <div className={`space-y-4 ${compact ? '' : 'md:space-y-6'}`}>
      {requireAuth && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleLockScanner()}
            className="px-3 py-1.5 border-2 border-text bg-surface font-mono text-[10px] font-black uppercase hover:bg-background transition-colors"
          >
            🔒 Cerrar sesión de escaneo
          </button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-2 border-2 border-text bg-background p-3">
          {[
            { label: 'Escaneados', value: stats.arrived },
            { label: 'Pendientes', value: stats.pending },
            { label: 'Total vendidos', value: stats.total },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <span className="block text-xl font-black text-text">{value}</span>
              <span className="block text-[9px] font-mono font-bold uppercase text-text-soft mt-0.5">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {stats && stats.total > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono font-bold uppercase text-text-soft">
              Progreso de escaneo
            </span>
            <span className="text-xs font-mono font-black text-text">
              {stats.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 border-2 border-text bg-background overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(stats.percentage, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] font-mono text-text-soft">
            {stats.arrived} de {stats.total} boletos escaneados
          </p>
        </div>
      )}

      <div className={compact ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-12 gap-6 items-start'}>
        <div className={compact ? 'space-y-4' : 'md:col-span-7 space-y-6'}>
          <div className="bg-surface border-2 border-text p-4 shadow-[4px_4px_0px_0px_var(--color-text)]">
            <h2 className="text-sm font-mono font-black uppercase mb-1 text-primary">
              📷 Escanear boletos
            </h2>
            {eventTitle && (
              <p className="text-[10px] font-mono text-text-soft uppercase mb-3 truncate">
                {eventTitle}
              </p>
            )}

            {cameras.length > 1 && (
              <div className="mb-3 flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="flex-1 border-2 border-text p-2 bg-background font-mono text-xs"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void startScanner(selectedCameraId || undefined)}
                  className="px-3 py-2 bg-text text-surface border-2 border-text font-mono text-xs font-black uppercase"
                >
                  Usar cámara
                </button>
              </div>
            )}

            <div
              id={scannerElementId}
              className="w-full min-h-[240px] sm:min-h-[280px] bg-background border-2 border-text overflow-hidden"
            />

            {cameraReady && (
              <p className="mt-2 text-xs font-mono text-success uppercase font-bold">
                Cámara activa — apuntá al QR
              </p>
            )}

            {cameraError && (
              <div className="mt-3 border-2 border-red-500 bg-red-500/10 p-3">
                <p className="text-xs font-mono text-red-600 font-bold uppercase">
                  {cameraError}
                </p>
                <button
                  type="button"
                  onClick={() => void startScanner(selectedCameraId || undefined)}
                  className="mt-2 px-3 py-1.5 bg-background border-2 border-text font-mono text-xs font-black uppercase"
                >
                  Reintentar cámara
                </button>
              </div>
            )}
          </div>

          <form
            onSubmit={handleManualSubmit}
            className="bg-surface border-2 border-text p-4 shadow-[4px_4px_0px_0px_var(--color-text)] flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Código QR manual..."
              value={ticketCodigo}
              onChange={(e) => setTicketCodigo(e.target.value)}
              disabled={loading}
              className="flex-1 border-2 border-text p-2 bg-background font-mono text-xs focus:outline-none placeholder:text-text-soft"
            />
            <button
              type="submit"
              disabled={loading || !ticketCodigo.trim()}
              className="px-4 py-2 bg-text text-surface border-2 border-text font-mono text-xs font-black uppercase disabled:opacity-40"
            >
              {loading ? '...' : 'Validar'}
            </button>
          </form>
        </div>

        <div className={compact ? '' : 'md:col-span-5'}>
          <div className="bg-surface border-2 border-text p-4 shadow-[4px_4px_0px_0px_var(--color-text)] min-h-40 flex flex-col justify-center items-center text-center">
            {statusScanner === 'idle' && (
              <div className="space-y-2">
                <div className="text-3xl animate-pulse">⏳</div>
                <p className="font-mono text-xs font-black uppercase text-text-soft">
                  Esperando lectura...
                </p>
              </div>
            )}
            {statusScanner === 'success' && (
              <div className="space-y-2 bg-success/10 border-2 border-success p-4 w-full">
                <div className="text-3xl">✅</div>
                <h3 className="text-success font-mono font-black text-sm uppercase">
                  Ingreso autorizado
                </h3>
                <p className="text-xs font-bold uppercase">{feedbackMsg}</p>
              </div>
            )}
            {statusScanner === 'error' && (
              <div className="space-y-2 bg-red-500/10 border-2 border-red-500 p-4 w-full">
                <div className="text-3xl">❌</div>
                <h3 className="text-red-600 font-mono font-black text-sm uppercase">
                  Acceso denegado
                </h3>
                <p className="text-xs text-text-soft">{feedbackMsg}</p>
              </div>
            )}
            {statusScanner === 'used' && (
              <div className="space-y-2 bg-amber-500/10 border-2 border-amber-500 p-4 w-full">
                <div className="text-3xl">⚠️</div>
                <h3 className="text-amber-600 font-mono font-black text-sm uppercase">
                  Boleto ya escaneado
                </h3>
                <p className="text-xs font-bold text-amber-700">{feedbackMsg}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {ultimosAccesos.length > 0 && (
        <div className="bg-surface border-2 border-text p-4 shadow-[4px_4px_0px_0px_var(--color-text)]">
          <h3 className="text-xs font-mono font-black uppercase border-b-2 border-text pb-2 mb-2">
            Últimos escaneos
          </h3>
          <ul className="space-y-1.5">
            {ultimosAccesos.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-2 font-mono text-[10px] border-b border-text/20 pb-1.5"
              >
                <span className="font-bold">{log.hora}</span>
                <span className="truncate text-text-soft flex-1">{log.sector}</span>
                <span
                  className={`shrink-0 px-1.5 py-0.5 font-black uppercase border ${
                    log.estado === 'VALIDO'
                      ? 'bg-success/10 text-success border-success'
                      : log.estado === 'USADO'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500'
                        : 'bg-red-500/10 text-red-600 border-red-500'
                  }`}
                >
                  {log.estado}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
