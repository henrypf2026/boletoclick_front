"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LogEvent {
  id: string;
  timestamp: string;
  type: "SUCCESS" | "INFO" | "WARN" | "CRITICAL";
  message: string;
}

type RangoTemporal = "HOY" | "7DIAS" | "MES" | "ANUAL";
type FiltroLog = "ALL" | "SUCCESS" | "INFO" | "WARN" | "CRITICAL";

export default function AdminDashboard() {
  const router = useRouter();

  const [rangoTime, setRangoTime] = useState<RangoTemporal>("MES");
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [comision, setComision] = useState(12);

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

  const datosFinancieros = {
    HOY: { gmv: 85000, entradas: 45 },
    "7DIAS": { gmv: 620000, entradas: 340 },
    MES: { gmv: 2450000, entradas: 1420 },
    ANUAL: { gmv: 28400000, entradas: 16800 },
  };

  const [servicios, setServicios] = useState([
    {
      name: "API SERVER",
      status: "ONLINE",
      latency: "14ms",
      color: "bg-success text-black",
    },
    {
      name: "PASARELA (Stripe)",
      status: "ONLINE",
      latency: "42ms",
      color: "bg-success text-black",
    },
    {
      name: "BASE DE DATOS",
      status: "SINCRO",
      latency: "OK",
      color: "bg-success text-black",
    },
    {
      name: "PROVEEDOR QR",
      status: "LATENCIA",
      latency: "320ms",
      color: "bg-secondary text-black",
    },
  ]);

  useEffect(() => {
    setLoadingMetrics(true);
    const timer = setTimeout(() => setLoadingMetrics(false), 300);
    return () => clearTimeout(timer);
  }, [rangoTime]);

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
        prev.map((s) => {
          if (s.name === "API SERVER") {
            return {
              ...s,
              latency: `${Math.floor(Math.random() * 10) + 10}ms`,
            };
          }
          return s;
        }),
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [logsPausados]);

  const gmvActual = datosFinancieros[rangoTime].gmv;
  const entradasActuales = datosFinancieros[rangoTime].entradas;
  const netoTicketera = (gmvActual * comision) / 100;
  const netoProductores = gmvActual - netoTicketera;

  const logsFiltrados = logs.filter(
    (log) => filtroLogActivo === "ALL" || log.type === filtroLogActivo,
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-background text-text">
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Consola de Control Global
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Auditoría de negocio, pasarela y métricas en tiempo real
          </p>
        </div>
        <div className="bg-red-500 text-white border-2 border-text px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          SYSTEM_ACCESS: ROOT_ADMIN
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/usuarios")}
          className="p-4 bg-secondary text-text border-4 border-text font-mono font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex justify-between items-center cursor-pointer"
        >
          <span>👥 Administrar Base de Usuarios</span>
          <span>→</span>
        </button>
        <button
          onClick={() => router.push("/admin/moderacion")}
          className="p-4 bg-primary text-background border-4 border-text font-mono font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex justify-between items-center cursor-pointer"
        >
          <span>🛡️ Configuración de Fees y Moderación</span>
          <span>→</span>
        </button>
      </div>

      <div className="mb-8">
        <p className="font-mono text-xs font-black uppercase tracking-wider text-text-soft mb-3">
          🌐 MONITOREO DE PLATAFORMA INFRAESTRUCTURA
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {servicios.map((serv, idx) => (
            <div
              key={idx}
              className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center font-mono text-xs"
            >
              <span className="font-bold">{serv.name}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-black border border-black ${serv.color}`}
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

      <div className="flex border-b-2 border-text mb-6 gap-2 overflow-x-auto pb-0">
        {(["HOY", "7DIAS", "MES", "ANUAL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setRangoTime(tab)}
            className={`pb-3 px-5 font-black text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer border-t-2 border-x-2 ${
              rangoTime === tab
                ? "bg-text text-surface border-text translate-y-0.5"
                : "border-transparent text-text-soft hover:text-text bg-surface/40"
            }`}
          >
            {tab === "7DIAS" ? "📅 ÚLTIMOS 7 DÍAS" : `📊 REPORTE ${tab}`}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-text-soft text-[10px] font-mono font-black uppercase tracking-wider">
              Volumen Bruto Procesado (GMV)
            </p>
            <p
              className={`text-3xl md:text-4xl font-black text-text mt-2 font-mono transition-opacity ${loadingMetrics ? "opacity-40" : "opacity-100"}`}
            >
              ${gmvActual.toLocaleString("es-AR")}
            </p>
            <span className="text-[9px] font-mono text-success bg-success/10 border border-success/30 px-2 py-0.5 mt-3 inline-block font-black">
              METRICAS EN VIVO ({rangoTime})
            </span>
          </div>

          <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-text-soft text-[10px] font-mono font-black uppercase tracking-wider">
              Neto Retenido Ticketera
            </p>
            <p
              className={`text-3xl md:text-4xl font-black text-primary mt-2 font-mono transition-opacity ${loadingMetrics ? "opacity-40" : "opacity-100"}`}
            >
              ${netoTicketera.toLocaleString("es-AR")}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="25"
                value={comision}
                onChange={(e) => setComision(Number(e.target.value))}
                className="accent-primary cursor-pointer w-24 h-1.5 bg-background border border-text/20"
              />
              <span className="font-mono text-[10px] text-text-soft uppercase font-bold">
                Fee Simulación: {comision}%
              </span>
            </div>
          </div>

          <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:col-span-2 lg:col-span-1">
            <p className="text-text-soft text-[10px] font-mono font-black uppercase tracking-wider">
              Distribución a Productores
            </p>
            <p
              className={`text-3xl md:text-4xl font-black text-text mt-2 font-mono transition-opacity ${loadingMetrics ? "opacity-40" : "opacity-100"}`}
            >
              ${netoProductores.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] font-mono text-text-soft uppercase mt-3 font-bold">
              Tickets validados:{" "}
              <span className="text-text font-black">
                {entradasActuales} uds
              </span>
            </p>
          </div>
        </div>

        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-text pb-3 mb-4">
            <h3 className="font-black text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${logsPausados ? "bg-amber-500" : "bg-success animate-ping"}`}
              ></span>
              AUDITORÍA LOGS CONTROLLER {logsPausados && "(CONGELADO)"}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex border border-text font-mono text-[10px] font-bold">
                {(["ALL", "SUCCESS", "WARN", "CRITICAL"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroLogActivo(f)}
                    className={`px-2 py-0.5 cursor-pointer ${filtroLogActivo === f ? "bg-text text-surface" : "bg-background text-text hover:bg-surface"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setLogsPausados(!logsPausados)}
                className={`px-3 py-0.5 border-2 border-text font-mono text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all ${
                  logsPausados
                    ? "bg-success text-black animate-pulse"
                    : "bg-red-500 text-white"
                }`}
              >
                {logsPausados ? "▶️ REANUDAR" : "⏸️ PAUSAR LIVE"}
              </button>
            </div>
          </div>

          <div className="font-mono text-xs space-y-2.5 max-h-60 overflow-y-auto bg-background/50 p-4 border-2 border-text/20">
            {logsFiltrados.length > 0 ? (
              logsFiltrados.map((log) => (
                <p
                  key={log.id}
                  className="text-text leading-relaxed uppercase break-all animate-fadeIn"
                >
                  <span className="text-neutral-500 font-bold mr-2">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-black mr-2 border border-black ${
                      log.type === "SUCCESS"
                        ? "bg-success text-black"
                        : log.type === "WARN"
                          ? "bg-secondary text-black"
                          : log.type === "CRITICAL"
                            ? "bg-red-500 text-white"
                            : "bg-text text-surface"
                    }`}
                  >
                    {log.type}
                  </span>
                  {log.message}
                </p>
              ))
            ) : (
              <p className="text-center text-text-soft text-[10px] uppercase py-4">
                No hay logs de tipo [{filtroLogActivo}] en el búfer actual.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
