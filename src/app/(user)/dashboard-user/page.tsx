"use client";

import React, { useState, useEffect } from "react";

interface Ticket {
  id: string;
  evento: string;
  fecha: string;
  zona: string;
  qr: string;
}

export default function UserDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<
    "entradas" | "historial" | "perfil"
  >("entradas");
  const [ticketExpandido, setTicketExpandido] = useState<Ticket | null>(null);

  const [loading, setLoading] = useState(false);
  const [nombreTitular, setNombreTitular] = useState("JUAN PEREZ");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle",
  );
  const [filtroHistorial, setFiltroHistorial] = useState("");

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [seccionActiva]);

  const tickets: Ticket[] = [
    {
      id: "TK-992",
      evento: "DUKI - RIVER",
      fecha: "28 MAY 2026",
      zona: "CAMPO VIP",
      qr: "QR-DK-992",
    },
    {
      id: "TK-110",
      evento: "BABASONICOS - MOVISTAR ARENA",
      fecha: "15 JUN 2026",
      zona: "PLATEA ALTA",
      qr: "QR-BS-110",
    },
  ];

  const compras = [
    {
      id: "FAC-9843",
      fecha: "20 May 2026",
      evento: "Duki - RIVER",
      entradas: 2,
      total: 44000,
      metodo: "Visa Débito",
    },
    {
      id: "FAC-8211",
      fecha: "12 Abr 2026",
      evento: "Conociendo Rusia",
      entradas: 1,
      total: 15000,
      metodo: "Mastercard",
    },
  ];

  const handleGuardarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 1000);
  };

  const comprasFiltradas = compras.filter(
    (c) =>
      c.evento.toLowerCase().includes(filtroHistorial.toLowerCase()) ||
      c.id.toLowerCase().includes(filtroHistorial.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-background text-text transition-colors">
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Mi Cuenta
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Gestioná tus accesos, compras y datos de perfil
          </p>
        </div>
        <div className="bg-surface border-2 border-text px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--color-text)]">
          ESTADO: <span className="text-success animate-pulse">● En Línea</span>
        </div>
      </div>

      <div className="flex border-b-2 border-text mb-6 gap-2 overflow-x-auto pb-0">
        {(
          [
            { id: "entradas", label: "🎟️ MIS ENTRADAS" },
            { id: "historial", label: "📜 HISTORIAL DE COMPRAS" },
            { id: "perfil", label: "👤 MI PERFIL" },
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

      {/* CONTENEDOR PRINCIPAL CON EFECTO SKELETON */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-surface border-2 border-text w-full"></div>
          <div className="h-32 bg-surface border-2 border-text w-full"></div>
        </div>
      ) : (
        <>
          {/* SECCIÓN ENTRADAS */}
          {seccionActiva === "entradas" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setTicketExpandido(ticket)}
                  className="bg-surface border-2 border-text rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] p-5 flex flex-col justify-between transition-all hover:shadow-[7px_7px_0px_0px_var(--color-text)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="border-b-2 border-dashed border-text/40 pb-4 mb-4 relative">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-text font-black text-lg uppercase tracking-tight group-hover:text-primary transition-colors">
                        {ticket.evento}
                      </h3>
                      <span className="text-[9px] font-mono bg-text text-surface px-1.5 py-0.5 font-bold whitespace-nowrap">
                        VER ACCESO
                      </span>
                    </div>
                    <p className="text-primary-deep dark:text-primary font-black mt-2 font-mono text-sm">
                      {ticket.fecha}
                    </p>
                    <p className="text-text-soft mt-2 text-[11px] uppercase font-bold tracking-wider">
                      SECTOR:{" "}
                      <span className="text-text font-black font-mono bg-surface-2 px-2 py-0.5 border border-text/20">
                        {ticket.zona}
                      </span>
                    </p>
                  </div>

                  {/* Vista previa mini del QR */}
                  <div className="bg-surface-2 p-3 border-2 border-text flex flex-col items-center justify-center max-w-40 mx-auto w-full transition-transform group-hover:scale-105">
                    <div className="w-full py-3 bg-black text-white flex items-center justify-center font-mono text-[10px] uppercase font-black tracking-widest">
                      [ SCAN CODE ]
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECCIÓN HISTORIAL */}
          {seccionActiva === "historial" && (
            <div className="space-y-4">
              <div className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_var(--color-text)]">
                <input
                  type="text"
                  placeholder="🔎 BUSCAR COMPRA POR EVENTO O FACTURA..."
                  value={filtroHistorial}
                  onChange={(e) => setFiltroHistorial(e.target.value)}
                  className="w-full bg-background border-2 border-text p-2 font-mono text-xs font-bold uppercase focus:outline-none"
                />
              </div>

              <div className="bg-surface border-2 border-text rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] divide-y-2 divide-text">
                {comprasFiltradas.length > 0 ? (
                  comprasFiltradas.map((compra) => (
                    <div
                      key={compra.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono bg-text text-surface px-2 py-0.5 font-bold text-[10px]">
                            {compra.id}
                          </span>
                          <span className="text-text-soft text-xs font-mono font-bold">
                            {compra.fecha}
                          </span>
                        </div>
                        <h3 className="text-text text-base font-black uppercase tracking-tight">
                          {compra.evento}
                        </h3>
                        <p className="text-text-soft text-xs font-mono mt-0.5">
                          Entradas: {compra.entradas} | Pago: {compra.metodo}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-text/20">
                        <div className="sm:text-right">
                          <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                            TOTAL ABONADO
                          </span>
                          <span className="font-black text-lg font-mono text-text">
                            ${compra.total.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            alert(
                              `Simulación: Descargando PDF de la factura ${compra.id}...`,
                            )
                          }
                          className="bg-primary hover:brightness-105 text-background font-mono font-black text-xs uppercase tracking-wider transition-all border-2 border-text px-4 py-2 shadow-[2px_2px_0px_0px_var(--color-text)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        >
                          📥 PDF
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center font-mono text-xs uppercase text-text-soft">
                    No se encontraron registros que coincidan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN PERFIL */}
          {seccionActiva === "perfil" && (
            <div className="bg-surface border-2 border-text p-6 rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] max-w-md relative">
              {saveStatus === "success" && (
                <div className="absolute -top-4 right-4 bg-success text-black border-2 border-text font-mono text-xs font-black uppercase px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                  ✓ Cambios guardados localmente
                </div>
              )}

              <form onSubmit={handleGuardarPerfil} className="space-y-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-4">
                    Datos personales
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                        Email de usuario (No modificable)
                      </label>
                      <input
                        type="text"
                        disabled
                        value="user.techno@boletoclick.com"
                        className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-text mb-1 font-mono tracking-wider">
                        Nombre titular de cuenta
                      </label>
                      <input
                        type="text"
                        required
                        value={nombreTitular}
                        onChange={(e) =>
                          setNombreTitular(e.target.value.toUpperCase())
                        }
                        className="w-full bg-background border-2 border-text text-text px-4 py-2.5 text-sm font-black uppercase focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saveStatus === "saving"}
                        className="bg-primary text-background border-2 border-text font-mono font-black px-5 py-2.5 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                      >
                        {saveStatus === "saving"
                          ? "[ GUARDANDO... ]"
                          : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="pt-6 border-t-2 border-dashed border-text/40 mt-6">
                <p className="font-mono text-[11px] text-text-soft mb-4 leading-relaxed uppercase">
                  Al eliminar tu cuenta vas a perder el acceso inmediato a todo
                  tu historial de compras y las entradas que tengas vigentes
                  para próximos eventos.
                </p>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "¿De verdad querés eliminar tu cuenta? Esta acción borrará tus entradas activas y es irreversible.",
                      )
                    ) {
                      alert("Cuenta eliminada simulada. Redireccionando...");
                    }
                  }}
                  className="bg-transparent hover:bg-red-500/10 text-red-500 border-2 border-red-500 font-mono font-black px-4 py-2.5 text-xs uppercase tracking-wider transition-colors cursor-pointer w-full text-center"
                >
                  Eliminar cuenta de forma permanente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {ticketExpandido && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setTicketExpandido(null)}
        >
          {/* Tarjeta del Ticket simulando troquelado */}
          <div
            className="bg-white text-black border-4 border-black max-w-sm w-full p-6 rounded-none shadow-[8px_8px_0px_0px_#CCFF00] flex flex-col justify-between relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-r-full border-r-4 border-y-4 border-black -ml-1"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-l-full border-l-4 border-y-4 border-black -mr-1"></div>

            <div className="border-b-4 border-black border-dashed pb-5 text-center">
              <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 uppercase font-black tracking-widest">
                PASES DIGITALES BOLETOCLICK
              </span>
              <h2 className="text-black font-black text-2xl uppercase tracking-tighter mt-4 leading-tight">
                {ticketExpandido.evento}
              </h2>
              <p className="text-black font-mono font-black text-sm mt-1">
                {ticketExpandido.fecha}
              </p>
              <div className="mt-3">
                <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block mb-1">
                  SECTOR ASIGNADO
                </span>
                <span className="bg-black text-white px-3 py-1 text-xs font-mono font-black uppercase tracking-wider">
                  {ticketExpandido.zona}
                </span>
              </div>
            </div>

            <div className="my-6 bg-white p-4 border-4 border-black flex flex-col items-center justify-center aspect-square w-full max-w-60 mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-4 text-center font-mono text-xs uppercase font-black tracking-widest select-none">
                <span className="text-4xl mb-3">🏁</span>
                <span className="bg-white text-black px-2 py-0.5 font-mono text-[11px] font-black tracking-normal mb-1">
                  [{ticketExpandido.qr}]
                </span>
                <span className="text-[9px] text-neutral-400 mt-2 tracking-tighter">
                  DIGITAL TICKET ID
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-[10px] font-mono font-black text-neutral-600 uppercase tracking-tight animate-pulse">
                📱 Presentá esta pantalla directamente en los lectores de puerta
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() =>
                    alert(
                      "Simulación: Agregando pase a Apple Wallet / Google Wallet...",
                    )
                  }
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-black font-mono font-black py-2.5 text-[11px] uppercase tracking-wider border-2 border-black transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  💼 AGREGAR A WALLET
                </button>
                <button
                  onClick={() => setTicketExpandido(null)}
                  className="w-full bg-black hover:bg-neutral-900 text-white font-mono font-black py-2.5 text-[11px] uppercase tracking-wider border-2 border-black transition-colors cursor-pointer"
                >
                  [ VOLVER A MIS ENTRADAS ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
