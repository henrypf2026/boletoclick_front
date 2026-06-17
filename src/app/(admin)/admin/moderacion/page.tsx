"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

export default function AdminModeracion() {
  const router = useRouter();
  const {
    comisionGlobal,
    setComisionGlobal,
    eventos,
    setEventos,
    balancesProductores,
    liquidarProductor,
  } = useAdmin();

  const [precioSimulado, setPrecioSimulado] = useState(15000);
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const triggerNotificacion = (mensaje: string) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 3500);
  };

  const resolverModeracion = (
    id: number,
    titulo: string,
    nuevoEstado: "APROBADO" | "RECHAZADO",
  ) => {
    setEventos(
      eventos.map((ev) => (ev.id === id ? { ...ev, estado: nuevoEstado } : ev)),
    );
    triggerNotificacion(
      `EVENTO ${nuevoEstado} EXITOSAMENTE: "${titulo.toUpperCase()}"`,
    );
  };

  const simulacionFinanciera = useMemo(() => {
    const cargoServicio = (precioSimulado * comisionGlobal) / 100;
    return {
      feePlataforma: cargoServicio,
      precioFinalVenta: precioSimulado + cargoServicio,
    };
  }, [comisionGlobal, precioSimulado]);

  return (
    <div className="min-h-screen bg-background text-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 bg-text text-surface border-4 border-primary px-4 py-3 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up">
          ⚡ {notificacion}
        </div>
      )}

      <div className="border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button
            onClick={() => router.push("/dashboard-admin")}
            className="text-xs font-bold uppercase underline mb-2 block hover:text-primary active:scale-95 transition-transform origin-left cursor-pointer"
          >
            ← Volver al Dashboard Principal
          </button>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Moderación & Finanzas
          </h1>
        </div>
        <div className="bg-surface border-2 border-text px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase transition-all hover:-translate-y-0.5">
          Tasa Activa:{" "}
          <span className="text-primary font-black text-sm">
            {comisionGlobal}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="uppercase font-black text-sm border-b-2 border-text pb-2 flex items-center gap-2">
              <span>⚙️</span> Ajuste de Comisión
            </h2>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-text-soft uppercase">
                Porcentaje Retención Plataforma
              </label>
              <div className="flex items-center bg-background border-2 border-text px-4 py-2 focus-within:border-primary transition-colors">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={comisionGlobal}
                  onChange={(e) =>
                    setComisionGlobal(
                      Math.min(50, Math.max(0, Number(e.target.value))),
                    )
                  }
                  className="bg-transparent font-black text-text text-2xl w-16 text-center focus:outline-none"
                />
                <div className="text-text-soft text-[10px] font-medium ml-3 border-l-2 border-text/10 pl-3 leading-tight">
                  Modifica las liquidaciones B2B y el cobro final al cliente en
                  tiempo real.
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={comisionGlobal}
                onChange={(e) => setComisionGlobal(Number(e.target.value))}
                className="w-full accent-primary bg-text/10 h-1 cursor-pointer mt-2 active:scale-[0.99] transition-transform"
              />
            </div>
          </div>

          <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="uppercase font-black text-xs text-text-soft tracking-widest border-b border-text/10 pb-2">
              📊 Simulador de Entrada
            </h3>
            <div>
              <label className="block text-[9px] font-bold text-text-soft uppercase mb-1">
                Precio Neto del Ticket
              </label>
              <div className="flex border-2 border-text bg-background p-2.5 text-sm focus-within:border-secondary transition-colors">
                <span className="text-text-soft mr-2 font-black">$</span>
                <input
                  type="number"
                  value={precioSimulado}
                  onChange={(e) => setPrecioSimulado(Number(e.target.value))}
                  className="w-full bg-transparent font-black focus:outline-none text-text"
                />
              </div>
            </div>
            <div className="bg-background border-2 border-text p-4 text-xs space-y-2 font-bold">
              <div className="flex justify-between">
                <span className="text-text-soft">Al productor:</span>
                <span>${precioSimulado.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Cargo por Servicio ({comisionGlobal}%):</span>
                <span>
                  +${simulacionFinanciera.feePlataforma.toLocaleString()}
                </span>
              </div>
              <div className="border-t-2 border-dashed border-text/20 pt-2 flex justify-between text-sm font-black uppercase text-secondary">
                <span>Precio Final al Público:</span>
                <span>
                  ${simulacionFinanciera.precioFinalVenta.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h2 className="uppercase font-black text-sm border-b-2 border-text pb-2">
            🎫 Control de Eventos Entrantes
          </h2>
          <div className="space-y-4">
            {eventos.map((ev) => {
              const volumenEstimado = ev.precioBase * ev.aforo;
              const isRechazado = ev.estado === "RECHAZADO";

              return (
                <div
                  key={ev.id}
                  className={`border-2 border-text p-4 bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${
                    isRechazado ? "opacity-60 bg-red-50/10" : ""
                  } ${ev.estado === "APROBADO" ? "border-l-4 border-l-green-600" : ""}`}
                >
                  <div className="flex flex-col md:flex-row justify-between border-b border-dashed border-text/30 pb-2.5 mb-3">
                    <div>
                      <span className="text-[9px] bg-secondary text-text font-black px-2 py-0.5 border border-text uppercase mb-1.5 inline-block">
                        {ev.categoria}
                      </span>
                      <h4
                        className={`font-black text-base uppercase tracking-tight ${isRechazado ? "line-through text-text-soft" : "text-text"}`}
                      >
                        {isRechazado ? "🚫 " : ""}
                        {ev.titulo}
                      </h4>
                      <span className="text-[10px] text-text-soft font-medium">
                        Productor Asociado:{" "}
                        <span className="text-text underline font-bold">
                          {ev.productor}
                        </span>
                      </span>
                    </div>
                    <div
                      className={`font-black text-lg pt-1 md:pt-0 ${isRechazado ? "text-text-soft/60 line-through" : "text-primary"}`}
                    >
                      ${ev.precioBase.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal text-text-soft">
                        NETO
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[10px] my-3 font-bold text-text-soft uppercase">
                    <div className="bg-surface p-1.5 border border-text/10">
                      📍 Lugar:{" "}
                      <span className="text-text font-black block">
                        {ev.ubicacion}
                      </span>
                    </div>
                    <div className="bg-surface p-1.5 border border-text/10">
                      👥 Aforo Máx:{" "}
                      <span className="text-text font-black block">
                        {ev.aforo.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-surface p-1.5 border border-text/10 col-span-2 md:col-span-1">
                      💰 Caja Proyectada:{" "}
                      <span
                        className={`font-black block text-xs ${isRechazado ? "text-text-soft line-through" : "text-secondary"}`}
                      >
                        ${volumenEstimado.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-text/10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-text-soft uppercase">
                        Estado actual:
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black border uppercase transition-all ${
                          ev.estado === "PENDIENTE"
                            ? "bg-yellow-500/20 text-yellow-600 border-yellow-600/30"
                            : ev.estado === "APROBADO"
                              ? "bg-green-500/20 text-green-600 border-green-600/30"
                              : "bg-red-500 text-white border-black"
                        }`}
                      >
                        {ev.estado}
                      </span>
                    </div>

                    {ev.estado === "PENDIENTE" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            resolverModeracion(ev.id, ev.titulo, "RECHAZADO")
                          }
                          className="px-3 py-1 border-2 border-red-600 text-[10px] font-black text-red-600 bg-surface hover:bg-red-600 hover:text-white active:scale-95 transition-all cursor-pointer uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        >
                          ✕ Rechazar
                        </button>
                        <button
                          onClick={() =>
                            resolverModeracion(ev.id, ev.titulo, "APROBADO")
                          }
                          className="px-3 py-1 border-2 border-text text-[10px] font-black bg-text text-surface hover:bg-primary hover:text-black active:scale-95 transition-all cursor-pointer uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        >
                          ✓ Autorizar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="border-b-2 border-text pb-3">
          <h2 className="uppercase font-black text-lg tracking-tight">
            💰 Liquidaciones y Balances de Productores (B2B)
          </h2>
          <p className="text-[10px] text-text-soft uppercase font-bold">
            Cuentas corrientes de marcas aliadas calculadas de forma dinámica.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-175 text-xs">
            <thead>
              <tr className="bg-text text-surface font-black text-[10px] uppercase tracking-wider">
                <th className="p-3.5 border-r border-surface/20">
                  Identidad Comercial
                </th>
                <th className="p-3.5 border-r border-surface/20">
                  Recaudación Bruta
                </th>
                <th className="p-3.5 border-r border-surface/20">
                  Retención Plataforma ({comisionGlobal}%)
                </th>
                <th className="p-3.5 border-r border-surface/20">
                  Monto Neto a Transferir
                </th>
                <th className="p-3.5 text-right">Estado Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text/20 font-bold bg-background">
              {balancesProductores.map((bp) => (
                <tr
                  key={bp.email}
                  className="hover:bg-text/5 transition-colors duration-150"
                >
                  <td className="p-3.5 border-r border-text/10 font-black text-text">
                    {bp.email}
                  </td>
                  <td className="p-3.5 border-r border-text/10 text-text-soft">
                    ${bp.recaudacionBruta.toLocaleString()}
                  </td>
                  <td className="p-3.5 border-r border-text/10 text-red-500">
                    -${bp.comisionPlataforma.toLocaleString()}
                  </td>
                  <td className="p-3.5 border-r border-text/10 text-text font-black text-sm">
                    ${bp.netoAPagar.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right">
                    {bp.estadoLiquidacion === "LIQUIDADO" ? (
                      <span className="inline-block bg-green-600 text-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        ✓ TRANSFERIDO
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (bp.recaudacionBruta === 0) {
                            triggerNotificacion(
                              `ERROR: EL BALANCE DE "${bp.email.toUpperCase()}" ESTÁ EN VACÍO ($0)`,
                            );
                            return;
                          }
                          liquidarProductor(bp.email);
                          triggerNotificacion(
                            `TRANSFERENCIA FINANCIERA EMITIDA: $${bp.netoAPagar.toLocaleString()} ENVIADOS A ${bp.email}`,
                          );
                        }}
                        className={`border-2 border-text px-3 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all cursor-pointer ${
                          bp.recaudacionBruta === 0
                            ? "bg-background text-text-soft opacity-40 cursor-not-allowed shadow-none hover:translate-y-0 active:scale-100"
                            : "bg-primary text-black hover:bg-text hover:text-surface"
                        }`}
                      >
                        Ejecutar Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
