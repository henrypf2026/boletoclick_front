"use client";

import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<
    "finanzas" | "usuarios" | "moderacion"
  >("finanzas");
  const [comision, setComision] = useState(12);
  const [loading, setLoading] = useState(false);
  const [filtroEmail, setFiltroEmail] = useState("");

  // Estado para un Toast/Notificación del sistema que se muestra al realizar acciones críticas como promover usuarios o actualizar fees
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState([
    { id: 1, email: "cosme.fulanito@gmail.com", rol: "USER" },
    { id: 2, email: "baba.management@empresa.com", rol: "PRODUCER" },
    { id: 3, email: "lucas.dev@boletoclick.com", rol: "USER" },
  ]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [seccionActiva]);

  const triggerNotificacion = (mensaje: string) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 3000);
  };

  const promoverAProductor = (id: number, email: string) => {
    setUsuarios(
      usuarios.map((u) => (u.id === id ? { ...u, rol: "PRODUCER" } : u)),
    );
    triggerNotificacion(`SISTEMA: ROL DE [${email}] ACTUALIZADO A PRODUCER`);
  };

  const actualizarFee = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotificacion(
      `CONFIGURACIÓN: FEE GLOBAL FIJADO EN ${comision}% NETO`,
    );
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(filtroEmail.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-background text-text transition-colors relative">
      {notificacion && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl bg-primary text-background border-4 border-black p-4 font-mono text-xs font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-fade-in-down">
          <div className="flex items-center justify-between">
            <span>⚡ {notificacion}</span>
            <button
              onClick={() => setNotificacion(null)}
              className="font-bold border border-black px-1 ml-2 bg-background text-text cursor-pointer"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Header Consola */}
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Consola de Control Global
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Auditoría de negocio, pasarela y control operacional de roles
          </p>
        </div>
        <div className="bg-red-500 text-white border-2 border-text px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          MODO: ROOT_ADMIN
        </div>
      </div>

      {/* Selector de Navegación */}
      <div className="flex border-b-2 border-text mb-6 gap-2 overflow-x-auto pb-0">
        {(
          [
            { id: "finanzas", label: "💼 ESTADÍSTICAS GLOBALES" },
            { id: "usuarios", label: "👥 MODERACIÓN DE ROLES" },
            { id: "moderacion", label: "🛡️ AJUSTES DE FEE" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSeccionActiva(tab.id)}
            className={`pb-3 px-4 font-black text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer border-t-2 border-x-2 ${
              seccionActiva === tab.id
                ? "bg-text text-surface border-text translate-y-0.5"
                : "border-transparent text-text-soft hover:text-text bg-surface/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER PRINCIPAL CON CONTROL DE CARGA*/}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-28 bg-surface border-2 border-text w-full"></div>
            <div className="h-28 bg-surface border-2 border-text w-full"></div>
          </div>
          <div className="h-40 bg-surface border-2 border-text w-full"></div>
        </div>
      ) : (
        <>
          {seccionActiva === "finanzas" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-surface border-2 border-text p-6 rounded-none shadow-[4px_4px_0px_0px_var(--color-text)]">
                  <p className="text-text-soft text-xs font-mono font-bold uppercase tracking-wider">
                    Volumen Bruto Procesado (GMV)
                  </p>
                  <p className="text-4xl font-black text-text mt-2 font-mono">
                    $2.450.000
                  </p>
                  <span className="text-[10px] font-mono text-success bg-success/10 border border-success/30 px-1.5 py-0.5 mt-2 inline-block font-bold">
                    ↑ +24% ESTE MES
                  </span>
                </div>
                <div className="bg-surface border-2 border-text p-6 rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] relative overflow-hidden">
                  <p className="text-text-soft text-xs font-mono font-bold uppercase tracking-wider">
                    Neto Retenido Ticketera ({comision}%)
                  </p>
                  <p className="text-4xl font-black text-primary mt-2 font-mono">
                    ${((2450000 * comision) / 100).toLocaleString("es-AR")}
                  </p>
                  {/* Control rápido interactivo en finanzas */}
                  <div className="mt-3 pt-2 border-t border-text/10 flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-text-soft">
                      Ajuste rápido:
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={comision}
                      onChange={(e) => setComision(Number(e.target.value))}
                      className="accent-primary cursor-pointer w-24 h-1.5 bg-surface-2 border border-text/20"
                    />
                    <span className="font-mono text-[11px] font-black">
                      {comision}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock de transacciones */}
              <div className="bg-surface border-2 border-text p-6 rounded-none shadow-[4px_4px_0px_0px_var(--color-text)]">
                <div className="flex justify-between items-center border-b-2 border-text pb-2 mb-4">
                  <h3 className="font-black text-xs uppercase tracking-wider font-mono">
                    ⚡ LOG DE OPERACIONES DE RED
                  </h3>
                  <span className="font-mono text-[10px] uppercase text-text-soft animate-pulse">
                    ESCUCHANDO EVENTOS...
                  </span>
                </div>
                <div className="font-mono text-xs space-y-2 text-text-soft max-h-48 overflow-y-auto">
                  <p className="text-text">
                    <span className="text-neutral-500">[16:41:02]</span>{" "}
                    SUCCESS: Webhook procesado - Pago Recibido - FAC-9843
                    ($44.000)
                  </p>
                  <p className="text-text">
                    <span className="text-neutral-500">[16:39:15]</span> INFO:
                    Generando Token de Acceso para QR-DK-992
                  </p>
                  <p className="text-text">
                    <span className="text-neutral-500">[16:22:50]</span> WARN:
                    Reintento de pasarela en pasarela MercadoPago (Id: 8821)
                  </p>
                  <p className="text-neutral-400">
                    --- Fin del flujo de eventos local ---
                  </p>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "usuarios" && (
            <div className="space-y-4">
              {/* Buscador de usuarios integrado */}
              <div className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_var(--color-text)] flex gap-2">
                <input
                  type="text"
                  placeholder="🔎 FILTRAR CUENTAS POR CORREO ELECTRÓNICO..."
                  value={filtroEmail}
                  onChange={(e) => setFiltroEmail(e.target.value)}
                  className="w-full bg-background border-2 border-text p-2 font-mono text-xs font-bold uppercase focus:outline-none"
                />
              </div>

              <div className="bg-surface border-2 border-text rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-text text-surface border-b-2 border-text text-xs font-black uppercase font-mono">
                        <th className="p-4">ID / Correo Cuenta</th>
                        <th className="p-4">Nivel de Acceso</th>
                        <th className="p-4 text-right">Acciones de Red</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-text text-sm bg-surface">
                      {usuariosFiltrados.length > 0 ? (
                        usuariosFiltrados.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-text/5 transition-colors"
                          >
                            <td className="p-4 font-black font-mono text-text">
                              <span className="text-text-soft text-xs mr-2 font-normal">
                                #{u.id}
                              </span>
                              {u.email}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 font-mono text-xs font-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                                  u.rol === "PRODUCER"
                                    ? "bg-primary text-background"
                                    : "bg-background text-text-soft"
                                }`}
                              >
                                {u.rol}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {u.rol === "USER" ? (
                                <button
                                  onClick={() =>
                                    promoverAProductor(u.id, u.email)
                                  }
                                  className="bg-transparent border-2 border-text hover:bg-primary hover:text-background font-mono font-black px-3 py-1 text-xs uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                                >
                                  PROMOVER A PRODUCER +
                                </button>
                              ) : (
                                <span className="text-xs font-mono font-bold text-neutral-400 uppercase italic">
                                  Permisos Máximos
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-8 text-center font-mono text-xs uppercase text-text-soft bg-surface"
                          >
                            Ninguna cuenta coincide con la búsqueda
                            especificada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "moderacion" && (
            <div className="bg-surface border-2 border-text p-6 rounded-none max-w-md shadow-[4px_4px_0px_0px_var(--color-text)] space-y-4">
              <h2 className="uppercase font-black text-xl border-b-2 border-text pb-2">
                Comisión de Plataforma
              </h2>
              <form onSubmit={actualizarFee} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                    Fee por servicio operativo global
                  </label>
                  <div className="flex items-center bg-background border-2 border-text px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-within:ring-2 focus-within:ring-primary">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={comision}
                      onChange={(e) => setComision(Number(e.target.value))}
                      className="bg-transparent font-black text-text font-mono text-2xl w-20 text-center focus:outline-none"
                    />
                    <span className="text-primary font-black font-mono text-lg ml-2">
                      % NETO POR ENTRADA
                    </span>
                  </div>
                </div>
                <div className="bg-surface-2 border border-dashed border-text/40 p-3 font-mono text-[11px] text-text-soft uppercase leading-relaxed">
                  ⚠️ NOTA: Modificar este porcentaje impactará inmediatamente en
                  el cálculo de ganancias retenidas del volumen bruto procesado
                  en el panel principal.
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-primary text-background border-2 border-text font-mono font-black py-3 text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Actualizar Configuración de Red
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
