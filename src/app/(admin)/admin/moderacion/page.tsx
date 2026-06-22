"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import {
  X,
  Eye,
  SlidersHorizontal,
  Search,
  Calendar,
  MapPin,
  Users,
  CheckSquare,
  Square,
  Trash2,
  ShieldCheck,
} from "lucide-react";

type TabModeracion = "PENDIENTES" | "CATALOGO";

export default function AdminModeracion() {
  const router = useRouter();
  const { eventos, setEventos } = useAdmin();

  const [activeTab, setActiveTab] = useState<TabModeracion>("PENDIENTES");
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const [filtroProductor, setFiltroProductor] = useState<string>("ALL");
  const [filtroEstado, setFiltroEstado] = useState<string>("ALL");
  const [busquedaTexto, setBusquedaTexto] = useState<string>("");

  const [selectedEvento, setSelectedEvento] = useState<any | null>(null);

  const [seleccionados, setSeleccionados] = useState<number[]>([]);

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

    if (selectedEvento && selectedEvento.id === id) {
      setSelectedEvento((prev: any) => ({ ...prev, estado: nuevoEstado }));
    }

    setSeleccionados((prev) => prev.filter((item) => item !== id));
  };

  const resolverModeracionEnLote = (nuevoEstado: "APROBADO" | "RECHAZADO") => {
    if (seleccionados.length === 0) return;

    setEventos(
      eventos.map((ev) =>
        seleccionados.includes(ev.id) ? { ...ev, estado: nuevoEstado } : ev,
      ),
    );

    triggerNotificacion(
      `SE PROCESARON ${seleccionados.length} EVENTOS EN LOTE COMO: ${nuevoEstado}`,
    );
    setSeleccionados([]);
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const listaProductores = useMemo(() => {
    const productores = eventos.map((ev) => ev.productor);
    return ["ALL", ...Array.from(new Set(productores))];
  }, [eventos]);

  const conteoPendientes = useMemo(() => {
    return eventos.filter((e) => e.estado === "PENDIENTE").length;
  }, [eventos]);

  const eventosCatalogados = useMemo(() => {
    return eventos.filter((ev) => {
      if (ev.estado === "PENDIENTE") return false;

      const cumpleProductor =
        filtroProductor === "ALL" || ev.productor === filtroProductor;
      const cumpleEstado = filtroEstado === "ALL" || ev.estado === filtroEstado;
      const cumpleTexto =
        ev.titulo.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
        ev.ubicacion.toLowerCase().includes(busquedaTexto.toLowerCase());

      return cumpleProductor && cumpleEstado && cumpleTexto;
    });
  }, [eventos, filtroProductor, filtroEstado, busquedaTexto]);

  const metricas = useMemo(() => {
    const activos = eventos.filter((e) => e.estado === "APROBADO");
    return {
      totalShows: activos.length,
      aforoAcumulado: activos.reduce((acc, ev) => acc + ev.aforo, 0),
      cajaPotencial: activos.reduce(
        (acc, ev) => acc + ev.precioBase * ev.aforo,
        0,
      ),
    };
  }, [eventos]);

  const esTodoSeleccionado =
    eventosCatalogados.length > 0 &&
    eventosCatalogados.every((ev) => seleccionados.includes(ev.id));
  const toggleSeleccionarTodoCatalogo = () => {
    if (esTodoSeleccionado) {
      setSeleccionados((prev) =>
        prev.filter((id) => !eventosCatalogados.some((ev) => ev.id === id)),
      );
    } else {
      const idsCatalogados = eventosCatalogados.map((ev) => ev.id);
      setSeleccionados((prev) =>
        Array.from(new Set([...prev, ...idsCatalogados])),
      );
    }
  };

  return (
    <div className="min-h-screen bg-color-bg text-color-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-8 selection:bg-color-accent selection:text-color-background relative overflow-x-hidden pb-24">
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 bg-color-text text-color-background border-4 border-color-border px-4 py-3 text-xs font-black uppercase shadow-[4px_4px_0px_0px_var(--border)] animate-fade-in-up">
          ⚡ {notificacion}
        </div>
      )}

      <div className="border-b-4 border-color-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <button
            onClick={() => router.push("/dashboard-admin")}
            className="text-xs font-black uppercase text-color-text-soft hover:text-color-text mb-2 block transition-colors cursor-pointer"
          >
            ← Volver a Consola
          </button>
          <h1 className="text-2xl md:text-3xl text-color-text">
            Moderación de Eventos
          </h1>
          <p className="text-color-text-soft text-xs uppercase font-bold tracking-wide mt-1">
            Curaduría del catálogo público, control de aforo y estados de
            publicación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-4 border-color-border bg-color-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--border)]">
          <span className="text-[10px] text-color-text-soft uppercase font-black block tracking-wider">
            Total Catálogo Activo
          </span>
          <span className="text-xl md:text-2xl font-black text-color-text">
            {metricas.totalShows} Shows
          </span>
        </div>
        <div className="border-4 border-color-border bg-color-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--border)]">
          <span className="text-[10px] text-color-text-soft uppercase font-black block tracking-wider">
            Aforo Total Custodiado
          </span>
          <span className="text-xl md:text-2xl font-black text-color-primary dark:text-color-text">
            {metricas.aforoAcumulado.toLocaleString()} Pax
          </span>
        </div>
        <div className="border-4 border-color-border bg-color-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--border)]">
          <span className="text-[10px] text-color-text-soft uppercase font-black block tracking-wider">
            Volumen de Caja Potencial
          </span>
          <span className="text-xl md:text-2xl font-black text-color-success">
            ${metricas.cajaPotencial.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex border-4 border-color-border bg-color-surface-2 p-1 max-w-md shadow-[4px_4px_0px_0px_var(--border)]">
        <button
          onClick={() => {
            setActiveTab("PENDIENTES");
            setSeleccionados([]);
          }}
          className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
            activeTab === "PENDIENTES"
              ? "bg-color-primary text-color-bg dark:text-color-background shadow-[2px_2px_0px_0px_var(--border)] border-2 border-color-border"
              : "text-color-text-soft hover:text-color-text font-bold"
          }`}
        >
          📥 Por Autorizar ({conteoPendientes})
        </button>
        <button
          onClick={() => {
            setActiveTab("CATALOGO");
            setSeleccionados([]);
          }}
          className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
            activeTab === "CATALOGO"
              ? "bg-color-primary text-color-bg dark:text-color-background shadow-[2px_2px_0px_0px_var(--border)] border-2 border-color-border"
              : "text-color-text-soft hover:text-color-text font-bold"
          }`}
        >
          🗂️ Catálogo Activo
        </button>
      </div>

      <div
        className="bg-color-surface border-4 border-color-border p-6 shadow-[4px_4px_0px_0px_var(--border)] space-y-4"
        data-show={activeTab === "PENDIENTES"}
      >
        <div className="border-b-2 border-color-border pb-3 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-wider text-color-text">
            Solicitudes de Publicación Recientes
          </h2>
          {eventos.filter((ev) => ev.estado === "PENDIENTE").length > 0 && (
            <button
              onClick={() => {
                const pendientesIds = eventos
                  .filter((ev) => ev.estado === "PENDIENTE")
                  .map((ev) => ev.id);
                setSeleccionados(
                  seleccionados.length === pendientesIds.length
                    ? []
                    : pendientesIds,
                );
              }}
              className="text-[10px] font-black uppercase border-2 border-color-border bg-color-surface-2 px-2 py-1 shadow-[2px_2px_0px_0px_var(--border)] cursor-pointer"
            >
              {seleccionados.length ===
              eventos.filter((ev) => ev.estado === "PENDIENTE").length
                ? "Desmarcar Todos"
                : "Marcar Todos"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventos.filter((ev) => ev.estado === "PENDIENTE").length > 0 ? (
            eventos
              .filter((ev) => ev.estado === "PENDIENTE")
              .map((ev) => {
                const isSelected = seleccionados.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    className={`border-4 border-color-border p-5 bg-color-bg shadow-[4px_4px_0px_0px_var(--border)] flex flex-col justify-between space-y-4 relative transition-all ${isSelected ? "translate-x-1 translate-y-1 shadow-[2px_2px_0px_0px_var(--border)] border-color-primary" : ""}`}
                  >
                    <button
                      onClick={() => toggleSeleccion(ev.id)}
                      className="absolute top-4 right-4 text-color-text hover:text-color-primary transition-colors cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-color-primary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>

                    <div className="space-y-2 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-color-surface-2 text-color-text font-black px-2 py-0.5 border border-color-border uppercase">
                          {ev.categoria}
                        </span>
                        {ev.aforo >= 5000 && (
                          <span className="bg-color-accent text-color-background font-black text-[8px] px-1.5 py-0.5 border border-color-border animate-pulse">
                            🚨 MASIVO
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-base uppercase tracking-tight text-color-text line-clamp-2">
                        {ev.titulo}
                      </h3>
                      <p className="text-[10px] text-color-text-soft font-bold">
                        Productor:{" "}
                        <span className="text-color-text underline">
                          {ev.productor}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-color-text-soft uppercase">
                      <div className="bg-color-surface-2 p-2 border border-color-border/10">
                        📍 Lugar:{" "}
                        <span className="text-color-text font-black block truncate">
                          {ev.ubicacion}
                        </span>
                      </div>
                      <div className="bg-color-surface-2 p-2 border border-color-border/10">
                        💰 Valor Base:{" "}
                        <span className="text-color-success font-black block">
                          ${ev.precioBase.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-color-border/10">
                      <button
                        onClick={() =>
                          resolverModeracion(ev.id, ev.titulo, "RECHAZADO")
                        }
                        className="flex-1 py-1.5 border-2 border-color-border text-[10px] font-black text-color-accent bg-color-surface hover:bg-color-accent hover:text-color-background active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer uppercase shadow-[2px_2px_0px_0px_var(--border)]"
                      >
                        ✕ Rechazar
                      </button>
                      <button
                        onClick={() =>
                          resolverModeracion(ev.id, ev.titulo, "APROBADO")
                        }
                        className="flex-1 py-1.5 border-2 border-color-border text-[10px] font-black bg-color-text text-color-bg dark:text-color-background hover:bg-color-primary hover:text-color-bg active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer uppercase shadow-[2px_2px_0px_0px_var(--border)]"
                      >
                        ✓ Autorizar
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="col-span-full text-center py-12 text-color-text-soft text-xs font-black uppercase">
              🎉 No hay eventos pendientes de moderación en este momento.
            </div>
          )}
        </div>
      </div>

      <div
        className="bg-color-surface border-4 border-color-border p-6 shadow-[4px_4px_0px_0px_var(--border)] space-y-6"
        data-show={activeTab === "CATALOGO"}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-color-surface-2 p-3 border-2 border-color-border shadow-[2px_2px_0px_0px_var(--border)]">
          <div className="flex items-center bg-color-surface border-2 border-color-border px-2 py-1.5 text-xs gap-2">
            <Search size={14} className="text-color-text-soft" />
            <input
              type="text"
              placeholder="Buscar evento o lugar..."
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              className="bg-transparent font-bold focus:outline-none w-full text-color-text placeholder:text-color-text-soft/40"
            />
          </div>

          <div className="flex items-center bg-color-surface border-2 border-color-border px-2 py-1 text-xs gap-1">
            <SlidersHorizontal size={14} className="text-color-text-soft" />
            <select
              value={filtroProductor}
              onChange={(e) => setFiltroProductor(e.target.value)}
              className="bg-transparent font-bold focus:outline-none w-full text-color-text cursor-pointer"
            >
              <option value="ALL" className="bg-color-surface">
                Todos los Productores
              </option>
              {listaProductores
                .filter((p) => p !== "ALL")
                .map((prod) => (
                  <option key={prod} value={prod} className="bg-color-surface">
                    {prod}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center bg-color-surface border-2 border-color-border px-2 py-1 text-xs gap-1">
            <span className="font-black text-color-text-soft">⚡</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-transparent font-bold focus:outline-none w-full text-color-text cursor-pointer"
            >
              <option value="ALL" className="bg-color-surface">
                Cualquier Estado
              </option>
              <option value="APROBADO" className="bg-color-surface">
                Aprobados
              </option>
              <option value="RECHAZADO" className="bg-color-surface">
                Rechazados
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-160">
            <thead>
              <tr className="bg-color-text text-color-background font-black text-[10px] uppercase tracking-wider border-b-2 border-color-border">
                <th className="p-3 w-10 text-center">
                  <button
                    onClick={toggleSeleccionarTodoCatalogo}
                    className="cursor-pointer text-color-background hover:text-color-primary transition-colors"
                  >
                    {esTodoSeleccionado ? (
                      <CheckSquare size={15} />
                    ) : (
                      <Square size={15} />
                    )}
                  </button>
                </th>
                <th className="p-3">Título / Productor</th>
                <th className="p-3">Ubicación / Capacidad</th>
                <th className="p-3 text-right">Precio</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-color-border/10 bg-color-bg font-bold font-mono">
              {eventosCatalogados.length > 0 ? (
                eventosCatalogados.map((ev) => {
                  const isAprobado = ev.estado === "APROBADO";
                  const isChecked = seleccionados.includes(ev.id);
                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-color-surface-2/40 transition-colors ${!isAprobado ? "opacity-60 bg-color-surface-2/10" : ""} ${isChecked ? "bg-color-primary/5" : ""}`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleSeleccion(ev.id)}
                          className="cursor-pointer text-color-text hover:text-color-primary"
                        >
                          {isChecked ? (
                            <CheckSquare
                              size={14}
                              className="text-color-primary"
                            />
                          ) : (
                            <Square size={14} />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <p className="font-black uppercase text-color-text text-xs">
                            {ev.titulo}
                          </p>
                          {ev.aforo >= 5000 && (
                            <span className="bg-color-accent text-color-background font-black text-[8px] px-1.5 py-0.5 border border-color-border animate-pulse">
                              🚨 MASIVO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-color-text-soft lowercase font-bold">
                          {ev.productor}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-color-text uppercase font-bold text-[10px] truncate max-w-48">
                          {ev.ubicacion}
                        </p>
                        <span className="text-[9px] text-color-text-soft">
                          Aforo: {ev.aforo.toLocaleString()} personas
                        </span>
                      </td>
                      <td className="p-3 text-right text-color-text font-black">
                        ${ev.precioBase.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-black border uppercase inline-block ${
                            isAprobado
                              ? "bg-color-primary/10 text-color-primary border-color-primary/30 dark:text-color-text"
                              : "bg-color-accent/10 text-color-accent border-color-accent/30 dark:text-color-text"
                          }`}
                        >
                          {ev.estado}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEvento(ev)}
                            className="p-1.5 border-2 border-color-border bg-color-surface hover:bg-color-surface-2 transition-all cursor-pointer shadow-[1px_1px_0px_0px_var(--border)] text-color-text"
                            title="Ver Desglose"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() =>
                              resolverModeracion(
                                ev.id,
                                ev.titulo,
                                isAprobado ? "RECHAZADO" : "APROBADO",
                              )
                            }
                            className={`px-2 py-1 border-2 border-color-border text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_var(--border)] cursor-pointer transition-all ${
                              isAprobado
                                ? "bg-color-surface text-color-accent hover:bg-color-accent hover:text-color-background"
                                : "bg-color-text text-color-background hover:bg-color-primary hover:text-color-background"
                            }`}
                          >
                            {isAprobado ? "Bajar" : "Alta"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-color-text-soft text-[10px] uppercase font-black"
                  >
                    No se encontraron eventos cargados en este rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {seleccionados.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-color-surface border-4 border-color-border p-4 shadow-[6px_6px_0px_0px_var(--border)] flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up w-[90%] max-w-xl">
          <div className="text-xs uppercase font-black text-center sm:text-left">
            ⚡{" "}
            <span className="text-color-primary">{seleccionados.length}</span>{" "}
            {seleccionados.length === 1
              ? "evento seleccionado"
              : "eventos seleccionados"}
          </div>
          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={() => resolverModeracionEnLote("RECHAZADO")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 border-2 border-color-border text-[10px] font-black uppercase bg-color-surface text-color-accent hover:bg-color-accent hover:text-color-background transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--border)]"
            >
              <Trash2 size={12} /> Rechazar Lote
            </button>
            <button
              onClick={() => resolverModeracionEnLote("APROBADO")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 border-2 border-color-border text-[10px] font-black uppercase bg-color-text text-color-bg dark:text-color-background hover:bg-color-primary hover:text-color-bg transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--border)]"
            >
              <ShieldCheck size={12} /> Autorizar Lote
            </button>
          </div>
        </div>
      )}

      {selectedEvento && (
        <>
          <div
            onClick={() => setSelectedEvento(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-115 bg-color-surface border-l-4 border-color-border z-50 p-6 shadow-[-8px_0px_0px_0px_var(--border)] flex flex-col justify-between font-mono animate-slide-in-right">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b-2 border-color-border pb-3">
                <span className="text-[10px] font-black uppercase bg-color-text text-color-background px-2 py-0.5 border border-color-border">
                  Detalles del Catálogo
                </span>
                <button
                  onClick={() => setSelectedEvento(null)}
                  className="p-1 border-2 border-color-border bg-color-surface-2 hover:bg-color-accent hover:text-color-background transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-color-primary uppercase tracking-wider">
                    {selectedEvento.categoria}
                  </span>
                  {selectedEvento.aforo >= 5000 && (
                    <span className="bg-color-accent text-color-background text-[8px] font-black px-1 border border-color-border">
                      MASIVO
                    </span>
                  )}
                </div>
                <h3 className="font-black text-xl uppercase tracking-tight text-color-text mt-0.5">
                  {selectedEvento.titulo}
                </h3>
                <p className="text-[10px] text-color-text-soft font-bold mt-1">
                  ID de Control Técnico:{" "}
                  <span className="text-color-text font-mono">
                    #EV-00{selectedEvento.id}
                  </span>
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3 bg-color-bg p-2.5 border-2 border-color-border shadow-[2px_2px_0px_0px_var(--border)]">
                  <MapPin size={16} className="text-color-primary shrink-0" />
                  <div className="text-[11px] font-bold uppercase text-color-text truncate">
                    <span className="text-color-text-soft block text-[9px]">
                      Ubicación del Show:
                    </span>
                    {selectedEvento.ubicacion}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-color-bg p-2.5 border-2 border-color-border shadow-[2px_2px_0px_0px_var(--border)]">
                  <Users size={16} className="text-color-accent shrink-0" />
                  <div className="text-[11px] font-bold uppercase text-color-text">
                    <span className="text-color-text-soft block text-[9px]">
                      Capacidad de Público (Aforo):
                    </span>
                    {selectedEvento.aforo.toLocaleString()} Personas
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-color-bg p-2.5 border-2 border-color-border shadow-[2px_2px_0px_0px_var(--border)]">
                  <Calendar
                    size={16}
                    className="text-color-text-soft shrink-0"
                  />
                  <div className="text-[11px] font-bold uppercase text-color-text">
                    <span className="text-color-text-soft block text-[9px]">
                      Productor Responsable:
                    </span>
                    <span className="lowercase underline font-medium">
                      {selectedEvento.productor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-color-surface-2 border-2 border-color-border p-4 space-y-3 mt-4">
                <h5 className="text-[10px] font-black uppercase tracking-wider border-b border-color-border/30 pb-1 text-color-text">
                  📊 Taquilla Estimada
                </h5>
                <div className="space-y-1.5 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-color-text-soft">
                      Precio Unitario Neto:
                    </span>
                    <span className="text-color-text">
                      ${selectedEvento.precioBase.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-color-accent dark:text-color-text-soft">
                    <span>Aforo Total Planificado:</span>
                    <span>{selectedEvento.aforo.toLocaleString()} tickets</span>
                  </div>
                  <div className="border-t border-dashed border-color-border/40 pt-1.5 flex justify-between font-black text-color-primary dark:text-color-text uppercase">
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

            <div className="border-t-2 border-color-border pt-4 mt-auto space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold mb-2">
                <span className="text-color-text-soft uppercase">
                  Estado en cartelera:
                </span>
                <span
                  className={`px-2 py-0.5 border font-black uppercase ${
                    selectedEvento.estado === "APROBADO"
                      ? "bg-color-primary/20 text-color-primary border-color-primary/30 dark:text-color-text"
                      : "bg-color-accent text-color-background border-color-border"
                  }`}
                >
                  {selectedEvento.estado}
                </span>
              </div>

              <button
                onClick={() =>
                  resolverModeracion(
                    selectedEvento.id,
                    selectedEvento.titulo,
                    selectedEvento.estado === "APROBADO"
                      ? "RECHAZADO"
                      : "APROBADO",
                  )
                }
                className={`w-full py-2.5 border-2 border-color-border font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  selectedEvento.estado === "APROBADO"
                    ? "bg-color-surface text-color-accent hover:bg-color-accent hover:text-color-background"
                    : "bg-color-text text-color-background hover:bg-color-primary hover:text-color-background"
                }`}
              >
                {selectedEvento.estado === "APROBADO"
                  ? "⚠️ Dar de Baja del Sistema"
                  : "✓ Volver a Dar de Alta"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
