"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Percent,
  Wallet,
  DollarSign,
  Activity,
  RefreshCw,
  Layers,
  Search,
  Download,
  Loader2,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Filter,
  Flame,
  Terminal,
} from "lucide-react";

type RangoTemporal = "HOY" | "7DIAS" | "MES";
type FiltroLiquidacion = "ALL" | "PENDIENTE" | "LIQUIDADO";
type SubSeccion = "METRICAS" | "LIQUIDACIONES";

export default function FinanzasPage() {
  const router = useRouter();

  const {
    eventos,
    balancesProductores,
    liquidarProductor,
    comisionGlobal,
    setComisionGlobal,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<SubSeccion>("METRICAS");
  const [rangoTime, setRangoTime] = useState<RangoTemporal>("MES");
  const [filtroStatus, setFiltroStatus] = useState<FiltroLiquidacion>("ALL");
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [historialFees, setHistorialFees] = useState<
    { fecha: string; valor: number }[]
  >([]);
  const [busquedaEmail, setBusquedaEmail] = useState<string>("");
  const [procesandoTransferencia, setProcesandoTransferencia] = useState<
    string | null
  >(null);
  const [notificacionFinanciera, setNotificacionFinanciera] = useState<
    string | null
  >(null);

  useEffect(() => {
    setFiltroStatus(activeTab === "LIQUIDACIONES" ? "PENDIENTE" : "ALL");
  }, [activeTab]);

  useEffect(() => {
    setLoadingMetrics(true);
    const timer = setTimeout(() => setLoadingMetrics(false), 150);
    return () => clearTimeout(timer);
  }, [rangoTime]);

  const datosGrafico = useMemo(() => {
    const esquemas = {
      HOY: [
        { name: "00-06H", monto: 120000 },
        { name: "06-12H", monto: 340000 },
        { name: "12-18H", monto: 890000 },
        { name: "18-24H", monto: 145000 },
      ],
      "7DIAS": [
        { name: "LUN-MAR", monto: 650000 },
        { name: "MIE-JUE", monto: 980000 },
        { name: "VIE-SAB", monto: 2400000 },
        { name: "DOM", monto: 1100000 },
      ],
      MES: [
        { name: "SEM 1", monto: 1800000 },
        { name: "SEM 2", monto: 2200000 },
        { name: "SEM 3", monto: 3100000 },
        { name: "SEM 4", monto: 4500000 },
      ],
    };
    return esquemas[rangoTime];
  }, [rangoTime]);

  const handleFeeChange = (nuevoValor: number) => {
    setComisionGlobal(nuevoValor);
    const ahora = new Date();
    const timeStr = `${ahora.getHours().toString().padStart(2, "0")}:${ahora.getMinutes().toString().padStart(2, "0")}`;
    setHistorialFees((prev) => [
      { fecha: timeStr, valor: nuevoValor },
      ...prev.slice(0, 1),
    ]);
  };

  const totalCajaRealAprobado = useMemo(() => {
    return eventos
      .filter((e) => e.estado === "APROBADO")
      .reduce((acc, ev) => acc + ev.precioBase * ev.aforo, 0);
  }, [eventos]);

  const gmvCalculado = useMemo(() => {
    const base = totalCajaRealAprobado > 0 ? totalCajaRealAprobado : 3800000;
    const factores = { HOY: 0.08, "7DIAS": 0.35, MES: 1 };
    return Math.floor(base * factores[rangoTime]);
  }, [totalCajaRealAprobado, rangoTime]);

  const netoTicketera = (gmvCalculado * comisionGlobal) / 100;
  const netoProductores = gmvCalculado - netoTicketera;

  const metricasLiquidacion = useMemo(() => {
    return balancesProductores.reduce(
      (acc, bp) => {
        const comision = (bp.recaudacionBruta * comisionGlobal) / 100;
        const neto = bp.recaudacionBruta - comision;
        if (bp.estadoLiquidacion === "PENDIENTE") acc.pendiente += neto;
        else acc.liquidado += neto;
        return acc;
      },
      { pendiente: 0, liquidado: 0 },
    );
  }, [balancesProductores, comisionGlobal]);

  const balancesFiltrados = useMemo(() => {
    return balancesProductores.filter((bp) => {
      const cumpleStatus =
        filtroStatus === "ALL" || bp.estadoLiquidacion === filtroStatus;
      return (
        cumpleStatus &&
        bp.email.toLowerCase().includes(busquedaEmail.toLowerCase())
      );
    });
  }, [balancesProductores, filtroStatus, busquedaEmail]);

  const ejecutarTransferenciaPro = (email: string, montoNeto: number) => {
    setProcesandoTransferencia(email);
    setTimeout(() => {
      liquidarProductor(email);
      setProcesandoTransferencia(null);
      setNotificacionFinanciera(
        `DISPERSIÓN EXITOSA: $${Math.floor(montoNeto).toLocaleString("es-AR")} ENVIADOS`,
      );
      setTimeout(() => setNotificacionFinanciera(null), 4000);
    }, 1800);
  };

  const exportarReporteFinanciero = () => {
    setNotificacionFinanciera("GENERANDO REPORTE AUDITABLE CONTABLE (.CSV)...");
    setTimeout(() => {
      setNotificacionFinanciera(
        "DESCARGA COMPLETADA: boletoclick_ledger_export.csv",
      );
      setTimeout(() => setNotificacionFinanciera(null), 3000);
    }, 1200);
  };

  const activeThemeColor =
    activeTab === "METRICAS"
      ? "border-t-color-primary"
      : "border-t-color-accent";

  const statusColorBadge =
    filtroStatus === "PENDIENTE"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40"
      : filtroStatus === "LIQUIDADO"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
        : "bg-color-primary/10 text-color-primary border-color-border/40";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-color-bg text-color-text font-mono relative pb-20 selection:bg-color-text selection:text-color-background">
      {notificacionFinanciera && (
        <div className="fixed bottom-6 right-6 z-50 bg-color-text text-color-background border-4 border-color-border px-5 py-3 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transition-all duration-300">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>{notificacionFinanciera}</span>
        </div>
      )}

      <button
        onClick={() => router.push("/dashboard-admin")}
        className="group mb-6 inline-flex items-center gap-2 text-xs font-black uppercase border-2 border-color-border bg-color-surface px-4 py-2 shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_var(--border)] transition-all cursor-pointer"
      >
        <ArrowLeft size={12} className="text-color-primary" />
        <span>Volver a Consola</span>
      </button>

      <div className="mb-8 border-4 border-color-border bg-color-surface p-6 shadow-[5px_5px_0px_0px_var(--border)] relative transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl text-color-text font-black uppercase tracking-tight flex items-center gap-2">
              <Coins className="text-color-primary" size={26} />
              Métricas de Caja & Tasas
            </h1>
          </div>
        </div>
      </div>

      <div className="flex border-4 border-color-border mb-8 bg-color-surface p-1 max-w-md shadow-[4px_4px_0px_0px_var(--border)]">
        <button
          onClick={() => setActiveTab("METRICAS")}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
            activeTab === "METRICAS"
              ? "bg-color-primary text-color-background border-2 border-color-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "text-color-text-soft hover:text-color-text"
          }`}
        >
          📊 Balance de Caja
        </button>
        <button
          onClick={() => setActiveTab("LIQUIDACIONES")}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === "LIQUIDACIONES"
              ? "bg-color-accent text-color-background border-2 border-color-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "text-color-text-soft hover:text-color-text"
          }`}
        >
          💸 Liquidar Fondos
          <span className="bg-color-text text-color-background px-1.5 py-0.5 text-[9px] font-black transition-all">
            {
              balancesProductores.filter(
                (b) => b.estadoLiquidacion === "PENDIENTE",
              ).length
            }
          </span>
        </button>
      </div>

      {activeTab === "METRICAS" && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex gap-2">
            {(["HOY", "7DIAS", "MES"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRangoTime(tab)}
                className={`py-1.5 px-4 font-black text-xs uppercase border-2 border-color-border shadow-[2px_2px_0px_0px_var(--border)] transition-all cursor-pointer ${
                  rangoTime === tab
                    ? "bg-color-text text-color-background shadow-none translate-x-0.5 translate-y-0.5"
                    : "bg-color-surface text-color-text hover:bg-color-surface-2"
                }`}
              >
                {tab === "HOY"
                  ? "⏱️ Hoy"
                  : tab === "7DIAS"
                    ? "🗓️ Semana"
                    : "🎯 Mes"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-color-surface border-4 border-color-border p-5 shadow-[4px_4px_0px_0px_var(--border)] border-t-8 border-t-color-text hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
              <p className="text-color-text-soft text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={12} className="text-color-primary" /> Volumen
                Bruto Recaudado
              </p>
              <p
                className={`text-2xl font-black text-color-text mt-3 transition-opacity ${loadingMetrics ? "opacity-30" : "opacity-100"}`}
              >
                ${gmvCalculado.toLocaleString("es-AR")}
              </p>
            </div>

            <div className="bg-color-surface border-4 border-color-border p-5 shadow-[4px_4px_0px_0px_var(--border)] border-t-8 border-t-color-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
              <p className="text-color-primary dark:text-color-text text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Percent size={12} /> Fee Retenido ({comisionGlobal}%)
              </p>
              <p
                className={`text-2xl font-black text-color-text mt-3 transition-opacity ${loadingMetrics ? "opacity-30" : "opacity-100"}`}
              >
                ${netoTicketera.toLocaleString("es-AR")}
              </p>
            </div>

            <div className="bg-color-surface border-4 border-color-border p-5 shadow-[4px_4px_0px_0px_var(--border)] border-t-8 border-t-color-accent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
              <p className="text-color-accent text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Wallet size={12} /> Neto Destinado a Productores
              </p>
              <p
                className={`text-2xl font-black text-color-text mt-3 transition-opacity ${loadingMetrics ? "opacity-30" : "opacity-100"}`}
              >
                ${netoProductores.toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="bg-color-surface border-4 border-color-border p-5 shadow-[4px_4px_0px_0px_var(--border)] lg:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-color-text mb-6 flex items-center gap-2 border-b-2 border-color-border/10 pb-2">
                <DollarSign size={14} className="text-color-primary" />{" "}
                Historial de Cajas Liquidadas
              </h3>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datosGrafico}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: "var(--text-soft)",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                      axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
                    />
                    <YAxis
                      tick={{ fill: "var(--text-soft)", fontSize: 10 }}
                      axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-surface-2)", opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="bg-color-text text-color-background border-2 border-color-border p-2 font-mono text-[11px] font-black uppercase">
                              <p className="opacity-70">
                                {payload[0].payload.name}
                              </p>
                              <p className="font-black mt-0.5 text-color-accent">
                                $
                                {Number(payload[0].value).toLocaleString(
                                  "es-AR",
                                )}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="monto"
                      fill="var(--primary)"
                      stroke="var(--border)"
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-color-surface border-4 border-color-border p-5 shadow-[4px_4px_0px_0px_var(--border)] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-color-text flex items-center gap-2 border-b-2 border-color-border/10 pb-2">
                <Layers size={14} className="text-color-accent" /> Tasa Comisión
              </h3>
              <div className="border-2 border-color-border bg-color-surface-2 p-3 flex items-center justify-between shadow-[2px_2px_0px_0px_var(--border)]">
                <span className="text-xs font-black uppercase flex items-center gap-1">
                  <Flame size={12} className="text-color-accent" /> Margen Base:
                </span>
                <div className="flex items-center gap-1 bg-color-surface px-2 py-0.5 border-2 border-color-border">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={comisionGlobal}
                    onChange={(e) => handleFeeChange(Number(e.target.value))}
                    className="w-10 text-center font-mono font-black bg-transparent text-xs focus:outline-none text-color-text"
                  />
                  <span className="text-xs font-black">%</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={comisionGlobal}
                onChange={(e) => handleFeeChange(Number(e.target.value))}
                className="w-full accent-accent dark:accent-primary h-2 bg-color-surface-2 border-2 border-color-border cursor-pointer"
              />
              <div className="text-[10px] text-color-text-soft uppercase space-y-1.5 pt-2 font-bold border-t border-color-border/10">
                <p className="font-black text-color-text text-[9px] flex items-center gap-1 opacity-70">
                  <RefreshCw size={10} /> HISTORIAL RECIENTE:
                </p>
                {historialFees.map((h, i) => (
                  <p
                    key={i}
                    className="font-mono bg-color-surface-2 px-2 py-1 border border-color-border/30 flex justify-between"
                  >
                    <span>⏱️ [{h.fecha}]</span> <span>{h.valor}%</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "LIQUIDACIONES" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border-4 border-color-border bg-color-surface p-4 shadow-[4px_4px_0px_0px_var(--border)] border-l-8 border-l-amber-500">
              <span className="text-[10px] text-color-text-soft uppercase font-black block tracking-wider">
                Pasivos en Espera
              </span>
              <span className="text-xl font-black text-color-text block mt-1">
                ${metricasLiquidacion.pendiente.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="border-4 border-color-border bg-color-surface p-4 shadow-[4px_4px_0px_0px_var(--border)] border-l-8 border-l-emerald-500">
              <span className="text-[10px] text-color-text-soft uppercase font-black block tracking-wider">
                Historial Despachado
              </span>
              <span className="text-xl font-black text-color-text block mt-1">
                ${metricasLiquidacion.liquidado.toLocaleString("es-AR")}
              </span>
            </div>
            <button
              onClick={exportarReporteFinanciero}
              className="border-4 border-color-border bg-color-text text-color-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-color-accent hover:text-color-background transition-all font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={14} /> Exportar Reporte (.CSV)
            </button>
          </div>

          <div
            className={`bg-color-surface border-4 border-color-border p-6 shadow-[5px_5px_0px_0px_var(--border)] border-t-8 transition-all ${activeThemeColor}`}
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b-4 border-color-border pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black uppercase border-2 border-color-border ${statusColorBadge}`}
                  >
                    {filtroStatus === "ALL"
                      ? "Reporte Pleno"
                      : `Saldos: ${filtroStatus}`}
                  </span>
                </div>
                <p className="text-[10px] text-color-text-soft uppercase font-bold mt-1">
                  Desglose auditable por cuenta e impuestos retenidos
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="flex items-center bg-color-surface border-2 border-color-border px-3 py-1.5 text-[11px] gap-2 min-w-56 shadow-[2px_2px_0px_0px_var(--border)]">
                  <Search size={12} className="text-color-text-soft" />
                  <input
                    type="text"
                    placeholder="Filtrar por id o correo..."
                    value={busquedaEmail}
                    onChange={(e) => setBusquedaEmail(e.target.value)}
                    className="bg-transparent font-bold focus:outline-none w-full text-color-text placeholder:text-color-text-soft/30 text-xs"
                  />
                </div>

                <div className="flex border-2 border-color-border text-[10px] font-black bg-color-surface-2 p-0.5 shadow-[2px_2px_0px_0px_var(--border)]">
                  {(["ALL", "PENDIENTE", "LIQUIDADO"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFiltroStatus(st)}
                      className={`px-3 py-1.5 cursor-pointer uppercase font-black text-[9px] transition-all flex items-center gap-1 ${
                        filtroStatus === st
                          ? "bg-color-text text-color-background font-extrabold"
                          : "bg-color-surface text-color-text hover:bg-color-surface-2"
                      }`}
                    >
                      {filtroStatus === st && <Filter size={10} />}
                      {st === "ALL" ? "Todos" : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {procesandoTransferencia && (
              <div className="bg-color-accent/10 border-2 border-color-accent p-3 text-xs text-color-accent font-black uppercase tracking-wide flex items-center gap-3 animate-pulse mb-6">
                <Loader2 size={14} className="animate-spin" />
                <span>
                  Enlazando pasarela con el nodo bancario del destinatario...
                </span>
              </div>
            )}

            <div className="overflow-x-auto border-2 border-color-border bg-color-surface-2/10">
              <table className="w-full border-collapse text-xs min-w-180">
                <thead>
                  <tr className="bg-color-surface-2 text-color-text font-black uppercase text-[10px] border-b-2 border-color-border">
                    <th className="p-4 text-left tracking-wider border-r border-color-border/30 bg-color-surface">
                      Productor Responsable
                    </th>
                    <th className="p-4 text-right tracking-wider border-r border-color-border/30 w-48 bg-color-surface">
                      Recaudación Bruta
                    </th>
                    <th className="p-4 text-right tracking-wider border-r border-color-border/30 w-44 bg-color-surface">
                      Retención ({comisionGlobal}%)
                    </th>
                    <th className="p-4 text-right tracking-wider border-r border-color-border/30 w-48 bg-color-surface-2 text-color-primary dark:text-color-text">
                      Monto Neto Líquido
                    </th>
                    <th className="p-4 text-center tracking-wider w-40 bg-color-surface">
                      Estado / Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono divide-y border-b border-color-border/30 divide-color-border/20">
                  {balancesFiltrados.length > 0 ? (
                    balancesFiltrados.map((bp, idx) => {
                      const comisionDinamica =
                        (bp.recaudacionBruta * comisionGlobal) / 100;
                      const netoDinamico =
                        bp.recaudacionBruta - comisionDinamica;
                      const estaCargando = procesandoTransferencia === bp.email;

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-color-surface-2/40 transition-colors group"
                        >
                          <td className="p-4 text-left font-sans lowercase break-all font-bold text-color-text border-r border-color-border/10">
                            {bp.email}
                          </td>
                          <td className="p-4 text-right font-black border-r border-color-border/10">
                            ${bp.recaudacionBruta.toLocaleString("es-AR")}
                          </td>
                          <td className="p-4 text-right text-color-text-soft border-r border-color-border/10">
                            ${comisionDinamica.toLocaleString("es-AR")}
                          </td>
                          <td className="p-4 text-right font-black text-sm border-r border-color-border/10 bg-color-primary/5">
                            ${netoDinamico.toLocaleString("es-AR")}
                          </td>
                          <td className="p-4 text-center">
                            {bp.estadoLiquidacion === "LIQUIDADO" ? (
                              <div className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 uppercase tracking-wider">
                                <ShieldCheck size={11} /> Despachado
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  ejecutarTransferenciaPro(
                                    bp.email,
                                    netoDinamico,
                                  )
                                }
                                disabled={
                                  bp.recaudacionBruta === 0 ||
                                  estaCargando ||
                                  procesandoTransferencia !== null
                                }
                                className={`font-black text-[9px] px-4 py-2 border-2 border-color-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all uppercase inline-flex items-center justify-center gap-1.5 ${
                                  bp.recaudacionBruta === 0 ||
                                  estaCargando ||
                                  procesandoTransferencia !== null
                                    ? "opacity-30 cursor-not-allowed bg-color-surface shadow-none text-color-text-soft"
                                    : "bg-color-accent text-color-background dark:bg-color-primary dark:text-color-background hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                                }`}
                              >
                                {estaCargando ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  "⚡ Dispersar"
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-color-text-soft text-[10px] uppercase font-black tracking-widest border-2 border-dashed border-color-border/20"
                      >
                        Ningún registro coincide con el segmento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
