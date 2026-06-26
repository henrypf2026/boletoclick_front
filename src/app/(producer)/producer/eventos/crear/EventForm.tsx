"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface TicketType {
  name: string;
  price: number;
  stock: number;
  zone: string;
}

interface ApiItem {
  id: string;
  name: string;
}

// Venue con capacity para validar stock
interface Venue extends ApiItem {
  capacity: number;
}

//limite de fechas
const HOY = (() => {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
})();

const FECHA_MAXIMA = (() => {
  const max = new Date();
  max.setFullYear(max.getFullYear() + 1);
  const yyyy = max.getFullYear();
  const mm = String(max.getMonth() + 1).padStart(2, "0");
  const dd = String(max.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
})();

//limite de imagen
const MAX_IMAGE_SIZE_MB = 2;
const FORMATOS_VALIDOS = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function EventForm() {
  const router = useRouter();

  const [evento, setEvento] = useState({
    title: "",
    description: "",
    fecha: "",
    hora: "",
    venueId: "",
    categoryId: "",
  });

  const [eventStatus, setEventStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");

  const [categorias, setCategorias] = useState<ApiItem[]>([]);
  const [locaciones, setLocaciones] = useState<Venue[]>([]);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: "General", price: 0, stock: 100, zone: "Planta Baja" },
  ]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    const cargarDatosDesplegables = async () => {
      try {
        const [resCat, resVen] = await Promise.all([
          fetch(`/api/backend/categories`).catch(() => null),
          fetch(`/api/backend/venues`).catch(() => null),
        ]);

        if (resCat && resCat.ok) {
          const dataCat = await resCat.json();
          // Orden alfabético de categorías
          const categoriasOrdenadas = [...dataCat].sort((a: ApiItem, b: ApiItem) =>
            a.name.localeCompare(b.name, "es")
          );
          setCategorias(categoriasOrdenadas);
        }
        if (resVen && resVen.ok) {
          const dataVen = await resVen.json();
          // Orden alfabético de venues
          const venuesOrdenados = [...dataVen].sort((a: Venue, b: Venue) =>
            a.name.localeCompare(b.name, "es")
          );
          setLocaciones(venuesOrdenados);
        }
      } catch (err) {
        console.error("Error al cargar datos del servidor:", err);
      }
    };

    cargarDatosDesplegables();
  }, []);

  const handleEventoChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setEvento({ ...evento, [e.target.name]: e.target.value });
  };

  // fecha de validacion
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvento({ ...evento, fecha: e.target.value });
  };



  const handleFechaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fechaSeleccionada = e.target.value;
    if (!fechaSeleccionada) return;

    if (fechaSeleccionada > FECHA_MAXIMA ) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: `La fecha del evento debe estar entre hoy y ${FECHA_MAXIMA}.`,
        confirmButtonColor: "#171717",
      });
      setEvento({ ...evento, fecha: "" });
      return;
    }

    // Advertencia si el evento es hoy
    if (fechaSeleccionada === HOY) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ El evento es hoy",
        text: "Estás creando un evento para el día de hoy. Asegurate de que haya tiempo suficiente para que los asistentes se enteren y compren sus entradas.",
        confirmButtonColor: "#171717",
        confirmButtonText: "Entendido",
      });
    }
  };

  // imagen con validacion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!FORMATOS_VALIDOS.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Formato no permitido",
        text: "Solo se aceptan imágenes JPG, PNG, GIF o WEBP.",
        confirmButtonColor: "#171717",
      });
      e.target.value = "";
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      Swal.fire({
        icon: "error",
        title: "Imagen demasiado grande",
        text: `El archivo pesa ${sizeMB.toFixed(1)}MB. El máximo permitido es ${MAX_IMAGE_SIZE_MB}MB.`,
        confirmButtonColor: "#171717",
      });
      e.target.value = "";
      return;
    }

    setArchivoImagen(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const agregarLocalidad = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", price: 0, stock: 50, zone: "Sector Estándar" },
    ]);
  };

  const eliminarLocalidad = (index: number) => {
    if (ticketTypes.length === 1) return;
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleLocalidadChange = (
    index: number,
    field: keyof TicketType,
    value: string,
  ) => {
    const nuevosTickets = [...ticketTypes];
    nuevosTickets[index] = {
      ...nuevosTickets[index],
      [field]: field === "name" || field === "zone" ? value : Number(value),
    };
    setTicketTypes(nuevosTickets);
  };

  // Helper: capacidad del venue seleccionado
  const capacidadVenue = locaciones.find((v) => v.id === evento.venueId)?.capacity ?? null;
  const stockTotal = ticketTypes.reduce((acc, t) => acc + Number(t.stock), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    if (!archivoImagen) {
      setStatus({
        type: "error",
        msg: "El poster o imagen del evento es obligatorio.",
      });
      setLoading(false);
      return;
    }

    const ticketInvalido = ticketTypes.find(
      (t) =>
        t.name.trim() === "" ||
        String(t.price) === "" ||
        String(t.stock) === "" ||
        Number(t.price) <= 0 ||
        Number(t.stock) <= 0,
    );

    if (ticketInvalido) {
      setStatus({
        type: "error",
        msg: "Todos los tipos de entrada necesitan nombre, precio mayor a 0 y stock mayor a 0.",
      });
      setLoading(false);
      return;
    }

    // Validación stock vs capacidad del venue
    if (capacidadVenue !== null && stockTotal > capacidadVenue) {
      Swal.fire({
        icon: "error",
        title: "Stock supera la capacidad del lugar",
        html: `La suma de entradas (<strong>${stockTotal}</strong>) supera la capacidad del venue (<strong>${capacidadVenue}</strong>). Reducí el stock total en ${stockTotal - capacidadVenue} entradas.`,
        confirmButtonColor: "#171717",
      });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", evento.title.trim());
      formData.append("description", evento.description.trim());
      formData.append("venueId", evento.venueId);
      formData.append("categoryId", evento.categoryId);

      const combinedDate = new Date(
        `${evento.fecha}T${evento.hora}:00`
      ).toISOString();
      formData.append("eventDate", combinedDate);
      formData.append("status", eventStatus);

      const ticketsLimpios = ticketTypes.map((ticket) => ({
        name: ticket.name.trim(),
        price: Number(ticket.price),
        stock: Math.floor(Number(ticket.stock)),
        zone: ticket.zone.trim(),
      }));

      formData.append("ticketTypes", JSON.stringify(ticketsLimpios));
      formData.append("poster", archivoImagen);

      console.log(`🚀 Enviando evento con estado: ${eventStatus}`);

      const res = await fetch(`/api/backend/events`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(responseData.message)
            ? responseData.message.join(" | ")
            : responseData.message ||
                "Error al procesar el guardado del evento.",
        );
      }

      // Éxito: preguntamos qué quiere hacer
      const { isConfirmed } = await Swal.fire({
        icon: "success",
        title: "¡Evento creado!",
        text: `El evento fue guardado en estado ${eventStatus === "ACTIVE" ? "AL AIRE 📡" : "BORRADOR 📝"}. ¿Qué querés hacer ahora?`,
        confirmButtonText: "Ir a Mis Eventos",
        cancelButtonText: "Crear otro evento",
        showCancelButton: true,
        confirmButtonColor: "#171717",
        cancelButtonColor: "#6750e0",
      });

      if (isConfirmed) {
        router.push("/producer/dashboard");
      } else {
        // Limpiar formulario para crear otro
        setEvento({ title: "", description: "", fecha: "", hora: "", venueId: "", categoryId: "" });
        setEventStatus("DRAFT");
        setArchivoImagen(null);
        setPreviewUrl(null);
        setTicketTypes([{ name: "General", price: 0, stock: 100, zone: "Planta Baja" }]);
        setStatus(null);
      }
    } catch (error: any) {
      setStatus({
        type: "error",
        msg: error.message || "Error de conexión con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <div
          className={`border-4 border-border p-4 font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] ${
            status.type === "success"
              ? "bg-success text-black"
              : "bg-accent text-white"
          }`}
        >
          {status.msg}
        </div>
      )}

      <div className="bg-surface border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
        <h2 className="text-lg font-black uppercase tracking-wider text-text border-b-2 border-border pb-2">
          1. Detalles del Evento
        </h2>

        {/* Selector de estado DRAFT / ACTIVE */}
        <div className="flex items-center gap-4 bg-background border-2 border-dashed border-border p-4 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]">
          <span className="text-xs font-black uppercase tracking-wide text-text">
            Estado del evento:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEventStatus("DRAFT")}
              className={`px-4 py-2 text-xs font-black uppercase border-2 border-border shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] transition-all ${
                eventStatus === "DRAFT"
                  ? "bg-yellow-400 text-black"
                  : "bg-background text-text opacity-50"
              }`}
            >
              📝 Borrador
            </button>
            <button
              type="button"
              onClick={() => setEventStatus("ACTIVE")}
              className={`px-4 py-2 text-xs font-black uppercase border-2 border-border shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] transition-all ${
                eventStatus === "ACTIVE"
                  ? "bg-green-400 text-black"
                  : "bg-background text-text opacity-50"
              }`}
            >
              📡 Al Aire
            </button>
          </div>
          <span className="text-[10px] text-text-soft">
            {eventStatus === "DRAFT"
              ? "El evento no será visible para el público hasta que lo pongas Al Aire."
              : "El evento será visible y aceptará ventas inmediatamente."}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-background border-2 border-dashed border-border p-4 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase tracking-wide text-text block">
              Poster / Portada del Evento
            </label>
            <p className="text-[10px] font-medium text-text-soft">
              Formato JPG, PNG, GIF o WEBP. Tamaño máximo: {MAX_IMAGE_SIZE_MB}MB.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-text file:mr-4 file:py-2 file:px-4 file:border-2 file:border-border file:text-xs file:font-black file:uppercase file:bg-secondary file:text-text file:cursor-pointer hover:file:-translate-y-0.5 transition-transform"
            />
          </div>

          <div className="flex justify-center items-center">
            {previewUrl ? (
              <div className="border-4 border-border bg-surface p-1 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] max-h-35 overflow-hidden aspect-video flex justify-center items-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-27.5 bg-surface border-2 border-border flex items-center justify-center text-center p-2 shadow-[2px_2px_0px_0px_rgba(23,23,23,1)]">
                <p className="text-[10px] font-black uppercase text-text-soft/60 tracking-wider">
                  Sin vista previa
                </p>
              </div>
            )}
          </div>
        </div>

        <input
          type="text"
          name="title"
          value={evento.title}
          onChange={handleEventoChange}
          required
          placeholder="Nombre del Evento"
          className="w-full p-3 border-2 border-border bg-background text-text font-medium shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] text-sm"
        />

        <label className="text-xs font-black uppercase tracking-wide text-text block">
          Día y hora del evento
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            name="fecha"
            value={evento.fecha}
            onChange={handleFechaChange}
            onBlur={handleFechaBlur}
            required
            min={HOY}
            max={FECHA_MAXIMA}
            className="p-3 border-2 border-border bg-background text-text text-sm"
          />
          <input
            type="time"
            name="hora"
            value={evento.hora}
            onChange={handleEventoChange}
            required
            className="p-3 border-2 border-border bg-background text-text text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="categoryId"
            value={evento.categoryId}
            onChange={handleEventoChange}
            required
            className="p-3 border-2 border-border bg-background text-text font-bold text-sm shadow-[2px_2px_0px_0px_rgba(23,23,23,1)]"
          >
            <option value="">-- Seleccioná Categoría --</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            name="venueId"
            value={evento.venueId}
            onChange={handleEventoChange}
            required
            className="p-3 border-2 border-border bg-background text-text font-bold text-sm shadow-[2px_2px_0px_0px_rgba(23,23,23,1)]"
          >
            <option value="">-- Seleccioná Lugar --</option>
            {locaciones.map((ven) => (
              <option key={ven.id} value={ven.id}>
                {ven.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          name="description"
          rows={3}
          value={evento.description}
          onChange={handleEventoChange}
          required
          placeholder="Descripción..."
          className="w-full p-3 border-2 border-border bg-background text-text text-sm shadow-[2px_2px_0px_0px_rgba(23,23,23,1)]"
        />
      </div>

      <div className="bg-surface border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] space-y-4">
        <div className="flex justify-between items-center border-b-2 border-border pb-2">
          <h2 className="text-lg font-black uppercase tracking-wider text-text">
            2. Tipos de Entradas
          </h2>
          <button
            type="button"
            onClick={agregarLocalidad}
            className="bg-secondary text-text border-2 border-border px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(23,23,23,1)]"
          >
            + Añadir
          </button>
        </div>

        {/* Indicador de stock vs capacidad */}
        {capacidadVenue !== null && (
          <div
            className={`text-xs font-bold px-4 py-2 border-2 border-border ${
              stockTotal > capacidadVenue
                ? "bg-red-500/10 text-red-500 border-red-500"
                : "bg-success/10 text-success border-success"
            }`}
          >
            {stockTotal > capacidadVenue
              ? `⚠️ Stock total (${stockTotal}) supera la capacidad del venue (${capacidadVenue}). Exceso: ${stockTotal - capacidadVenue} entradas.`
              : `✅ Stock total: ${stockTotal} / ${capacidadVenue} lugares disponibles.`}
          </div>
        )}

        {ticketTypes.map((ticket, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-3 items-end bg-background border-2 border-border p-4 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]"
          >
            <div className="flex flex-col gap-1 flex-1 w-full">
              <label className="text-[10px] font-black uppercase tracking-wide text-text-soft">Nombre del tipo</label>
              <input
                type="text"
                placeholder="Ej: VIP, General, Platea..."
                value={ticket.name}
                onChange={(e) =>
                  handleLocalidadChange(index, "name", e.target.value)
                }
                className="w-full p-2 border-2 border-border text-xs"
              />
            </div>
            <div className="flex flex-col gap-1 w-full md:w-28">
              <label className="text-[10px] font-black uppercase tracking-wide text-text-soft">Precio por entrada ($)</label>
              <input
                type="number"
                placeholder="Ej: 5000"
                value={ticket.price}
                onChange={(e) =>
                  handleLocalidadChange(index, "price", e.target.value)
                }
                className="w-full p-2 border-2 border-border text-xs"
              />
            </div>
            <div className="flex flex-col gap-1 w-full md:w-28">
              <label className="text-[10px] font-black uppercase tracking-wide text-text-soft">Cantidad de asientos</label>
              <input
                type="number"
                placeholder="Ej: 200"
                value={ticket.stock}
                onChange={(e) =>
                  handleLocalidadChange(index, "stock", e.target.value)
                }
                className="w-full p-2 border-2 border-border text-xs"
              />
            </div>
            <div className="flex flex-col gap-1 w-full md:w-40">
              <label className="text-[10px] font-black uppercase tracking-wide text-text-soft">Zona / Sector</label>
              <input
                type="text"
                placeholder="Ej: Platea Baja, Tribuna..."
                value={ticket.zone}
                onChange={(e) =>
                  handleLocalidadChange(index, "zone", e.target.value)
                }
                className="w-full p-2 border-2 border-border text-xs"
              />
            </div>
            {ticketTypes.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarLocalidad(index)}
                className="bg-red-600 text-white p-2 text-xs uppercase font-black w-full md:w-auto"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>

      {status?.type === "error" && (
        <div className="border-2 border-red-500 bg-red-500/10 p-4 font-mono text-xs font-bold uppercase text-red-500">
          ❌ {status.msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full p-4 font-black text-sm uppercase bg-primary text-background border-4 border-border shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] disabled:opacity-50"
      >
        {loading
          ? "Creando en Sistema..."
          : eventStatus === "ACTIVE"
          ? "Crear Evento — Al Aire 📡"
          : "Crear Evento — Guardar Borrador 📝"}
      </button>
    </form>
  );
}