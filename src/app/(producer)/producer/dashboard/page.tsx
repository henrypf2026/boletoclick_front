"use client";

import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  normalizeEventStatusForUi,
  toApiEventStatus,
} from "@/lib/eventStatus";
import ProducerEventEditForm from "@/components/dashboard/ProducerEventEditForm";
import type { ProducerEventFormValues } from "@/validators/dashboardSchemas";

interface TicketType {
  name: string;
  price: number;
  stock: number;
  zone?: string;
  sold?: number;
}

interface Evento {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  status: "DRAFT" | "ACTIVE" | "CONCLUIDO" | string;
  ticketTypes: TicketType[];
  poster?: string;
  location?: string;
  venueId?: string;
  categoryId?: string;
  category?: string | { name: string };
  venue?: string | { name?: string; address?: string };
}

interface Acceso {
  id: string;
  sector: string;
  hora: string;
  estado: "VALIDO" | "INVALIDO";
}

interface EventStats {
  total: number;
  arrived: number;
  pending: number;
  percentage: number;
}

interface ApiItem {
  id: string;
  name: string;
}

export default function DashboardProducer() {
  const router = useRouter();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<"ajustes" | "stats" | "scanner">("ajustes");
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statusScanner, setStatusScanner] = useState<"idle" | "success" | "error">("idle");
  const [ultimosAccesos, setUltimosAccesos] = useState<Acceso[]>([]);

  const [loadingAccion, setLoadingAccion] = useState<boolean>(false);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [categorias, setCategorias] = useState<ApiItem[]>([]);
  const [locaciones, setLocaciones] = useState<ApiItem[]>([]);

  useEffect(() => {
    const fetchEventosProductor = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch("/api/backend/events/producer", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Error al obtener eventos: ${response.status}`);
        const data = await response.json();
        setEventos(
          data
            .filter((ev: Evento) => ev.status !== "INACTIVE")
            .map((ev: Evento) => ({
              ...ev,
              status: normalizeEventStatusForUi(ev.status),
            })),
        );
        setErrorApi(null);
      } catch (err: any) {
        console.error("🚨 Error capturado en Dashboard:", err.message);
        setErrorApi(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEventosProductor();
  }, []);

  useEffect(() => {
    const cargarDesplegables = async () => {
      const [resCat, resVen] = await Promise.all([
        authenticatedFetch("/api/backend/categories").catch(() => null),
        authenticatedFetch("/api/backend/venues").catch(() => null),
      ]);
      if (resCat?.ok) setCategorias(await resCat.json());
      if (resVen?.ok) setLocaciones(await resVen.json());
    };
    cargarDesplegables();
  }, []);

  const seleccionarEvento = async (ev: Evento) => {
    setEventoSeleccionado(ev);
    setEventStats(null);
    setLoadingStats(true);
    authenticatedFetch(`/api/backend/tickets/event/${ev.id}/stats`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setEventStats(data); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    setStatusScanner("idle");
    if (ev.status === "CONCLUIDO") setSeccionActiva("ajustes");
    setMostrarPanel(true);
  };

  const guardarCambios = async (values: ProducerEventFormValues) => {
    if (!eventoSeleccionado) return;

    setLoadingAccion(true);
    try {
      const payloadDto = {
        title: values.title,
        description: values.description,
        eventDate: values.formDate
          ? new Date(`${values.formDate}T${values.formTime || "12:00"}:00`).toISOString()
          : undefined,
        categoryId: values.categoryId,
        venueId: values.venueId,
        ticketTypes: values.ticketTypes.map((ticket) => ({
          name: ticket.name,
          zone: ticket.zone || ticket.name,
          price: Number(ticket.price),
          stock: Number(ticket.stock),
        })),
      };

      const response = await authenticatedFetch(`/api/backend/events/${eventoSeleccionado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payloadDto),
      });

      if (!response.ok) throw new Error(`Error del servidor al actualizar: ${response.status}`);
      const eventoActualizadoServidor = await response.json();

      setEventos(eventos.map((ev) =>
        ev.id === eventoSeleccionado.id ? { ...ev, ...eventoActualizadoServidor } : ev
      ));
      setEventoSeleccionado(eventoActualizadoServidor);

      Swal.fire({
        title: "¡GUARDADO!",
        text: "Los cambios fueron guardados correctamente.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: {
          popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
          title: "uppercase font-black tracking-tighter",
          confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        },
      });
    } catch (error: any) {
      Swal.fire({
        title: "ERROR",
        text: error.message || "No se pudieron guardar los cambios en el servidor.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: {
          popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
          title: "uppercase font-black tracking-tighter",
          confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        },
      });
    } finally {
      setLoadingAccion(false);
    }
  };
///Funcion para cambiar el estado del evento de DRAFT y ACTIVE
  const cambiarStatus = async () => {
    if (!eventoSeleccionado) return;

    const esBorrador = eventoSeleccionado.status === "DRAFT";
    const nuevoStatus = esBorrador ? "ACTIVE" : "DRAFT";

    const { isConfirmed } = await Swal.fire({
      title: esBorrador ? "¿PONER AL AIRE?" : "¿VOLVER A BORRADOR?",
      text: esBorrador
        ? `"${eventoSeleccionado.title}" será visible para el público y aceptará ventas.`
        : `"${eventoSeleccionado.title}" dejará de ser visible para el público.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: esBorrador ? " SÍ, PUBLICAR" : " NO PUBLICAR",
      cancelButtonText: "CANCELAR",
      confirmButtonColor: esBorrador ? "#22c55e" : "#eab308",
      cancelButtonColor: "#6750e0",
      background: "#f5f4f0",
      color: "#171717",
      customClass: {
        popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
        title: "uppercase font-black tracking-tighter",
        confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        cancelButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
      },
    });

    if (!isConfirmed) return;

    setLoadingAccion(true);
    try {
      const response = await authenticatedFetch(`/api/backend/events/${eventoSeleccionado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: toApiEventStatus(nuevoStatus) }),
      });

      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

      setEventos(eventos.map((ev) =>
        ev.id === eventoSeleccionado.id ? { ...ev, status: nuevoStatus } : ev
      ));
      setEventoSeleccionado({ ...eventoSeleccionado, status: nuevoStatus });

      Swal.fire({
        title: esBorrador ? "¡AL AIRE! 📡" : "VUELTO A BORRADOR 📝",
        text: esBorrador
          ? "El evento ya es visible para el público."
          : "El evento ya NO esta disponible para el público .",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: {
          popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
          title: "uppercase font-black tracking-tighter",
          confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        },
      });
    } catch (error: any) {
      Swal.fire({
        title: "ERROR",
        text: error.message || "No se pudo cambiar el estado del evento.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: {
          popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
          title: "uppercase font-black tracking-tighter",
          confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        },
      });
    } finally {
      setLoadingAccion(false);
    }
  };

  const eliminarEvento = async () => {
    if (!eventoSeleccionado) return;

    const resultado = await Swal.fire({
      title: "¿DAR DE BAJA?",
      text: `¿Estás seguro de que querés dar de baja "${eventoSeleccionado.title}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "SÍ, DAR DE BAJA",
      cancelButtonText: "CANCELAR",
      confirmButtonColor: "#ff6b00",
      cancelButtonColor: "#6750e0",
      background: "#f5f4f0",
      color: "#171717",
      customClass: {
        popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
        title: "uppercase font-black tracking-tighter",
        confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        cancelButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
      },
    });

    if (!resultado.isConfirmed) return;

    const idABorrar = eventoSeleccionado.id;
    setLoadingAccion(true);

    try {
      const response = await authenticatedFetch(`/api/backend/events/${idABorrar}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          Swal.fire({
            title: "SIN PERMISOS",
            text: "Tu sesión expiró o no tenés permisos de Productor para borrar este evento.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#6750e0",
            background: "#f5f4f0",
            color: "#171717",
            customClass: {
              popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
              title: "uppercase font-black tracking-tighter",
              confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
            },
          });
          return;
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      setEventos((prev) => prev.filter((ev) => ev.id !== idABorrar));
      setEventoSeleccionado(null);

      Swal.fire({
        title: "EVENTO DADO DE BAJA",
        text: "El evento fue desactivado correctamente.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: {
          popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
          title: "uppercase font-black tracking-tighter",
          confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        },
      });
    } catch (error: any) {
      Swal.fire({
        title: "ERROR",
        text: error.message || "No se pudo completar la baja.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: {
          popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
          title: "uppercase font-black tracking-tighter",
          confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
        },
      });
    } finally {
      setLoadingAccion(false);
    }
  };


  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-background text-text selection:bg-primary selection:text-background">
      <div className="mb-6 flex flex-wrap gap-3 p-4 bg-surface border-4 border-text shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={() => router.push("/producer/eventos/crear")}
          className="px-4 py-2 bg-primary text-background border-2 border-text font-mono text-sm font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          ➕ Crear Nuevo Evento
        </button>
        <button
          onClick={() => router.push("/producer/venues/crear")}
          className="px-4 py-2 bg-background text-text border-2 border-text font-mono text-sm font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          📍 Registrar Venue
        </button>
        <button
          onClick={() => router.push("/producer/bank-accounts")}
          className="px-4 py-2 bg-background text-text border-2 border-text font-mono text-sm font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          🏦 Configurar Cuenta Bancaria
        </button>
      </div>

      <div className="mb-8 border-b-4 border-text pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-soft block mb-1">
            BoletoClick / Panel de Control
          </span>
          <h1 className="uppercase tracking-tighter text-3xl md:text-4xl font-black">
            Dashboard del Productor
          </h1>
        </div>
        <div className="bg-surface border-2 border-text px-4 py-2 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_var(--color-text)]">
          STATUS: <span className="text-success font-black">CONECTADO</span>
        </div>
      </div>

      {/* Backdrop móvil — cierra el panel al tocar fuera */}
      {eventoSeleccionado && mostrarPanel && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMostrarPanel(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lista de eventos */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xl uppercase font-black tracking-tight border-b-2 border-text pb-2">
            Mis Shows ({eventos.length})
          </h2>

          {errorApi && (
            <div className="p-3 bg-red-500/10 border-2 border-red-500 text-red-600 font-mono text-xs uppercase font-bold">
              ⚠ {errorApi}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="border-2 border-text p-8 text-center bg-surface font-mono text-xs uppercase font-black animate-pulse">
                [ Cargando eventos... ]
              </div>
            ) : eventos.length === 0 ? (
              <div className="border-2 border-dashed border-text p-8 text-center bg-surface/50 font-mono text-xs uppercase font-bold text-text-soft">
                No hay eventos para mostrar.
              </div>
            ) : (
              eventos.map((ev) => {
                const esEste = eventoSeleccionado?.id === ev.id;
                const esCancelado = ev.status === "CANCELLED" || ev.status === "INACTIVE";
                return (
                  <div
                    key={ev.id}
                    onClick={() => !esCancelado && seleccionarEvento(ev)}
                    className={`border-2 p-5 transition-all flex flex-col gap-3 ${
                      esCancelado
                        ? "border-text/30 opacity-50 cursor-not-allowed"
                        : esEste
                        ? "bg-text text-surface border-text cursor-pointer"
                        : "bg-surface text-text border-text cursor-pointer hover:shadow-[4px_4px_0px_0px_var(--color-text)]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`font-mono text-[10px] font-black px-1.5 py-0.5 border uppercase ${
                            ev.status === "ACTIVE" || ev.status === "APPROVED"
                              ? "bg-green-400/20 text-green-700 border-green-500"
                              : ev.status === "DRAFT"
                              ? "bg-yellow-400/20 text-yellow-700 border-yellow-500"
                              : ev.status === "CANCELLED" || ev.status === "INACTIVE"
                              ? "bg-red-400/20 text-red-600 border-red-400"
                              : "bg-success/10 text-success border-success/30"
                          }`}
                        >
                          {ev.status === "ACTIVE" || ev.status === "APPROVED"
                            ? "📡 AL AIRE"
                            : ev.status === "DRAFT"
                            ? "📝 BORRADOR"
                            : ev.status === "CANCELLED" || ev.status === "INACTIVE"
                            ? "✕ CANCELADO"
                            : ev.status}
                        </span>
                        <h3 className={`uppercase font-black text-sm mt-1.5 line-clamp-2 ${ev.status === "CANCELLED" || ev.status === "INACTIVE" ? "line-through opacity-60" : ""}`}>
                          {ev.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono whitespace-nowrap">
                        {ev.eventDate
                          ? new Date(ev.eventDate).toLocaleDateString("es-AR")
                          : "S/F"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel derecho — overlay en mobile, columna en desktop */}
        <div className={`space-y-6 lg:col-span-8 ${
          eventoSeleccionado && mostrarPanel
            ? "fixed bottom-0 left-0 right-0 z-[45] max-h-[85vh] overflow-y-auto bg-background border-t-4 border-text pb-8 lg:static lg:max-h-none lg:overflow-visible lg:bg-transparent lg:border-none lg:pb-0"
            : "hidden lg:block"
        }`}>
          {/* Barra de título móvil con cierre */}
          {eventoSeleccionado && mostrarPanel && (
            <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between bg-surface border-b-2 border-text px-4 py-3">
              <span className="font-mono text-xs font-black uppercase truncate pr-4">{eventoSeleccionado.title}</span>
              <button
                onClick={() => setMostrarPanel(false)}
                className="shrink-0 border-2 border-text bg-background px-3 py-1 font-mono text-xs font-black uppercase"
              >
                ✕ Cerrar
              </button>
            </div>
          )}
          <div className="flex gap-2 px-4 pt-2 lg:px-0 lg:pt-0">
            <button
              disabled={!eventoSeleccionado}
              onClick={() => setSeccionActiva("ajustes")}
              className={`px-4 py-2 font-mono text-xs font-black uppercase border-2 border-text ${
                !eventoSeleccionado
                  ? "opacity-30"
                  : seccionActiva === "ajustes"
                  ? "bg-text text-surface"
                  : "bg-surface"
              }`}
            >
              🛠️ Ajustes Avanzados
            </button>
            <button
              disabled={!eventoSeleccionado}
              onClick={() => setSeccionActiva("stats")}
              className={`px-4 py-2 font-mono text-xs font-black uppercase border-2 border-text ${
                !eventoSeleccionado
                  ? "opacity-30"
                  : seccionActiva === "stats"
                  ? "bg-text text-surface"
                  : "bg-surface"
              }`}
            >
              📊 Estadísticas
            </button>
            <button
              onClick={() => router.push("/producer/scanner")}
              className="px-4 py-2 bg-surface text-text font-mono text-xs font-black uppercase border-2 border-text hover:shadow-[2px_2px_0px_0px_var(--color-text)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              📷 Scanner General
            </button>
          </div>

          {!eventoSeleccionado ? (
            <div className="border-2 border-dashed border-text p-12 text-center bg-surface/30 font-mono text-xs uppercase text-text-soft font-bold">
              [ Seleccioná un show de la lista para auditar o editar ]
            </div>
          ) : (
            <div>
              {/* SECCIÓN AJUSTES */}
              {seccionActiva === "ajustes" && (
                <ProducerEventEditForm
                  evento={eventoSeleccionado}
                  categorias={categorias}
                  locaciones={locaciones}
                  loading={loadingAccion}
                  onSave={guardarCambios}
                  onChangeStatus={cambiarStatus}
                  onDelete={eliminarEvento}
                />
              )}

              {/* SECCIÓN STATS */}
              {seccionActiva === "stats" && (
                <div className="bg-surface border-2 border-text p-6 space-y-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
                  <h3 className="text-lg font-black uppercase border-b-2 border-text pb-2">
                    Estadísticas de Ventas
                  </h3>

                  {loadingStats ? (
                    <p className="font-mono text-xs text-text-soft uppercase animate-pulse">[ Cargando stats... ]</p>
                  ) : !eventStats ? (
                    <p className="font-mono text-xs text-text-soft uppercase">Sin datos disponibles.</p>
                  ) : (() => {
                    const totalStock = eventoSeleccionado?.ticketTypes?.reduce((acc, t) => acc + (Number(t.stock) || 0), 0) ?? 0;
                    const totalInitial = eventStats.total + totalStock;
                    const soldPct = totalInitial > 0 ? Math.round((eventStats.total / totalInitial) * 100) : 0;
                    const isLowStock = totalStock > 0 && soldPct >= 80;

                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Vendidas", value: eventStats.total },
                            { label: "Disponibles", value: totalStock },
                            { label: "Asistieron", value: eventStats.arrived },
                            { label: "Sin escanear", value: eventStats.pending },
                          ].map(({ label, value }) => (
                            <div key={label} className="border-2 border-text p-3 text-center bg-background">
                              <span className="block text-2xl font-black text-text">{value}</span>
                              <span className="block text-[10px] font-mono font-bold uppercase text-text-soft mt-1">{label}</span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-mono font-bold uppercase text-text-soft">Progreso de ventas</span>
                            <span className="text-sm font-mono font-black text-text">{soldPct}% vendido</span>
                          </div>
                          <div className="h-4 border-2 border-text bg-background overflow-hidden">
                            <div
                              className={`h-full transition-all ${soldPct >= 100 ? "bg-red-500" : "bg-primary"}`}
                              style={{ width: `${Math.min(soldPct, 100)}%` }}
                            />
                          </div>
                          {isLowStock && soldPct < 100 && (
                            <p className="mt-1.5 text-xs font-mono font-black uppercase text-primary">⚠ Últimas entradas disponibles</p>
                          )}
                          {soldPct >= 100 && (
                            <p className="mt-1.5 text-xs font-mono font-black uppercase text-red-500">⛔ SOLD OUT</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-mono font-black uppercase text-text-soft mb-2">Desglose por zona</h4>
                          <div className="space-y-2">
                            {eventoSeleccionado?.ticketTypes?.map((tt, i) => (
                              <div key={i} className="flex items-center justify-between border-2 border-text p-3 bg-background">
                                <div>
                                  <span className="text-xs font-black uppercase text-text">{tt.zone || tt.name}</span>
                                  <span className="block text-[10px] font-mono text-text-soft">${Number(tt.price).toLocaleString("es-AR")}</span>
                                </div>
                                <div className="text-right">
                                  <span className={`text-sm font-black ${Number(tt.stock) === 0 ? "text-red-500" : "text-text"}`}>
                                    {Number(tt.stock) === 0 ? "AGOTADO" : `${tt.stock} disp.`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-mono font-bold uppercase text-text-soft">Asistencia al evento</span>
                            <span className="text-sm font-mono font-black text-text">{eventStats.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="h-4 border-2 border-text bg-background overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.min(eventStats.percentage, 100)}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs font-mono text-text-soft">{eventStats.arrived} de {eventStats.total} tickets escaneados</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* SECCIÓN SCANNER */}
              {seccionActiva === "scanner" && (
                <div className="bg-surface border-2 border-text p-6 space-y-4 shadow-[4px_4px_0px_0px_var(--color-text)]">
                  <h3 className="text-lg font-black uppercase">Módulo de Control de Accesos</h3>
                  <div className="border-2 border-dashed border-text p-8 text-center font-mono text-xs font-bold text-text-soft">
                    [ Aquí se inicializa la cámara para el escaneo de QRs ]
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
