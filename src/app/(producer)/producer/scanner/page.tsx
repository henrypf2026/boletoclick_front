"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

interface AccesoLog {
  id: string;
  ticketId: string;
  sector: string;
  hora: string;
  estado: "VALIDO" | "INVALIDO" | "USADO";
  mensaje?: string;
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

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false,
    );

    const onScanSuccess = (decodedText: string) => {
      procesarCodigoTicket(decodedText);
    };

    const onScanFailure = (error: any) => {};

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Error limpiando scanner QR:", err));
      }
    };
  }, []);

  const procesarCodigoTicket = async (codigo: string) => {
    if (!codigo.trim()) return;
    setLoading(true);
    setStatusScanner("idle");
    setFeedbackMsg("");

    try {
      const response = await fetch("/api/backend/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: codigo.trim() }),
      });

      const data = await response.json();
      const horaActual = new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      if (response.ok && data.valid) {
        setStatusScanner("success");
        setFeedbackMsg(
          `¡Acceso Permitido! Sector: ${data.sector || "General"}`,
        );

        setUltimosAccesos((prev) => [
          {
            id: Math.random().toString(),
            ticketId: codigo.trim().substring(0, 8) + "...",
            sector: data.sector || "General",
            hora: horaActual,
            estado: "VALIDO",
          },
          ...prev,
        ]);
      } else {
        const esUsado =
          data.status === "USED" ||
          data.mensaje?.toLowerCase().includes("usado");
        setStatusScanner(esUsado ? "used" : "error");
        setFeedbackMsg(
          data.mensaje || "El ticket provisto no es válido para este evento.",
        );

        setUltimosAccesos((prev) => [
          {
            id: Math.random().toString(),
            ticketId: codigo.trim().substring(0, 8) + "...",
            sector: data.sector || "N/A",
            hora: horaActual,
            estado: esUsado ? "USADO" : "INVALIDO",
            mensaje: data.mensaje || "Inválido",
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      console.error("🚨 Error al validar ticket:", err);
      setStatusScanner("error");
      setFeedbackMsg("Error de red o servidor al procesar la validación.");
    } finally {
      setLoading(false);
      setTicketCodigo("");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    procesarCodigoTicket(ticketCodigo);
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
          onClick={() => router.push("/producer")}
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
            <div
              id="reader"
              className="w-full bg-background border-2 border-text overflow-hidden rounded-none [&_button]:bg-background! [&_button]:text-text! [&_button]:border-2! [&_button]:border-text! [&_button]:font-mono! [&_button]:text-xs! [&_button]:px-3! [&_button]:py-1.5! [&_button]:my-2! [&_button]:uppercase! [&_button]:font-bold! [&_button]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]!"
            />
          </div>

          <div className="bg-surface border-4 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-mono font-black uppercase mb-2">
              ⌨️ Ingreso Manual por Código
            </h2>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Pegá o escribí el ID del ticket..."
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
                <p className="text-xs font-medium text-text-soft">
                  {feedbackMsg}
                </p>
              </div>
            )}

            {statusScanner === "used" && (
              <div className="space-y-3 bg-amber-500/10 border-2 border-amber-500 p-4 w-full">
                <div className="text-4xl">⚠️</div>
                <h3 className="text-amber-600 font-mono font-black text-sm uppercase">
                  TICKET YA PROCESADO
                </h3>
                <p className="text-xs font-medium text-text-soft">
                  {feedbackMsg}
                </p>
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
