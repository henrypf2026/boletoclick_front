"use client";

import React, { useState } from "react";

interface Localidad {
  nombre: string;
  precio: number;
  capacidadMax: number;
}

export default function EventForm() {
  const [evento, setEvento] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    hora: "",
    lugar: "",
    categoria: "Recitales",
  });

  const [imagen, setImagen] = useState<string | null>(null);

  const [localidades, setLocalidades] = useState<Localidad[]>([
    { nombre: "General", precio: 0, capacidadMax: 100 },
  ]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarLocalidad = () => {
    setLocalidades([
      ...localidades,
      { nombre: "", precio: 0, capacidadMax: 50 },
    ]);
  };

  const eliminarLocalidad = (index: number) => {
    if (localidades.length === 1) return;
    setLocalidades(localidades.filter((_, i) => i !== index));
  };

  const handleLocalidadChange = (
    index: number,
    field: keyof Localidad,
    value: string | number,
  ) => {
    const nuevasLocalidades = [...localidades];
    nuevasLocalidades[index] = {
      ...nuevasLocalidades[index],
      [field]: field === "nombre" ? value : Number(value),
    };
    setLocalidades(nuevasLocalidades);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payloadFinal = {
      ...evento,
      fechaHora: `${evento.fecha}T${evento.hora}:00.000Z`,
      flyerUrl: imagen,
      sectores: localidades,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadFinal),
        },
      );

      if (!res.ok) throw new Error("Error al procesar la creación del evento.");

      setStatus({
        type: "success",
        msg: "¡Evento creado con éxito con su Flyer!",
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
              ? "bg-success text-white"
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
              Flyer / Portada del Evento
            </label>
            <p className="text-[11px] text-text-soft font-medium">
              Subí una imagen clara en formato JPG o PNG. Tamaño recomendado:
              1200x630px.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-text file:mr-4 file:py-2 file:px-4 file:border-2 file:border-border file:text-xs file:font-black file:uppercase file:bg-secondary file:text-text file:cursor-pointer hover:file:-translate-y-0.5 transition-transform"
            />
          </div>

          <div className="flex justify-center items-center">
            {imagen ? (
              <div className="border-4 border-border bg-surface p-1 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] max-h-35 overflow-hidden aspect-video flex justify-center items-center">
                <img
                  src={imagen}
                  alt="Preview del evento"
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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            Nombre del Evento
          </label>
          <input
            type="text"
            name="nombre"
            value={evento.nombre}
            onChange={handleEventoChange}
            required
            placeholder="Ej: Cosquín Rock 2026"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] placeholder:text-text-soft/50 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wide text-text">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={evento.fecha}
              onChange={handleEventoChange}
              required
              className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wide text-text">
              Hora de inicio
            </label>
            <input
              type="time"
              name="hora"
              value={evento.hora}
              onChange={handleEventoChange}
              required
              className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wide text-text">
              Categoría
            </label>
            <select
              name="categoria"
              value={evento.categoria}
              onChange={handleEventoChange}
              className="p-3 border-2 border-border bg-background text-text font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] text-sm appearance-none cursor-pointer"
            >
              <option value="Recitales">Recitales</option>
              <option value="Teatro">Teatro</option>
              <option value="Deportes">Deportes</option>
              <option value="Fiestas">Fiestas</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            Estadio / Lugar físico
          </label>
          <input
            type="text"
            name="lugar"
            value={evento.lugar}
            onChange={handleEventoChange}
            required
            placeholder="Ej: Estadio River Plate"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            Descripción del Evento
          </label>
          <textarea
            name="descripcion"
            rows={3}
            value={evento.descripcion}
            onChange={handleEventoChange}
            placeholder="Escribí los detalles de la grilla..."
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] text-sm resize-none"
          />
        </div>
      </div>

      <div className="bg-surface border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
        <div className="flex justify-between items-center border-b-2 border-border pb-2">
          <h2 className="text-lg font-black uppercase tracking-wider text-text">
            2. Sectores / Localidades
          </h2>
          <button
            type="button"
            onClick={agregarLocalidad}
            className="cursor-pointer bg-secondary text-text border-2 border-border px-3 py-1 text-xs font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            + Añadir Sector
          </button>
        </div>

        <div className="space-y-4">
          {localidades.map((localidad, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-3 items-end bg-background border-2 border-border p-4 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]"
            >
              <div className="flex-1 w-full flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-text-soft">
                  Nombre del Sector
                </label>
                <input
                  type="text"
                  value={localidad.nombre}
                  required
                  onChange={(e) =>
                    handleLocalidadChange(index, "nombre", e.target.value)
                  }
                  placeholder="Ej:Zona VIP,Boiler,etc..."
                  className="p-2 border-2 border-border bg-surface text-text font-medium text-xs"
                />
              </div>

              <div className="w-full md:w-36 flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-text-soft">
                  Precio ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={localidad.precio}
                  required
                  onChange={(e) =>
                    handleLocalidadChange(index, "precio", e.target.value)
                  }
                  className="p-2 border-2 border-border bg-surface text-text font-bold text-xs"
                />
              </div>

              <div className="w-full md:w-36 flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-text-soft">
                  Capacidad / Stock
                </label>
                <input
                  type="number"
                  min={1}
                  value={localidad.capacidadMax}
                  required
                  onChange={(e) =>
                    handleLocalidadChange(index, "capacidadMax", e.target.value)
                  }
                  className="p-2 border-2 border-border bg-surface text-text font-bold text-xs"
                />
              </div>

              {localidades.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarLocalidad(index)}
                  className="cursor-pointer bg-accent text-white border-2 border-border p-2 text-xs font-black shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] h-9.5 flex items-center justify-center w-full md:w-12 uppercase"
                >
                  Borrar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer p-4 font-black text-sm uppercase tracking-wider bg-primary text-background border-4 border-border shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
      >
        {loading ? "Creando Evento en Sistema..." : "Crear Evento"}
      </button>
    </form>
  );
}
