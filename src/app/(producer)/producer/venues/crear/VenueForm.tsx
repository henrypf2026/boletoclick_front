"use client";

import React, { useEffect, useState } from "react";

interface Province {
  id: string;
  name: string;
}

interface Municipality {
  id: string;
  name: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function VenueForm() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null);

  const [venue, setVenue] = useState({
    name: "",
    address: "",
    provinceId: "",
    municipalityId: "",
    capacity: "",
    latitude: "",
    longitude: "",
    imgUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/backend/province")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : (data.allProvincesFormatted ?? data.allProvinces ?? []);
        setProvinces(list);
      })
      .catch(() => setProvinces([]));
  }, []);

  async function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const provinceId = e.target.value;
    setVenue((prev) => ({ ...prev, provinceId, municipalityId: "" }));
    setMunicipalities([]);
    if (!provinceId) return;

    setLoadingMunicipalities(true);
    try {
      const res = await fetch(`/api/backend/province/${provinceId}`);
      const data = await res.json();
      const found = data.province ?? data.provinceSearched ?? data;
      setMunicipalities(Array.isArray(found.municipality) ? found.municipality : []);
    } catch {
      setMunicipalities([]);
    } finally {
      setLoadingMunicipalities(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setVenue((prev) => ({ ...prev, [name]: value }));
    if (name === "address") setGeocodedAddress(null);
  }

  async function geocodeAddress() {
    const query = venue.address.trim();
    if (!query) return;

    setGeocoding(true);
    setGeocodedAddress(null);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=es`;
      const res = await fetch(url);
      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature) {
        setGeocodedAddress("No se encontró la dirección. Revisá el texto e intentá de nuevo.");
        return;
      }
      const [lng, lat] = feature.center as [number, number];
      setVenue((prev) => ({
        ...prev,
        latitude: String(lat),
        longitude: String(lng),
      }));
      setGeocodedAddress(`📍 ${feature.place_name}`);
    } catch {
      setGeocodedAddress("Error al buscar la ubicación. Verificá tu conexión.");
    } finally {
      setGeocoding(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const lat = parseFloat(venue.latitude);
    const lng = parseFloat(venue.longitude);
    const cap = parseInt(venue.capacity, 10);

    if (isNaN(lat) || isNaN(lng)) {
      setStatus({ type: "error", msg: "Primero buscá la ubicación con el botón de geocodificación." });
      setLoading(false);
      return;
    }
    if (isNaN(cap) || cap <= 0) {
      setStatus({ type: "error", msg: "La capacidad debe ser un número mayor a 0." });
      setLoading(false);
      return;
    }

    try {
      const body: Record<string, unknown> = {
        name: venue.name.trim(),
        address: venue.address.trim(),
        municipalityId: venue.municipalityId,
        capacity: cap,
        latitude: lat,
        longitude: lng,
      };
      if (venue.imgUrl.trim()) body.imgUrl = venue.imgUrl.trim();

      const res = await fetch("/api/backend/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(" | ")
            : data.message ?? "Error al crear el venue.",
        );
      }

      setStatus({ type: "success", msg: "¡Venue creado con éxito! Ya podés seleccionarlo al crear un evento." });
      setVenue({ name: "", address: "", provinceId: "", municipalityId: "", capacity: "", latitude: "", longitude: "", imgUrl: "" });
      setMunicipalities([]);
      setGeocodedAddress(null);
    } catch (err: unknown) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "Error de conexión con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full p-3 border-2 border-border bg-background text-text font-medium shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] text-sm focus:outline-none focus:border-primary";
  const selectClass =
    "w-full p-3 border-2 border-border bg-background text-text font-bold text-sm shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] focus:outline-none focus:border-primary";
  const labelClass = "text-xs font-black uppercase tracking-wide text-text block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 1. Datos del lugar */}
      <div className="bg-surface border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
        <h2 className="text-lg font-black uppercase tracking-wider text-text border-b-2 border-border pb-2">
          1. Datos del lugar
        </h2>

        <div>
          <label className={labelClass}>Nombre del lugar</label>
          <input
            name="name"
            value={venue.name}
            onChange={handleChange}
            required
            placeholder="Ej: Arena VFG"
            className={inputClass}
          />
        </div>

        {/* Dirección + botón geocodificar */}
        <div>
          <label className={labelClass}>Dirección completa</label>
          <div className="flex gap-2">
            <input
              name="address"
              value={venue.address}
              onChange={handleChange}
              required
              placeholder="Ej: Siete Colinas 1772, Colonia Independencia, Guadalajara, Jalisco"
              className={inputClass}
            />
            <button
              type="button"
              onClick={geocodeAddress}
              disabled={geocoding || !venue.address.trim()}
              className="shrink-0 px-4 border-2 border-border bg-secondary text-text text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {geocoding ? "..." : "Buscar"}
            </button>
          </div>

          {geocodedAddress && (
            <p className={`mt-2 text-xs font-medium px-3 py-2 border-2 ${
              geocodedAddress.startsWith("📍")
                ? "border-success bg-success/10 text-success"
                : "border-red-400 bg-red-50 text-red-600"
            }`}>
              {geocodedAddress}
            </p>
          )}
        </div>

        {/* Provincia / Municipio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Estado / Provincia</label>
            <select
              name="provinceId"
              value={venue.provinceId}
              onChange={handleProvinceChange}
              required
              className={selectClass}
            >
              <option value="">-- Seleccioná estado --</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Municipio / Ciudad</label>
            <select
              name="municipalityId"
              value={venue.municipalityId}
              onChange={handleChange}
              required
              disabled={!venue.provinceId || loadingMunicipalities}
              className={selectClass}
            >
              <option value="">
                {loadingMunicipalities
                  ? "Cargando..."
                  : !venue.provinceId
                  ? "Primero seleccioná un estado"
                  : "-- Seleccioná municipio --"}
              </option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Capacidad máxima (personas)</label>
          <input
            name="capacity"
            type="number"
            min="1"
            value={venue.capacity}
            onChange={handleChange}
            required
            placeholder="Ej: 5000"
            className={inputClass}
          />
        </div>
      </div>

      {/* 2. Coordenadas (readonly después de geocodificar, editables si hace falta) */}
      <div className="bg-surface border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-text border-b-2 border-border pb-2">
            2. Coordenadas
          </h2>
          <p className="text-xs text-text-soft mt-2">
            Se completan automáticamente al buscar la dirección. Podés editarlas si necesitás ajustar la ubicación.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Latitud</label>
            <input
              name="latitude"
              type="number"
              step="any"
              value={venue.latitude}
              onChange={handleChange}
              required
              placeholder="Se completa al buscar la dirección"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Longitud</label>
            <input
              name="longitude"
              type="number"
              step="any"
              value={venue.longitude}
              onChange={handleChange}
              required
              placeholder="Se completa al buscar la dirección"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 3. Imagen (opcional) */}
      <div className="bg-surface border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
        <h2 className="text-lg font-black uppercase tracking-wider text-text border-b-2 border-border pb-2">
          3. Imagen{" "}
          <span className="text-text-soft font-medium normal-case tracking-normal text-sm">
            (opcional)
          </span>
        </h2>
        <div>
          <label className={labelClass}>URL de la imagen del lugar</label>
          <input
            name="imgUrl"
            type="url"
            value={venue.imgUrl}
            onChange={handleChange}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      {status?.type === "success" && (
        <div className="border-2 border-success bg-success/10 p-4 font-mono text-xs font-bold uppercase text-success">
          ✅ {status.msg}
        </div>
      )}
      {status?.type === "error" && (
        <div className="border-2 border-red-500 bg-red-500/10 p-4 font-mono text-xs font-bold uppercase text-red-500">
          ❌ {status.msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full p-4 font-black text-sm uppercase bg-primary text-background border-4 border-border shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] disabled:opacity-50 transition-all hover:-translate-y-0.5"
      >
        {loading ? "Creando venue..." : "Crear Venue"}
      </button>
    </form>
  );
}
