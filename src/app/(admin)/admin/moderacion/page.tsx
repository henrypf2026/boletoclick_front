"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { api } from "@/lib/apiClient";
import {
  X,
  MapPin,
  Users,
  CheckSquare,
  Square,
  Ban,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type EventoEstado = "APROBADO" | "RECHAZADO" | "CANCELADO";

interface EventoAdmin {
  id: string;
  titulo: string;
  productor: string;
  categoria: string;
  ubicacion: string;
  aforo: number;
  precioBase: number;
  estado: EventoEstado;
  createdAt: string;
}

export default function AdminModeracion() {
  const router = useRouter();

  const [eventos, setEventos] = useState<EventoAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filtroProductor, setFiltroProductor] = useState<string>("ALL");
  const [filtroEstado, setFiltroEstado] = useState<string>("ALL");
  const [busquedaTexto, setBusquedaTexto] = useState<string>("");

  const [selectedEvento, setSelectedEvento] = useState<EventoAdmin | null>(
    null,
  );
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const fetchEventosAdmin = async () => {
    try {
      setLoading(true);

      // Trae TODOS los eventos (ya no hay "pendientes" en el flujo normal,
      // los eventos se publican solos y el admin solo puede bajarlos después)
      const data = await api.get<any[]>("/events/admin/all");

      const mapeados: EventoAdmin[] = (Array.isArray(data) ? data : []).map(
        (ev: any) => {
          const estadoFormateado: EventoEstado =
            ev.status === "REJECTED" ? "RECHAZADO"
            : ev.status === "CANCELLED" || ev.status === "INACTIVE" ? "CANCELADO"
            : "APROBADO";

          const primerTicketType = ev.ticketTypes?.[0];

          return {
            id: ev.id,
            titulo: ev.title || "Sin Título",
            productor:
              ev.producer?.companyName || ev.producer?.name || "Productor",
            categoria: ev.category?.name || "General",
            ubicacion: ev.venue?.name || ev.venue?.address || "No especificada",
            aforo: Number(ev.venue?.capacity || 0),
            precioBase: Number(primerTicketType?.price || 0),
            estado: estadoFormateado,
            createdAt: ev.createdAt,
          };
        },
      );

      setEventos(mapeados);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el catálogo de eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventosAdmin();
  }, []);

  const eventosFiltrados = useMemo(() => {
    return eventos
      .filter((ev) => {
        const cumpleProductor =
          filtroProductor === "ALL" || ev.productor === filtroProductor;
        const cumpleEstado =
          filtroEstado === "ALL" || ev.estado === filtroEstado;
        const cumpleTexto =
          ev.titulo.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
          ev.ubicacion.toLowerCase().includes(busquedaTexto.toLowerCase());

        return cumpleProductor && cumpleEstado && cumpleTexto;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [eventos, filtroProductor, filtroEstado, busquedaTexto]);

  const metricas = useMemo(() => {
    const activos = eventos.filter((e) => e.estado === "APROBADO");
    const rechazados = eventos.filter((e) => e.estado === "RECHAZADO");
    return {
      totalActivos: activos.length,
      totalRechazados: rechazados.length,
      aforoAcumulado: activos.reduce((acc, ev) => acc + ev.aforo, 0),
      cajaPotencial: activos.reduce(
        (acc, ev) => acc + ev.precioBase * ev.aforo,
        0,
      ),
    };
  }, [eventos]);

  const listaProductores = useMemo(() => {
    const productores = eventos.map((ev) => ev.productor);
    return ["ALL", ...Array.from(new Set(productores))];
  }, [eventos]);

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const esTodoSeleccionado = useMemo(() => {
    if (eventosFiltrados.length === 0) return false;
    return eventosFiltrados.every((ev) => seleccionados.includes(ev.id));
  }, [eventosFiltrados, seleccionados]);

  const toggleSeleccionarTodo = () => {
    if (esTodoSeleccionado) {
      setSeleccionados((prev) =>
        prev.filter((id) => !eventosFiltrados.some((ev) => ev.id === id)),
      );
    } else {
      const idsObjetivo = eventosFiltrados.map((ev) => ev.id);
      setSeleccionados((prev) =>
        Array.from(new Set([...prev, ...idsObjetivo])),
      );
    }
  };

  const cambiarEstadoEvento = async (
    id: string,
    titulo: string,
    nuevoEstado: EventoEstado,
  ) => {
    const statusBack = nuevoEstado === "APROBADO" ? "APPROVED" : "REJECTED";

    try {
      await api.patch(`/events/${id}/status`, { status: statusBack });

      setEventos((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, estado: nuevoEstado } : ev)),
      );

      if (nuevoEstado === "RECHAZADO") {
        toast.error(`Bajado de cartelera: "${titulo}"`);
      } else {
        toast.success(`Reactivado: "${titulo}"`);
      }

      if (selectedEvento && selectedEvento.id === id) {
        setSelectedEvento((prev) =>
          prev ? { ...prev, estado: nuevoEstado } : null,
        );
      }
      setSeleccionados((prev) => prev.filter((item) => item !== id));
    } catch (error) {
      console.error(error);
      toast.error("Falló la operación en el servidor");
    }
  };

  const cambiarEstadoEnLote = async (nuevoEstado: EventoEstado) => {
    if (seleccionados.length === 0) return;

    const statusBack = nuevoEstado === "APROBADO" ? "APPROVED" : "REJECTED";
    const idsExitosos: string[] = [];
    const idsFallidos: string[] = [];

    // Secuencial, no Promise.all: evita el 429 (Too Many Requests) si hay
    // varios eventos seleccionados a la vez.
    for (const id of seleccionados) {
      try {
        await api.patch(`/events/${id}/status`, { status: statusBack });
        idsExitosos.push(id);
      } catch (err) {
        console.error(`Falló el evento ${id}:`, err);
        idsFallidos.push(id);
      }
    }

    if (idsExitosos.length > 0) {
      setEventos((prev) =>
        prev.map((ev) =>
          idsExitosos.includes(ev.id) ? { ...ev, estado: nuevoEstado } : ev,
        ),
      );
    }

    if (idsFallidos.length === 0) {
      toast.success(
        `${idsExitosos.length} evento(s) actualizados a ${nuevoEstado}`,
      );
    } else {
      toast.warning(
        `${idsExitosos.length} OK, ${idsFallidos.length} fallaron. Reintentá los restantes.`,
      );
    }

    setSeleccionados(idsFallidos);
  };

  return (
    <div className="min-h-screen bg-bg text-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative overflow-x-hidden pb-24">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-text)",
            color: "var(--color-background)",
            border: "3px solid var(--color-border)",
            borderRadius: 0,
            boxShadow: "4px 4px 0px 0px var(--color-border)",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.8rem",
          },
        }}
      />

      <div className="border-b-4 border-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <button
            onClick={() => router.push("/dashboard-admin")}
            className="text-sm font-black uppercase text-text-soft hover:text-text mb-2 block transition-colors cursor-pointer"
          >
            &larr; Volver a Consola
          </button>
          <h1 className="text-2xl md:text-3xl text-text">
            Catálogo de Eventos
          </h1>
          <p className="text-text-soft text-sm uppercase font-bold tracking-wide mt-1 flex items-center gap-1.5">
            <Sparkles size={13} className="text-primary" />
            Publicación automática activa — vigilá y dá de baja lo que no
            corresponda
          </p>
        </div>
      </div>

      {loading ? (
        <div className="border-4 border-border bg-surface p-12 text-center text-xs font-black uppercase tracking-widest animate-pulse">
          ⏳ Sincronizando con Servidor Central...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border-4 border-border bg-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--border)]">
              <span className="text-[10px] text-text-soft uppercase font-black block tracking-wider">
                Activos
              </span>
              <span className="text-xl md:text-2xl font-black text-success">
                {metricas.totalActivos}
              </span>
            </div>
            <div className="border-4 border-border bg-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--border)]">
              <span className="text-[10px] text-text-soft uppercase font-black block tracking-wider">
                Rechazados
              </span>
              <span className="text-xl md:text-2xl font-black text-accent">
                {metricas.totalRechazados}
              </span>
            </div>
            <div className="border-4 border-border bg-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--border)]">
              <span className="text-[10px] text-text-soft uppercase font-black block tracking-wider">
                Aforo Custodiado
              </span>
              <span className="text-xl md:text-2xl font-black text-primary">
                {metricas.aforoAcumulado.toLocaleString()}
              </span>
            </div>
            <div className="border-4 border-border bg-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--border)]">
              <span className="text-[10px] text-text-soft uppercase font-black block tracking-wider">
                Caja Potencial
              </span>
              <span className="text-xl md:text-2xl font-black text-success">
                ${metricas.cajaPotencial.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-2 p-3 border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
            <div className="flex items-center bg-surface border-2 border-border px-3 py-2 text-sm gap-2">
              <Search size={15} className="text-text-soft shrink-0" />
              <input
                type="text"
                placeholder="Buscar evento o lugar..."
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                className="bg-transparent font-bold focus:outline-none w-full text-text placeholder:text-text-soft/40"
              />
            </div>

            <div className="flex items-center bg-surface border-2 border-border px-3 py-2 text-sm gap-2">
              <SlidersHorizontal size={15} className="text-text-soft shrink-0" />
              <select
                value={filtroProductor}
                onChange={(e) => setFiltroProductor(e.target.value)}
                className="bg-surface text-text font-bold focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL">Todos los Productores</option>
                {listaProductores
                  .filter((p) => p !== "ALL")
                  .map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center bg-surface border-2 border-border px-3 py-2 text-sm gap-2">
              <span className="font-black text-text-soft shrink-0">⚡</span>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-surface text-text font-bold focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL">Cualquier Estado</option>
                <option value="APROBADO">Activos</option>
                <option value="RECHAZADO">Rechazados</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-b-2 border-border pb-2">
            <button
              onClick={toggleSeleccionarTodo}
              className="flex items-center gap-2 text-xs font-black uppercase text-text-soft hover:text-text transition-colors cursor-pointer"
            >
              {esTodoSeleccionado ? (
                <CheckSquare size={14} className="text-primary" />
              ) : (
                <Square size={14} />
              )}
              {esTodoSeleccionado ? "Desmarcar todos" : "Marcar todos"}
            </button>
            <span className="text-xs font-bold text-text-soft uppercase">
              {eventosFiltrados.length} evento(s)
            </span>
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {eventosFiltrados.length > 0 ? (
                eventosFiltrados.map((ev, idx) => {
                  const isActivo = ev.estado === "APROBADO";
                  const isChecked = seleccionados.includes(ev.id);

                  return (
                    <motion.div
                      key={ev.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.04, duration: 0.25 }}
                      className={`border-4 border-border p-5 bg-surface shadow-[4px_4px_0px_0px_var(--border)] flex flex-col justify-between space-y-4 relative transition-shadow ${
                        isChecked
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-bg"
                          : ""
                      } ${ev.estado === "CANCELADO" ? "opacity-50" : !isActivo ? "opacity-70" : ""}`}
                    >
                      <button
                        onClick={() => toggleSeleccion(ev.id)}
                        className="absolute top-4 right-4 text-text hover:text-primary transition-colors cursor-pointer z-10"
                      >
                        {isChecked ? (
                          <CheckSquare size={18} className="text-primary" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>

                      <div
                        className="space-y-2 pr-6 cursor-pointer"
                        onClick={() => setSelectedEvento(ev)}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] bg-surface-2 text-text font-black px-2 py-0.5 border border-border uppercase">
                            {ev.categoria}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 border-2 uppercase ${
                              ev.estado === "APROBADO"
                                ? "bg-success/15 text-success border-success/50"
                                : ev.estado === "CANCELADO"
                                ? "bg-red-400/15 text-red-500 border-red-400/50"
                                : "bg-accent/15 text-accent border-accent/50"
                            }`}
                          >
                            {ev.estado === "CANCELADO" ? "✕ CANCELADO" : ev.estado}
                          </span>
                          {ev.aforo >= 5000 && (
                            <span className="bg-accent text-background font-black text-[10px] px-1.5 py-0.5 border border-border">
                              🚨 MASIVO
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-base uppercase tracking-tight text-text line-clamp-2">
                          {ev.titulo}
                        </h3>
                        <p className="text-xs text-text-soft font-bold">
                          Productor:{" "}
                          <span className="text-text underline">
                            {ev.productor}
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-text-soft uppercase">
                        <div className="bg-surface-2 p-2 border border-border/10">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> Lugar:
                          </span>
                          <span className="text-text font-black block truncate">
                            {ev.ubicacion}
                          </span>
                        </div>
                        <div className="bg-surface-2 p-2 border border-border/10">
                          <span className="flex items-center gap-1">
                            <Users size={11} /> Aforo:
                          </span>
                          <span className="text-success font-black block">
                            {ev.aforo.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          cambiarEstadoEvento(
                            ev.id,
                            ev.titulo,
                            isActivo ? "RECHAZADO" : "APROBADO",
                          )
                        }
                        className={`w-full flex items-center justify-center gap-2 py-2 border-2 border-border text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--border)] cursor-pointer transition-all ${
                          isActivo
                            ? "bg-surface text-accent hover:bg-accent hover:text-background"
                            : "bg-text text-background hover:bg-primary hover:text-background"
                        }`}
                      >
                        {isActivo ? (
                          <>
                            <Ban size={13} /> Bajar de Cartelera
                          </>
                        ) : (
                          <>
                            <RotateCcw size={13} /> Reactivar
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16 text-text-soft text-xs font-black uppercase border-4 border-dashed border-border/30">
                  No se encontraron eventos con estos filtros.
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {seleccionados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface border-4 border-border p-4 shadow-[6px_6px_0px_0px_var(--border)] flex flex-col sm:flex-row items-center gap-4 w-[90%] max-w-xl"
          >
            <div className="text-sm uppercase font-black text-center sm:text-left">
              ⚡ <span className="text-primary">{seleccionados.length}</span>{" "}
              {seleccionados.length === 1
                ? "evento seleccionado"
                : "eventos seleccionados"}
            </div>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <button
                onClick={() => cambiarEstadoEnLote("RECHAZADO")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 border-2 border-border text-xs font-black uppercase bg-surface text-accent hover:bg-accent hover:text-background transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--border)]"
              >
                <Ban size={13} /> Bajar Lote
              </button>
              <button
                onClick={() => cambiarEstadoEnLote("APROBADO")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 border-2 border-border text-xs font-black uppercase bg-text text-background hover:bg-primary hover:text-background transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--border)]"
              >
                <RotateCcw size={13} /> Reactivar Lote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEvento && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvento(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-full sm:w-115 bg-surface border-l-4 border-border z-50 p-6 shadow-[-8px_0px_0px_0px_var(--border)] flex flex-col justify-between font-mono overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b-2 border-border pb-3">
                  <span className="text-[10px] font-black uppercase bg-text text-background px-2 py-0.5 border border-border">
                    Detalles del Catálogo
                  </span>
                  <button
                    onClick={() => setSelectedEvento(null)}
                    className="p-1 border-2 border-border bg-surface-2 hover:bg-accent hover:text-background transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                      {selectedEvento.categoria}
                    </span>
                    {selectedEvento.aforo >= 5000 && (
                      <span className="bg-accent text-background text-[8px] font-black px-1 border border-border">
                        MASIVO
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-2xl uppercase tracking-tight text-text mt-1 leading-tight">
                    {selectedEvento.titulo}
                  </h3>
                  <p className="text-xs text-text-soft font-bold mt-1.5">
                    ID de Control Técnico:{" "}
                    <span className="text-text font-mono">
                      #{selectedEvento.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 bg-bg p-2.5 border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                    <MapPin size={16} className="text-primary shrink-0" />
                    <div className="text-xs font-bold uppercase text-text truncate">
                      <span className="text-text-soft block text-[10px]">
                        Ubicación del Show:
                      </span>
                      {selectedEvento.ubicacion}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-bg p-2.5 border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                    <Users size={16} className="text-accent shrink-0" />
                    <div className="text-xs font-bold uppercase text-text">
                      <span className="text-text-soft block text-[10px]">
                        Capacidad de Público (Aforo):
                      </span>
                      {selectedEvento.aforo.toLocaleString()} Personas
                    </div>
                  </div>
                </div>

                <div className="bg-surface-2 border-2 border-border p-4 space-y-3 mt-4">
                  <h5 className="text-xs font-black uppercase tracking-wider border-b border-border/30 pb-1 text-text">
                    📊 Taquilla Estimada
                  </h5>
                  <div className="space-y-1.5 text-sm font-bold">
                    <div className="flex justify-between">
                      <span className="text-text-soft">
                        Precio Unitario Neto:
                      </span>
                      <span className="text-text">
                        ${selectedEvento.precioBase.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-text-soft">
                      <span>Aforo Total Planificado:</span>
                      <span>
                        {selectedEvento.aforo.toLocaleString()} tickets
                      </span>
                    </div>
                    <div className="border-t border-dashed border-border/40 pt-1.5 flex justify-between font-black text-primary uppercase">
                      <span>Caja Bruta Máxima:</span>
                      <span>
                        $
                        {(
                          selectedEvento.precioBase * selectedEvento.aforo
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-border pt-4 mt-auto space-y-2">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-text-soft uppercase">
                    Estado en cartelera:
                  </span>
                  <span
                    className={`px-2 py-0.5 border-2 font-black uppercase ${
                      selectedEvento.estado === "APROBADO"
                        ? "bg-success/15 text-success border-success/50"
                        : selectedEvento.estado === "CANCELADO"
                        ? "bg-red-400/15 text-red-500 border-red-400/50"
                        : "bg-accent/15 text-accent border-accent/50"
                    }`}
                  >
                    {selectedEvento.estado === "CANCELADO" ? "✕ CANCELADO" : selectedEvento.estado}
                  </span>
                </div>

                {selectedEvento.estado !== "CANCELADO" && (
                <button
                  onClick={() =>
                    cambiarEstadoEvento(
                      selectedEvento.id,
                      selectedEvento.titulo,
                      selectedEvento.estado === "APROBADO"
                        ? "RECHAZADO"
                        : "APROBADO",
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-border font-black text-xs uppercase bg-text text-background hover:bg-primary hover:text-background transition-all cursor-pointer"
                >
                  {selectedEvento.estado === "APROBADO" ? (
                    <>
                      <Ban size={14} /> Bajar de Cartelera
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} /> Reactivar
                    </>
                  )}
                </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
