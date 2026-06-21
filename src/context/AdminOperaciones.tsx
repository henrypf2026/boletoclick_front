"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useAdmin,
  EventoPendiente,
  BalanceProductor,
} from "@/context/AdminContext";

type SubModulo = "MODERACION" | "FINANZAS";

export default function AdminOperaciones() {
  const router = useRouter();

  // Consumimos exactamente lo que creaste en tu AdminContext
  const {
    eventos,
    setEventos,
    balancesProductores,
    liquidarProductor,
    comisionGlobal,
    setComisionGlobal,
  } = useAdmin();

  // Estado para alternar entre sub-módulos
  const [moduloActivo, setModuloActivo] = useState<SubModulo>("MODERACION");
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const triggerNotificacion = (mensaje: string) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative overflow-x-hidden">
      {/* ALERTA FLOTANTE SYSTEM */}
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 bg-text text-surface border-4 border-text px-4 py-3 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚡ {notificacion}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="border-b-4 border-text pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <button
            onClick={() => router.push("/dashboard-admin")}
            className="text-xs font-bold uppercase underline mb-2 block hover:text-text-soft cursor-pointer"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="uppercase font-black text-3xl tracking-tighter">
            Operaciones y Tesorería
          </h1>
        </div>

        {/* AJUSTE DE COMISIÓN GLOBAL (NEOBRUTALISTA TRABAJANDO CON TU CONTEXTO) */}
        <div className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 self-start md:self-auto">
          <div>
            <p className="text-[9px] font-black text-text-soft uppercase">
              Fee de Plataforma
            </p>
            <p className="text-xs font-black uppercase">Comisión Global</p>
          </div>
          <div className="flex items-center border-2 border-text bg-background">
            <input
              type="number"
              min={0}
              max={100}
              value={comisionGlobal}
              onChange={(e) => setComisionGlobal(Number(e.target.value))}
              className="w-14 text-center font-black text-sm p-1 focus:outline-none"
            />
            <span className="font-black text-xs px-2 border-l-2 border-text bg-text text-surface p-1.5">
              %
            </span>
          </div>
        </div>
      </div>

      {/* SECTOR DE PESTAÑAS (CONTROL DE SUBMÓDULOS) */}
      <div className="grid grid-cols-2 border-2 border-text font-black text-xs md:text-sm">
        <button
          onClick={() => setModuloActivo("MODERACION")}
          className={`py-3.5 uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${moduloActivo === "MODERACION" ? "bg-text text-surface" : "bg-surface text-text hover:bg-text/5"}`}
        >
          🎪 Moderación de Eventos (
          {eventos.filter((e) => e.estado === "PENDIENTE").length} Pendientes)
        </button>
        <button
          onClick={() => setModuloActivo("FINANZAS")}
          className={`py-3.5 uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${moduloActivo === "FINANZAS" ? "bg-text text-surface" : "bg-surface text-text hover:bg-text/5"}`}
        >
          💸 Auditoría Financiera y Pagos
        </button>
      </div>

      {/* CONTENEDOR DINÁMICO */}
      <div className="pt-2">
        {moduloActivo === "MODERACION" ? (
          <div className="border-2 border-dashed border-text/30 p-8 text-center uppercase text-xs text-text-soft font-bold">
            [Espacio reservado para el Panel de Eventos - Listo para meterle
            mano]
          </div>
        ) : (
          <div className="border-2 border-dashed border-text/30 p-8 text-center uppercase text-xs text-text-soft font-bold">
            [Espacio reservado para el Panel de Finanzas - Listo para meterle
            mano]
          </div>
        )}
      </div>
    </div>
  );
}
