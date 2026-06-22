"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

interface LogEvent {
  id: string;
  timestamp: string;
  type: "SUCCESS" | "INFO" | "WARN" | "CRITICAL";
  message: string;
}

type FiltroLog = "ALL" | "SUCCESS" | "INFO" | "WARN" | "CRITICAL";

export default function AdminDashboard() {
  const router = useRouter();

  const { eventos } = useAdmin();

  const [logsPausados, setLogsPausados] = useState(false);
  const [filtroLogActivo, setFiltroLogActivo] = useState<FiltroLog>("ALL");
  const [logs, setLogs] = useState<LogEvent[]>([
    {
      id: "1",
      timestamp: "21:41:02",
      type: "SUCCESS",
      message: "Webhook procesado - Pago Recibido - FAC-9843 ($44.000)",
    },
    {
      id: "2",
      timestamp: "21:39:15",
      type: "INFO",
      message: "Generando Token de Acceso seguro para QR-DK-992",
    },
    {
      id: "3",
      timestamp: "21:22:50",
      type: "WARN",
      message: "Latencia elevada en pasarela Stripe (Gateway Id: 8821)",
    },
    {
      id: "4",
      timestamp: "20:15:11",
      type: "CRITICAL",
      message:
        "Intento de alteración de precio detectado y bloqueado en checkout",
    },
  ]);

  const [servicios, setServicios] = useState([
    {
      name: "API SERVER",
      status: "ONLINE",
      latency: "14ms",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    },
    {
      name: "PASARELA (Stripe)",
      status: "ONLINE",
      latency: "42ms",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    },
    {
      name: "BASE DE DATOS",
      status: "SINCRO",
      latency: "OK",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    },
    {
      name: "PROVEEDOR QR",
      status: "LATENCIA",
      latency: "320ms",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    },
  ]);

  const pendientesCount = eventos.filter(
    (e) => e.estado === "PENDIENTE",
  ).length;

  useEffect(() => {
    const eventosMock = [
      {
        type: "SUCCESS" as const,
        message: "Nueva compra aprobada FAC-1102 por 2 entradas ($30.000)",
      },
      {
        type: "INFO" as const,
        message: "Sincronizando base de datos local con la API del proyecto",
      },
      {
        type: "WARN" as const,
        message: "Intento de login fallido desde IP remota en cuenta ID #2",
      },
      {
        type: "CRITICAL" as const,
        message: "Alerta de concurrencia: Alta carga en servidor de pasarela",
      },
    ];

    const interval = setInterval(() => {
      if (logsPausados) return;

      const azar = eventosMock[Math.floor(Math.random() * eventosMock.length)];
      const ahora = new Date();
      const timeStr = `${ahora.getHours().toString().padStart(2, "0")}:${ahora.getMinutes().toString().padStart(2, "0")}:${ahora.getSeconds().toString().padStart(2, "0")}`;

      setLogs((prev) => [
        {
          id: Date.now().toString(),
          timestamp: timeStr,
          type: azar.type,
          message: azar.message,
        },
        ...prev.slice(0, 15),
      ]);

      setServicios((prev) =>
        prev.map((s) =>
          s.name === "API SERVER"
            ? { ...s, latency: `${Math.floor(Math.random() * 10) + 10}ms` }
            : s,
        ),
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [logsPausados]);

  const logsFiltrados = logs.filter(
    (log) => filtroLogActivo === "ALL" || log.type === filtroLogActivo,
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-background text-text font-mono">
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Consola de Control Global
          </h1>
          <p className="text-text-soft mt-1 text-xs uppercase tracking-wide">
            Infraestructura de red, auditoría de logs y enrutamiento operativo
          </p>
        </div>
        <div className="bg-surface text-text border-2 border-text px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          ACCESS_LEVEL: ADMIN
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/usuarios")}
          className="p-4 bg-surface text-text border-4 border-text font-black text-xs md:text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex justify-between items-center cursor-pointer"
        >
          <span>👥 Base de Usuarios</span>
          <span>→</span>
        </button>
        <button
          onClick={() => router.push("/admin/moderacion")}
          className="p-4 bg-surface text-text border-4 border-text font-black text-xs md:text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex justify-between items-center cursor-pointer"
        >
          <span className="text-amber-600">
            🎪 Moderación de Eventos{" "}
            {pendientesCount > 0 && `(${pendientesCount})`}
          </span>
          <span className="text-amber-600">→</span>
        </button>
        <button
          onClick={() => router.push("/admin/finanzas")}
          className="p-4 bg-surface text-text border-4 border-text font-black text-xs md:text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex justify-between items-center cursor-pointer"
        >
          <span className="text-emerald-600">💸 Tesorería y Pasarela</span>
          <span className="text-emerald-600">→</span>
        </button>
      </div>

      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-wider text-text-soft mb-3">
          MONITOREO DE PLATAFORMA (HARDWARE / API)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {servicios.map((serv, idx) => (
            <div
              key={idx}
              className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center text-xs"
            >
              <span className="font-bold uppercase">{serv.name}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-black border uppercase ${serv.color}`}
                >
                  {serv.status}
                </span>
                <span className="text-text-soft text-[10px]">
                  ({serv.latency})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-text pb-3 mb-4">
            <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <span
                className={`w-2 h-2 border ${logsPausados ? "bg-amber-500/40 border-amber-500" : "bg-emerald-500 border-emerald-600 animate-pulse"}`}
              ></span>
              AUDITORÍA LOGS CONTROLLER {logsPausados && "(CONGELADO)"}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex border border-text text-[10px] font-bold">
                {(["ALL", "SUCCESS", "WARN", "CRITICAL"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroLogActivo(f)}
                    className={`px-2 py-0.5 cursor-pointer uppercase ${filtroLogActivo === f ? "bg-text text-surface" : "bg-surface text-text hover:bg-background"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setLogsPausados(!logsPausados)}
                className="px-3 py-0.5 border-2 border-text text-[10px] font-black uppercase cursor-pointer bg-surface text-text shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-text hover:text-surface transition-all"
              >
                {logsPausados ? "▶️ REANUDAR" : "⏸️ PAUSAR LIVE"}
              </button>
            </div>
          </div>

          <div className="text-xs space-y-2.5 max-h-96 overflow-y-auto bg-background p-4 border-2 border-text/10">
            {logsFiltrados.length > 0 ? (
              logsFiltrados.map((log) => (
                <p
                  key={log.id}
                  className="text-text leading-relaxed uppercase break-all flex items-start sm:items-center gap-2 animate-fadeIn"
                >
                  <span className="text-text-soft font-bold whitespace-nowrap">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black border uppercase tracking-wider rounded-sm ${
                      log.type === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        : log.type === "INFO"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                          : log.type === "WARN"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/40"
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-text font-medium">{log.message}</span>
                </p>
              ))
            ) : (
              <p className="text-center text-text-soft text-[10px] uppercase py-4">
                No hay logs de tipo [{filtroLogActivo}] en el búfer actual.
              </p>
            )}
          </div>
        </div>

        <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <p className="text-xs font-black uppercase text-text border-b-2 border-text pb-2">
            🚨 Estado de cola crítica
          </p>

          {pendientesCount > 0 ? (
            <div className="border-2 border-amber-500 bg-amber-500/10 p-3 space-y-2">
              <p className="text-[11px] font-black uppercase text-amber-700">
                ⚠️ PROPUESTAS ESPERANDO AUDITORÍA
              </p>
              <p className="text-xs font-bold uppercase text-text">
                Hay {pendientesCount} evento(s) nuevos enviados por productores
                en la cola de revisión.
              </p>
              <button
                onClick={() => router.push("/admin/moderacion")}
                className="w-full bg-amber-500 text-text text-[10px] font-black p-1.5 border border-text uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-background"
              >
                Abrir Panel de Moderación →
              </button>
            </div>
          ) : (
            <div className="border-2 border-emerald-500 bg-emerald-500/10 p-3 text-center">
              <p className="text-[11px] font-black text-emerald-700 uppercase">
                ✓ CARTELERA SINCRO
              </p>
              <p className="text-[10px] uppercase text-text-soft font-bold mt-1">
                No hay propuestas pendientes en este bloque.
              </p>
            </div>
          )}

          <div className="border-2 border-text bg-background p-3 space-y-2 text-xs uppercase font-bold">
            <p className="text-[10px] font-black text-text-soft border-b border-text/10 pb-1">
              Seguridad del Sistema
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>SSL Certificate:</span>
                <span className="text-emerald-600 font-black">VALID</span>
              </div>
              <div className="flex justify-between">
                <span>CORS Policy:</span>
                <span className="text-emerald-600 font-black">STRICT</span>
              </div>
              <div className="flex justify-between">
                <span>Filtro Inyecciones:</span>
                <span className="text-emerald-600 font-black">ACTIVO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
