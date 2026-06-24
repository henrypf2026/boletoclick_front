"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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

  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(
    null,
  );
  const [seccionActiva, setSeccionActiva] = useState<"ajustes" | "stats" | "scanner">(
    "ajustes",
  );
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statusScanner, setStatusScanner] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [ultimosAccesos, setUltimosAccesos] = useState<Acceso[]>([]);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTicketTypes, setFormTicketTypes] = useState<TicketType[]>([]);

  const [loadingAccion, setLoadingAccion] = useState<boolean>(false);
  const [categorias, setCategorias] = useState<ApiItem[]>([]);
  const [locaciones, setLocaciones] = useState<ApiItem[]>([]);

  useEffect(() => {
    const fetchEventosProductor = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/backend/events/producer", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Error al obtener eventos: ${response.status}`);
        }

        const data = await response.json();
        setEventos(data);
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
        fetch("/api/backend/categories").catch(() => null),
        fetch("/api/backend/venues").catch(() => null),
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
    fetch(`/api/backend/tickets/event/${ev.id}/stats`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setEventStats(data); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    setFormTitle(ev.title);
    setFormDescription(ev.description || "");
    setFormDate(ev.eventDate ? ev.eventDate.split("T")[0] : "");

    if (ev.venue && typeof ev.venue === "object") {
      setFormLocation(ev.venue.name || ev.venue.address || "");
    } else {
      setFormLocation(ev.location || (ev.venue as string) || "");
    }

    if (ev.category && typeof ev.category === "object") {
      setFormCategory(ev.category.name || "");
    } else {
      setFormCategory((ev.category as string) || "");
    }

    setFormTicketTypes(
      ev.ticketTypes ? ev.ticketTypes.map((t) => ({ ...t })) : [],
    );
    setStatusScanner("idle");

    if (ev.status === "CONCLUIDO") {
      setSeccionActiva("ajustes");
    }
  };

  const handleTicketTypeChange = (
    index: number,
    field: keyof TicketType,
    value: any,
  ) => {
    setFormTicketTypes((prev) =>
      prev.map((ticket, idx) =>
        idx === index ? { ...ticket, [field]: value } : ticket,
      ),
    );
  };

  const guardarCambios = async () => {
    if (!eventoSeleccionado) return;

    for (let i = 0; i < formTicketTypes.length; i++) {
      const original = eventoSeleccionado.ticketTypes?.[i];
      const modificado = formTicketTypes[i];
      const vendidos = original?.sold || 0;

      if (vendidos > 0) {
        if (original && original.price !== Number(modificado.price)) {
          alert(
            `Error de Seguridad: No podés cambiar el precio de "${modificado.name}" porque ya tiene ${vendidos} entradas vendidas.`,
          );
          return;
        }
        if (Number(modificado.stock) < vendidos) {
          alert(
            `Error de Seguridad: El stock de "${modificado.name}" no puede ser menor a las entradas ya vendidas (${vendidos}).`,
          );
          return;
        }
      }
    }

    setLoadingAccion(true);

    try {
      const payloadDto = {
        title: formTitle,
        description: formDescription,
        eventDate: formDate
          ? new Date(`${formDate}T12:00:00`).toISOString()
          : undefined,
        ticketTypes: formTicketTypes.map((ticket) => ({
          name: ticket.name,
          zone: ticket.zone || ticket.name,
          price: Number(ticket.price),
          stock: Number(ticket.stock),
        })),
      };

      const response = await fetch(
        `/api/backend/events/${eventoSeleccionado.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payloadDto),
        },
      );

      if (!response.ok) {
        throw new Error(`Error del servidor al actualizar: ${response.status}`);
      }

      const eventoActualizadoServidor = await response.json();

      const eventosActualizados = eventos.map((ev) =>
        ev.id === eventoSeleccionado.id
          ? { ...ev, ...eventoActualizadoServidor }
          : ev,
      );
      setEventos(eventosActualizados);
      setEventoSeleccionado(eventoActualizadoServidor);

      alert(
        "¡Ajustes de evento sincronizados y guardados en la base de datos!",
      );
    } catch (error: any) {
      console.error("🚨 Error al guardar cambios en DB:", error);
      alert(
        error.message || "No se pudieron guardar los cambios en el servidor.",
      );
    } finally {
      setLoadingAccion(false);
    }
  };

  const eliminarEvento = async () => {
    if (!eventoSeleccionado) return;

    const confirmar = window.confirm(
      `¿Estás seguro de que querés dar de baja el evento "${eventoSeleccionado.title}"?`,
    );
    if (!confirmar) return;

    const copiaEventosPrevios = [...eventos];
    const idABorrar = eventoSeleccionado.id;

    setEventos(eventos.filter((ev) => ev.id !== idABorrar));
    setEventoSeleccionado(null);
    setLoadingAccion(true);

    try {
      const response = await fetch(`/api/backend/events/${idABorrar}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert(
            "Error 401: Tu sesión expiró o no tenés permisos de Productor activos para borrar este evento. Intentá cerrar sesión y volver a entrar.",
          );
          setEventos(copiaEventosPrevios);
          return;
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      alert("El evento fue dado de baja correctamente en el sistema.");
    } catch (error: any) {
      console.error("🚨 Error en la petición de borrado:", error);
      alert(error.message || "No se pudo completar la baja.");
      setEventos(copiaEventosPrevios);
    } finally {
      setLoadingAccion(false);
    }
  };

  const esConcluido = eventoSeleccionado?.status === "CONCLUIDO";

  const capacidadTotalPantalla = useMemo(() => {
    return formTicketTypes.reduce(
      (acc, curr) => acc + (Number(curr.stock) || 0),
      0,
    );
  }, [formTicketTypes]);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                return (
                  <div
                    key={ev.id}
                    onClick={() => seleccionarEvento(ev)}
                    className={`border-2 border-text p-5 transition-all cursor-pointer flex flex-col gap-3 ${
                      esEste
                        ? "bg-text text-surface"
                        : "bg-surface text-text hover:shadow-[4px_4px_0px_0px_var(--color-text)]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`font-mono text-[10px] font-black px-1.5 py-0.5 border uppercase ${
                            esEste
                              ? "bg-surface text-text border-surface"
                              : "bg-success/10 text-success border-success/30"
                          }`}
                        >
                          {ev.status}
                        </span>
                        <h3 className="uppercase font-black text-sm mt-1.5 line-clamp-2">
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

        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-2">
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
              {seccionActiva === "ajustes" && (
                <div className="bg-surface border-2 border-text p-6 space-y-5 shadow-[4px_4px_0px_0px_var(--color-text)]">
                  <div className="flex justify-between items-center border-b-2 border-text pb-1">
                    <h3 className="text-lg font-black uppercase">
                      Editor Maestro del Evento
                    </h3>
                    <span className="font-mono text-xs bg-secondary/10 border border-text px-2 py-0.5 font-bold uppercase">
                      Capacidad total: {capacidadTotalPantalla} pax
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-text-soft">
                        Título Comercial
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full border-2 border-text p-2 bg-background font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-text-soft">
                        Categoría del Show
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full border-2 border-text p-2 bg-background font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                      >
                        <option value="">-- Seleccioná Categoría --</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-text-soft">
                        Fecha del Evento
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full border-2 border-text p-2 bg-background font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-text-soft">
                        Locación / Estadio
                      </label>
                      <select
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full border-2 border-text p-2 bg-background font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                      >
                        <option value="">-- Seleccioná Lugar --</option>
                        {locaciones.map((ven) => (
                          <option key={ven.id} value={ven.id}>
                            {ven.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-text-soft">
                      Descripción de Cartelera
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full border-2 border-text p-2 bg-background font-medium text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-mono font-black uppercase tracking-tight text-primary">
                      🔒 Gestión Macroeconómica de Tickets
                    </h4>

                    <div className="space-y-3">
                      {formTicketTypes.map((ticket, idx) => {
                        const entradasVendidas = ticket.sold || 0;
                        const tieneVentas = entradasVendidas > 0;

                        return (
                          <div
                            key={idx}
                            className={`p-4 border-2 border-text shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${tieneVentas ? "bg-secondary/5" : "bg-background"}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-mono font-black uppercase text-text">
                                {ticket.name}
                              </span>
                              {tieneVentas && (
                                <span className="text-[10px] font-mono bg-accent text-white font-black px-2 py-0.5 uppercase tracking-tighter">
                                  ⚠️ BLOQUEO ACTIVO: {entradasVendidas} VENDIDAS
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[9px] font-mono font-bold text-text-soft uppercase">
                                  Sector
                                </label>
                                <input
                                  type="text"
                                  value={ticket.zone || ""}
                                  disabled={tieneVentas}
                                  onChange={(e) =>
                                    handleTicketTypeChange(
                                      idx,
                                      "zone",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border border-text p-1.5 bg-background font-bold text-xs uppercase disabled:opacity-50 disabled:bg-surface"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] font-mono font-bold text-text-soft uppercase">
                                  Precio ($)
                                </label>
                                <input
                                  type="number"
                                  value={ticket.price === 0 ? "" : ticket.price}
                                  disabled={tieneVentas}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value);
                                    handleTicketTypeChange(idx, "price", val);
                                  }}
                                  className="w-full border border-text p-1.5 bg-background font-mono text-xs disabled:opacity-50 disabled:bg-surface"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] font-mono font-bold text-text-soft uppercase">
                                  Stock Disponible
                                </label>
                                <input
                                  type="number"
                                  value={ticket.stock === 0 ? "" : ticket.stock}
                                  min={entradasVendidas}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value);
                                    handleTicketTypeChange(idx, "stock", val);
                                  }}
                                  className="w-full border border-text p-1.5 bg-background font-mono text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={guardarCambios}
                      disabled={loadingAccion}
                      className="flex-1 bg-primary text-background border-2 border-text py-2.5 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none"
                    >
                      {loadingAccion
                        ? "[ ACTUALIZANDO... ]"
                        : "💾 GUARDAR AJUSTES AVANZADOS"}
                    </button>

                    <button
                      onClick={eliminarEvento}
                      disabled={loadingAccion}
                      className="bg-red-600 text-white border-2 border-red-800 px-4 py-2.5 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none disabled:opacity-50"
                    >
                      {loadingAccion ? "[ PROCESANDO... ]" : "🗑️ DAR DE BAJA"}
                    </button>
                  </div>
                </div>
              )}

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
                            {eventoSeleccionado?.ticketTypes?.map((tt, i) => {
                              const zoneSold = totalInitial > 0 ? Math.max(0, eventStats.total - totalStock) : 0;
                              const zonePct = (Number(tt.stock) === 0 && totalInitial > 0) ? 100 : 0;
                              return (
                                <div key={i} className="flex items-center justify-between border-2 border-text p-3 bg-background">
                                  <div>
                                    <span className="text-xs font-black uppercase text-text">{tt.zone || tt.name}</span>
                                    <span className="block text-[10px] font-mono text-text-soft">${Number(tt.price).toLocaleString('es-AR')}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-sm font-black ${Number(tt.stock) === 0 ? "text-red-500" : "text-text"}`}>
                                      {Number(tt.stock) === 0 ? "AGOTADO" : `${tt.stock} disp.`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
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

              {seccionActiva === "scanner" && (
                <div className="bg-surface border-2 border-text p-6 space-y-4 shadow-[4px_4px_0px_0px_var(--color-text)]">
                  <h3 className="text-lg font-black uppercase">
                    Módulo de Control de Accesos
                  </h3>
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
