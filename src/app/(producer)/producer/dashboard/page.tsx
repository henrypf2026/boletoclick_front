"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Evento {
  id: string;
  nombre: string;
  estado: "PROCESO" | "CONCLUIDO";
  precioBase: number;
  capacidad: number;
  ticketsVendidos: number;
  recaudacion: number;
  fecha: string;
}

interface Acceso {
  id: string;
  sector: string;
  hora: string;
  estado: "VALIDO" | "INVALIDO";
}

export default function DashboardProducer() {
  const router = useRouter();

  const [eventos, setEventos] = useState<Evento[]>([]);

  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(
    null,
  );
  const [seccionActiva, setSeccionActiva] = useState<"ajustes" | "scanner">(
    "ajustes",
  );
  const [statusScanner, setStatusScanner] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [ultimosAccesos, setUltimosAccesos] = useState<Acceso[]>([
    { id: "#TK-991", sector: "Campo General", hora: "22:15", estado: "VALIDO" },
    { id: "#TK-990", sector: "Platea Alta", hora: "22:12", estado: "INVALIDO" },
    { id: "#TK-989", sector: "VIP", hora: "22:08", estado: "VALIDO" },
  ]);

  const [formNombre, setFormNombre] = useState("");
  const [formPrecio, setFormPrecio] = useState<number | "">("");
  const [formCapacidad, setFormCapacidad] = useState<number | "">("");

  const seleccionarEvento = (ev: Evento) => {
    setEventoSeleccionado(ev);
    setFormNombre(ev.nombre);
    setFormPrecio(ev.precioBase);
    setFormCapacidad(ev.capacidad);
    setStatusScanner("idle");

    if (ev.estado === "CONCLUIDO") {
      setSeccionActiva("ajustes");
    }
  };

  const irAlCreadorDeEventos = () => {
    router.push("/producer/eventos/crear");
  };

  const procesarFormulario = () => {
    if (!eventoSeleccionado || !formNombre) return;

    setEventos((prev) =>
      prev.map((ev) =>
        ev.id === eventoSeleccionado.id
          ? {
              ...ev,
              nombre: formNombre,
              precioBase: Number(formPrecio) || ev.precioBase,
              capacidad: Number(formCapacidad) || ev.capacidad,
            }
          : ev,
      ),
    );

    setEventoSeleccionado((prev) =>
      prev
        ? {
            ...prev,
            nombre: formNombre,
            precioBase: Number(formPrecio) || prev.precioBase,
            capacidad: Number(formCapacidad) || prev.capacidad,
          }
        : null,
    );

    alert("Cambios aplicados correctamente en el Front-End.");
  };

  const simularEscaneo = (resultado: "success" | "error") => {
    setStatusScanner(resultado);

    const nuevoAcceso: Acceso = {
      id:
        resultado === "success"
          ? `#TK-${Math.floor(Math.random() * 900) + 100}`
          : "#TK-ERR",
      sector: resultado === "success" ? "Campo General" : "Desconocido",
      hora: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      estado: resultado === "success" ? "VALIDO" : "INVALIDO",
    };

    setUltimosAccesos((prev) => [nuevoAcceso, ...prev.slice(0, 4)]);
  };

  const esConcluido = eventoSeleccionado?.estado === "CONCLUIDO";
  const tieneVentas = eventoSeleccionado
    ? eventoSeleccionado.ticketsVendidos > 0
    : false;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-background text-text transition-colors">
      <div className="mb-8 border-b-4 border-text pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-soft">
              Panel de control del organizador
            </span>
          </div>
          <h1 className="uppercase tracking-tighter text-3xl md:text-4xl font-black">
            Dashboard de Gestión de Eventos
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/producer/bank-accounts")}
            className="cursor-pointer bg-secondary text-text border-2 border-text px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
          >
            🏦 Ver Cuentas Bancarias
          </button>
          <div className="bg-surface border-2 border-text px-4 py-2 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_var(--color-text)] flex items-center">
            PRODUCER_ID: <span className="text-primary ml-1">#BC-84910</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center border-b-2 border-text pb-2">
            <h2 className="text-xl uppercase font-black tracking-tight">
              Mis Eventos
            </h2>

            <button
              onClick={irAlCreadorDeEventos}
              className="px-3 py-1 bg-primary text-background border-2 border-text font-mono text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:bg-primary/90 cursor-pointer"
              title="Ir al formulario dinámico de creación"
            >
              Nuevo Evento
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {eventos.length === 0 ? (
              <div className="border-2 border-dashed border-text p-8 text-center bg-surface-2/50 font-mono text-xs uppercase text-text-soft font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_var(--color-text)]">
                [ No tenés eventos publicados. Hacé click en "Nuevo Evento" para
                empezar ]
              </div>
            ) : (
              eventos.map((ev) => {
                const esEste = eventoSeleccionado?.id === ev.id;
                const porc = Math.round(
                  (ev.ticketsVendidos / ev.capacidad) * 100,
                );

                return (
                  <div
                    key={ev.id}
                    onClick={() => seleccionarEvento(ev)}
                    className={`border-2 border-text p-5 rounded-none transition-all cursor-pointer flex flex-col gap-3 ${
                      esEste
                        ? "bg-text text-surface shadow-none"
                        : "bg-surface text-text hover:shadow-[4px_4px_0px_0px_var(--color-text)] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span
                          className={`font-mono text-[10px] font-black px-1.5 py-0.5 border uppercase ${
                            esEste
                              ? "bg-surface text-text border-surface"
                              : ev.estado === "PROCESO"
                                ? "bg-success/10 text-success border-success/30"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}
                        >
                          {ev.estado}
                        </span>
                        <h3 className="uppercase font-black text-lg mt-1.5">
                          {ev.nombre}
                        </h3>
                        <p
                          className={`text-xs font-mono ${esEste ? "text-surface/80" : "text-text-soft"}`}
                        >
                          ID: {ev.id} | Base: $
                          {ev.precioBase.toLocaleString("es-AR")}
                        </p>
                      </div>
                      <span className="text-xs font-mono opacity-90">
                        {ev.fecha}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span
                          className={
                            esEste ? "text-surface/80" : "text-text-soft"
                          }
                        >
                          Aforo: {ev.ticketsVendidos} / {ev.capacidad}
                        </span>
                        <span>{porc}%</span>
                      </div>
                      <div
                        className={`w-full h-3 border p-0.5 overflow-hidden ${esEste ? "border-surface bg-text" : "border-text bg-surface-2"}`}
                      >
                        <div
                          className={`h-full transition-all ${
                            esEste
                              ? "bg-surface"
                              : ev.estado === "CONCLUIDO"
                                ? "bg-red-500"
                                : "bg-text"
                          }`}
                          style={{ width: `${porc}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
            <button
              disabled={!eventoSeleccionado}
              onClick={() => setSeccionActiva("ajustes")}
              className={`px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider transition-all border-2 border-text rounded-none ${
                !eventoSeleccionado
                  ? "opacity-30 cursor-not-allowed bg-surface-2 text-text-soft"
                  : seccionActiva === "ajustes"
                    ? "bg-text text-surface shadow-none translate-x-0.5 translate-y-0.5"
                    : "bg-surface text-text hover:bg-surface-2 shadow-[3px_3px_0px_0px_var(--color-text)] -translate-y-0.5 cursor-pointer"
              }`}
            >
              {esConcluido ? "📊 Resumen Histórico" : "🛠️ Ajustes del Show"}
            </button>

            <button
              disabled={!eventoSeleccionado || esConcluido}
              onClick={() => setSeccionActiva("scanner")}
              className={`px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider transition-all border-2 rounded-none ${
                !eventoSeleccionado
                  ? "opacity-30 cursor-not-allowed bg-surface-2 text-text-soft border-text"
                  : esConcluido
                    ? "bg-neutral-800 text-red-500/60 border-red-900/50 cursor-not-allowed shadow-none font-bold"
                    : seccionActiva === "scanner"
                      ? "bg-text text-surface border-text shadow-none translate-x-0.5 translate-y-0.5"
                      : "bg-surface text-text border-text hover:bg-surface-2 shadow-[3px_3px_0px_0px_var(--color-text)] -translate-y-0.5 cursor-pointer"
              }`}
            >
              {esConcluido ? "🔒 Scanner Bloqueado" : "📷 Scanner Control"}
            </button>
          </div>

          {!eventoSeleccionado && (
            <div className="border-2 border-dashed border-border p-12 text-center bg-surface/30">
              <p className="font-mono text-sm uppercase text-text-soft font-bold tracking-wide">
                [ Seleccioná un evento de la lista para gestionar su estado
                operativo ]
              </p>
            </div>
          )}

          {eventoSeleccionado && (
            <div>
              {seccionActiva === "ajustes" && (
                <div className="space-y-6">
                  {esConcluido ? (
                    <div className="bg-surface border-2 border-text p-6 space-y-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
                      <div className="border-b-2 border-text pb-2">
                        <h2 className="text-xl font-black uppercase mt-1 tracking-tight">
                          Balance Estadístico del Show Concluido
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border-2 border-text p-4 bg-background shadow-[2px_2px_0px_0px_var(--color-text)]">
                          <p className="text-text-soft font-mono text-[10px] font-bold uppercase">
                            Cierre de Caja Total
                          </p>
                          <p className="text-xl font-mono font-black text-success mt-1">
                            $
                            {eventoSeleccionado.recaudacion.toLocaleString(
                              "es-AR",
                            )}
                          </p>
                        </div>
                        <div className="border-2 border-text p-4 bg-background shadow-[2px_2px_0px_0px_var(--color-text)]">
                          <p className="text-text-soft font-mono text-[10px] font-bold uppercase">
                            Tickets Totales Vendidos
                          </p>
                          <p className="text-xl font-mono font-black mt-1">
                            {eventoSeleccionado.ticketsVendidos.toLocaleString(
                              "es-AR",
                            )}
                          </p>
                        </div>
                        <div className="border-2 border-text p-4 bg-background shadow-[2px_2px_0px_0px_var(--color-text)]">
                          <p className="text-text-soft font-mono text-[10px] font-bold uppercase">
                            Ocupación Final
                          </p>
                          <p className="text-xl font-mono font-black mt-1">
                            {Math.round(
                              (eventoSeleccionado.ticketsVendidos /
                                eventoSeleccionado.capacidad) *
                                100,
                            )}
                            %
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface-2 h-6 border-2 border-text rounded-none p-0.5 overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-500"
                          style={{
                            width: `${Math.round((eventoSeleccionado.ticketsVendidos / eventoSeleccionado.capacidad) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="font-mono text-[11px] text-text-soft leading-relaxed uppercase">
                        Los datos operativos de este show no admiten cambios
                        porque su estado es concluido.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-surface border-2 border-text p-6 space-y-5 shadow-[4px_4px_0px_0px_var(--color-text)]">
                      <h2 className="text-xl font-black uppercase border-b-2 border-text pb-2 tracking-tight">
                        Configurar Espectáculo
                      </h2>

                      {tieneVentas && (
                        <div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 font-mono text-xs text-yellow-700 dark:text-yellow-500 font-bold uppercase">
                          🔒: Ya hay entradas vendidas. Solo podés cambiar el
                          nombre.
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black uppercase font-mono mb-1 tracking-wide">
                            Nombre del show
                          </label>
                          <input
                            type="text"
                            value={formNombre}
                            onChange={(e) => setFormNombre(e.target.value)}
                            className="w-full border-2 border-text p-2.5 bg-background font-bold uppercase text-sm focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black uppercase font-mono mb-1 tracking-wide">
                              Precio Entrada
                            </label>
                            <input
                              type="number"
                              value={formPrecio}
                              onChange={(e) =>
                                setFormPrecio(
                                  e.target.value !== ""
                                    ? Number(e.target.value)
                                    : "",
                                )
                              }
                              disabled={tieneVentas}
                              className={`w-full border-2 border-text p-2.5 font-mono text-sm focus:outline-none ${
                                tieneVentas
                                  ? "bg-surface-2 text-text-soft cursor-not-allowed"
                                  : "bg-background"
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase font-mono mb-1 tracking-wide">
                              Capacidad Máxima
                            </label>
                            <input
                              type="number"
                              value={formCapacidad}
                              onChange={(e) =>
                                setFormCapacidad(
                                  e.target.value !== ""
                                    ? Number(e.target.value)
                                    : "",
                                )
                              }
                              disabled={tieneVentas}
                              className={`w-full border-2 border-text p-2.5 font-mono text-sm focus:outline-none ${
                                tieneVentas
                                  ? "bg-surface-2 text-text-soft cursor-not-allowed"
                                  : "bg-background"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={procesarFormulario}
                            className="bg-primary text-background border-2 border-text px-5 py-3 font-mono font-black text-xs uppercase w-full cursor-pointer transition-all hover:brightness-105"
                          >
                            [ APLICAR CAMBIOS ]
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {seccionActiva === "scanner" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-surface border-2 border-text p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_var(--color-text)]">
                    <div>
                      <h2 className="uppercase font-black tracking-tight text-xl mb-1">
                        Cámara de Validación
                      </h2>
                      <p className="text-text-soft font-mono text-xs mb-4 uppercase">
                        [ Lector de Puerta Integrado ]
                      </p>
                    </div>

                    <div
                      className={`w-full aspect-video border-2 border-text flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-300 ${
                        statusScanner === "success"
                          ? "bg-success/20 border-success"
                          : statusScanner === "error"
                            ? "bg-red-600/20 border-red-500"
                            : "bg-black"
                      }`}
                    >
                      {statusScanner === "idle" && (
                        <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_8px_1px_rgba(204,255,0,0.6)] top-1/2 -translate-y-1/2 animate-bounce" />
                      )}
                      {statusScanner === "idle" && (
                        <p className="font-mono text-xs text-neutral-400 tracking-widest uppercase font-bold animate-pulse">
                          [ ENFOQUE EL QR DEL COMPROBANTE ]
                        </p>
                      )}
                      {statusScanner === "success" && (
                        <div className="text-center font-mono space-y-1">
                          <p className="text-2xl">🟢</p>
                          <p className="text-green-700 dark:text-success font-black tracking-wider text-sm uppercase">
                            ACCESO PERMITIDO ✔️
                          </p>
                          <p className="text-text text-xs font-bold bg-surface-2 border border-text px-3 py-1 mt-2 inline-block">
                            TICKET VERIFICADO #TK-992
                          </p>
                        </div>
                      )}
                      {statusScanner === "error" && (
                        <div className="text-center font-mono space-y-1">
                          <p className="text-2xl">🔴</p>
                          <p className="text-red-700 dark:text-red-400 font-black tracking-wider text-sm uppercase">
                            ACCESO DENEGADO ✖️
                          </p>
                          <p className="text-text text-xs font-bold bg-surface-2 border border-text px-3 py-1 mt-2 inline-block">
                            CÓDIGO REPETIDO O INVÁLIDO
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                      <button
                        onClick={() => simularEscaneo("success")}
                        className="bg-success text-black border-2 border-text py-2.5 font-mono font-black text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
                      >
                        Simular Éxito ✔️
                      </button>
                      <button
                        onClick={() => simularEscaneo("error")}
                        className="bg-red-500 text-white border-2 border-text py-2.5 font-mono font-black text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
                      >
                        Simular Error ✖️
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface border-2 border-text p-4 shadow-[4px_4px_0px_0px_var(--color-text)] flex flex-col justify-between">
                    <div>
                      <h3 className="uppercase font-black text-sm tracking-wide font-mono mb-3 border-b-2 border-text pb-1">
                        Ingresos de Puerta
                      </h3>
                      <div className="space-y-3">
                        {ultimosAccesos.map((acceso, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-background border border-border text-xs font-mono flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-text">
                                {acceso.id} -{" "}
                                <span className="text-text-soft font-normal">
                                  {acceso.sector}
                                </span>
                              </p>
                              <p className="text-[10px] text-text-soft mt-0.5">
                                {acceso.hora}
                              </p>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-black tracking-tight ${
                                acceso.estado === "VALIDO"
                                  ? "bg-success/10 text-success border border-success/20"
                                  : "bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20"
                              }`}
                            >
                              {acceso.estado}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-text-soft mt-4 leading-snug uppercase">
                      * Sincronización activa.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
