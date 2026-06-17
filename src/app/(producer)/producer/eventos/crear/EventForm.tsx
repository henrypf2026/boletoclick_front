"use client";

import React, { useState, useEffect } from "react";

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

export default function EventForm() {
  const [evento, setEvento] = useState({
    title: "",
    description: "",
    fecha: "",
    hora: "",
    venueId: "",
    categoryId: "",
  });

  const [categorias, setCategorias] = useState<ApiItem[]>([]);
  const [locaciones, setLocaciones] = useState<ApiItem[]>([]);
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
          setCategorias(dataCat);
        }
        if (resVen && resVen.ok) {
          const dataVen = await resVen.json();
          setLocaciones(dataVen);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoImagen(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
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
    value: string | number,
  ) => {
    const nuevosTickets = [...ticketTypes];
    nuevosTickets[index] = {
      ...nuevosTickets[index],
      [field]: field === "name" || field === "zone" ? value : Number(value),
    };
    setTicketTypes(nuevosTickets);
  };

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

    const rawToken = localStorage.getItem("auth_token");
    if (!rawToken) {
      setStatus({
        type: "error",
        msg: "No se encontró un token de sesión. Por favor, volvé a iniciar sesión.",
      });
      setLoading(false);
      return;
    }

    const cleanToken = rawToken.replace(/['"]+/g, "");

    try {
      // 1. Instanciamos el FormData exigido por el controlador con Multer
      const formData = new FormData();

      formData.append("title", evento.title.trim());
      formData.append("description", evento.description.trim());
      formData.append("venueId", evento.venueId);
      formData.append("categoryId", evento.categoryId);

      const combinedDate = new Date(
        `${evento.fecha}T${evento.hora}:00.000Z`,
      ).toISOString();
      formData.append("eventDate", combinedDate);

      // 2. Mapeamos los campos numéricos puros de los tickets
      const ticketsLimpios = ticketTypes.map((ticket) => ({
        name: ticket.name.trim(),
        price: Number(ticket.price),
        stock: Math.floor(Number(ticket.stock)),
        zone: ticket.zone.trim(),
      }));

      // 3. Serializamos como string para activar el nuevo plainToInstance del back
      formData.append("ticketTypes", JSON.stringify(ticketsLimpios));

      // 4. Adjuntamos el binario de la imagen que capturará el @UploadedFile()
      formData.append("poster", archivoImagen);

      console.log("🚀 Enviando FormData adaptado al nuevo fix del backend...");

      const res = await fetch(`/api/backend/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          // NO agregar Content-Type, dejamos que el navegador maneje los boundaries
        },
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

      setStatus({
        type: "success",
        msg: "¡Evento creado con éxito e impactado en la base de datos!",
      });
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-background border-2 border-dashed border-border p-4 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase tracking-wide text-text block">
              Poster / Portada del Evento
            </label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            name="fecha"
            value={evento.fecha}
            onChange={handleEventoChange}
            required
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
                className="bg-accent text-white p-2 text-xs uppercase font-black w-full md:w-auto"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-4 font-black text-sm uppercase bg-primary text-background border-4 border-border shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] disabled:opacity-50"
      >
        {loading ? "Creando en Sistema..." : "Crear Evento"}
      </button>
    </form>
  );
}
