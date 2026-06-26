"use client";

import { authenticatedFetch } from '@/lib/authenticatedFetch';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface AccesoLog {
  id: string;
  ticketId: string;
  sector: string;
  hora: string;
  estado: "VALIDO" | "INVALIDO" | "USADO";
  mensaje?: string;
}

interface CameraDevice {
  id: string;
  label: string;
}

const SCANNER_ELEMENT_ID = "qr-reader";
const QR_STORAGE_KEY = "HTML5_QRCODE_DATA";

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
        : "";

  if (name === "NotFoundError") {
    return "No se encontró ninguna cámara disponible. Conectá una webcam o usá el ingreso manual.";
  }
  if (name === "NotAllowedError") {
    return "Permiso de cámara denegado. Habilitalo en el navegador y recargá la página.";
  }
  if (name === "NotReadableError") {
    return "La cámara está en uso por otra aplicación. Cerrala e intentá de nuevo.";
  }

  return "No se pudo iniciar la cámara. Probá otro dispositivo o usá el ingreso manual.";
}

export default function ScannerPage() {
  const router = useRouter();
  const [ticketCodigo, setTicketCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusScanner, setStatusScanner] = useState<
    "idle" | "success" | "error" | "used"
  >("idle");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [ultimosAccesos, setUltimosAccesos] = useState<AccesoLog[]>([]);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const procesarCodigoTicket = useCallback(async (codigo: string) => {
    if (!codigo.trim()) return;
    setLoading(true);
    setStatusScanner("idle");
    setFeedbackMsg("");

    try {
      const response = await authenticatedFetch("/api/backend/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ qrCode: codigo.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      const horaActual = new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const sector =
        data.ticket?.ticketType?.zone ??
        data.ticket?.ticketType?.name ??
        "General";

      if (response.ok) {
        setStatusScanner("success");
        setFeedbackMsg(`¡Acceso Permitido! Sector: ${sector}`);

        setUltimosAccesos((prev) => [
          {
            id: Math.random().toString(),
            ticketId: codigo.trim().substring(0, 8) + "...",
            sector,
            hora: horaActual,
            estado: "VALIDO",
          },
          ...prev,
        ]);
      } else {
        const message =
          typeof data.message === "string"
            ? data.message
            : "El ticket provisto no es válido para este evento.";
        const esUsado =
          response.status === 400 &&
          message.toLowerCase().includes("ya utilizado");

        setStatusScanner(esUsado ? "used" : "error");
        setFeedbackMsg(message);

        setUltimosAccesos((prev) => [
          {
            id: Math.random().toString(),
            ticketId: codigo.trim().substring(0, 8) + "...",
            sector: "N/A",
            hora: horaActual,
            estado: esUsado ? "USADO" : "INVALIDO",
            mensaje: message,
          },
          ...prev,
        ]);
      }
    } catch {
      setStatusScanner("error");
      setFeedbackMsg("Error de red o servidor al procesar la validación.");
    } finally {
      setLoading(false);
      setTicketCodigo("");
    }
  }, []);

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
      // Ignorar errores al detener cámara ya liberada
    }
  }, []);

  const startScanner = useCallback(
    async (cameraId?: string) => {
      setCameraError(null);
      setCameraReady(false);

      await stopScanner();

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID);
      }

      const scanner = scannerRef.current;
      const targetCameraId = cameraId || selectedCameraId;

      const attempts: Array<string | { facingMode: string }> = [];
      if (targetCameraId) attempts.push(targetCameraId);
      attempts.push({ facingMode: "user" });
      attempts.push({ facingMode: "environment" });

      for (const cameraConfig of attempts) {
        try {
          await scanner.start(
            cameraConfig,
            SCANNER_CONFIG,
            onScanSuccess,
            () => {},
          );
          setCameraReady(true);
          return;
        } catch {
          await stopScanner();
        }
      }

      setCameraError(getCameraErrorMessage(new DOMException("", "NotFoundError")));
    },
    [onScanSuccess, selectedCameraId, stopScanner],
  );

  useEffect(() => {
    localStorage.removeItem(QR_STORAGE_KEY);

    let mounted = true;
    scannerRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID);

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
          // ignore cleanup errors
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
        if (preferredId) {
          setSelectedCameraId(preferredId);
        }

        const attempts: Array<string | { facingMode: string }> = [];
        if (preferredId) attempts.push(preferredId);
        attempts.push({ facingMode: "user" });
        attempts.push({ facingMode: "environment" });

        for (const cameraConfig of attempts) {
          const started = await startWithConfig(cameraConfig);
          if (!mounted) return;
          if (started) {
            setCameraReady(true);
            setCameraError(null);
            return;
          }
        }

        setCameraError(getCameraErrorMessage(new DOMException("", "NotFoundError")));
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
  }, [onScanSuccess, stopScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void procesarCodigoTicket(ticketCodigo);
  };

  const handleRestartCamera = () => {
    void startScanner(selectedCameraId || undefined);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-background text-text font-sans">
      <div className="mb-6 flex justify-between items-center border-b-4 border-text pb-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-soft block mb-1">
            BoletoClick / Control de Accesos
          </span>
          <h1 className="uppercase tracking-tighter text-2xl md:text-3xl font-black">
            Scanner de Entradas
          </h1>
        </div>
        <button
          onClick={() => router.push("/producer/dashboard")}
          className="px-3 py-1.5 bg-surface text-text border-2 border-text font-mono text-xs font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          ⬅️ Volver al Panel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 space-y-6">
          <div className="bg-surface border-4 border-text p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-mono font-black uppercase mb-3 text-primary">
              📷 Cámara de Control en Vivo
            </h2>

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
                  onClick={handleRestartCamera}
                  className="px-3 py-2 bg-text text-surface border-2 border-text font-mono text-xs font-black uppercase"
                >
                  Usar cámara
                </button>
              </div>
            )}

            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full min-h-[280px] bg-background border-2 border-text overflow-hidden"
            />

            {cameraReady && (
              <p className="mt-2 text-xs font-mono text-success uppercase font-bold">
                Cámara activa — apuntá al código QR
              </p>
            )}

            {cameraError && (
              <div className="mt-3 border-2 border-red-500 bg-red-500/10 p-3">
                <p className="text-xs font-mono text-red-600 font-bold uppercase">
                  {cameraError}
                </p>
                <button
                  type="button"
                  onClick={handleRestartCamera}
                  className="mt-2 px-3 py-1.5 bg-background border-2 border-text font-mono text-xs font-black uppercase"
                >
                  Reintentar cámara
                </button>
              </div>
            )}
          </div>

          <div className="bg-surface border-4 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-mono font-black uppercase mb-2">
              ⌨️ Ingreso Manual por Código
            </h2>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Pegá o escribí el código QR del ticket..."
                value={ticketCodigo}
                onChange={(e) => setTicketCodigo(e.target.value)}
                disabled={loading}
                className="flex-1 border-2 border-text p-2 bg-background font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none placeholder:text-text-soft uppercase"
              />
              <button
                type="submit"
                disabled={loading || !ticketCodigo.trim()}
                className="px-4 bg-text text-surface border-2 border-text font-mono text-xs font-black uppercase tracking-wider hover:bg-text/90 disabled:opacity-40 transition-all"
              >
                {loading ? "..." : "Validar"}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="bg-surface border-4 border-text p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-55 flex flex-col justify-center items-center text-center transition-all">
            {statusScanner === "idle" && (
              <div className="space-y-2">
                <div className="text-4xl animate-pulse">⏳</div>
                <p className="font-mono text-xs font-black uppercase tracking-tight text-text-soft">
                  Esperando Lectura de Ticket...
                </p>
              </div>
            )}

            {statusScanner === "success" && (
              <div className="space-y-3 bg-green-500/10 border-2 border-green-500 p-4 w-full">
                <div className="text-4xl">✅</div>
                <h3 className="text-green-600 font-mono font-black text-sm uppercase">
                  INGRESO AUTORIZADO
                </h3>
                <p className="text-xs font-bold uppercase">{feedbackMsg}</p>
              </div>
            )}

            {statusScanner === "error" && (
              <div className="space-y-3 bg-red-500/10 border-2 border-red-500 p-4 w-full">
                <div className="text-4xl">❌</div>
                <h3 className="text-red-600 font-mono font-black text-sm uppercase">
                  ACCESO DENEGADO
                </h3>
                <p className="text-xs font-medium text-text-soft">{feedbackMsg}</p>
              </div>
            )}

            {statusScanner === "used" && (
              <div className="space-y-3 bg-amber-500/10 border-2 border-amber-500 p-4 w-full">
                <div className="text-4xl">⚠️</div>
                <h3 className="text-amber-600 font-mono font-black text-sm uppercase">
                  TICKET YA PROCESADO
                </h3>
                <p className="text-xs font-medium text-text-soft">{feedbackMsg}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-surface border-4 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-sm font-mono font-black uppercase border-b-2 border-text pb-2 mb-3">
          📋 Logs de Admisión Recientes
        </h2>

        <div className="overflow-x-auto">
          {ultimosAccesos.length === 0 ? (
            <p className="font-mono text-xs text-text-soft p-4 text-center italic">
              [ No se registraron ingresos en esta sesión todavía ]
            </p>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-text bg-background text-text-soft">
                  <th className="p-2 uppercase font-black">Hora</th>
                  <th className="p-2 uppercase font-black">Ticket ID</th>
                  <th className="p-2 uppercase font-black">Sector</th>
                  <th className="p-2 uppercase font-black">Resolución</th>
                </tr>
              </thead>
              <tbody>
                {ultimosAccesos.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-text/20 hover:bg-background/40"
                  >
                    <td className="p-2 font-bold">{log.hora}</td>
                    <td className="p-2 text-text-soft">{log.ticketId}</td>
                    <td className="p-2 uppercase font-bold">{log.sector}</td>
                    <td className="p-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] font-black border uppercase ${
                          log.estado === "VALIDO"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : log.estado === "USADO"
                              ? "bg-amber-100 text-amber-700 border-amber-300"
                              : "bg-red-100 text-red-700 border-red-300"
                        }`}
                      >
                        {log.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
