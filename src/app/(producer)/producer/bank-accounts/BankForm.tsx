"use client";

import React, { useState } from "react";

interface BankFormProps {
  initialData: {
    banco?: string;
    tipoCuenta?: string;
    cbu?: string;
    alias?: string;
    titular?: string;
    cuit?: string;
  } | null;
}

export default function BankForm({ initialData }: BankFormProps) {
  const [formData, setFormData] = useState({
    banco: initialData?.banco || "",
    tipoCuenta: initialData?.tipoCuenta || "Caja de Ahorros",
    cbu: initialData?.cbu || "",
    alias: initialData?.alias || "",
    titular: initialData?.titular || "",
    cuit: initialData?.cuit || "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const method = initialData ? "PUT" : "POST";
      const endpoint = `/api/backend/bank-accounts/me`;

      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al guardar los datos.");

      setStatus({
        type: "success",
        msg: "¡Datos bancarios guardados con éxito!",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        msg: error.message || "Hubo un problema con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-6"
    >
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

      {/* Fila 1: Banco y Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            Banco emisor
          </label>
          <input
            type="text"
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            required
            placeholder="Ej: Banco Galicia"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] placeholder:text-text-soft/50 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            Tipo de cuenta
          </label>
          <select
            name="tipoCuenta"
            value={formData.tipoCuenta}
            onChange={handleChange}
            className="p-3 border-2 border-border bg-background text-text font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] text-sm appearance-none cursor-pointer"
          >
            <option value="Caja de Ahorros">Caja de Ahorros</option>
            <option value="Cuenta Corriente">Cuenta Corriente</option>
          </select>
        </div>
      </div>

      {/* Fila 2: CBU y Alias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            CBU / CVU (22 dígitos)
          </label>
          <input
            type="text"
            name="cbu"
            maxLength={22}
            value={formData.cbu}
            onChange={handleChange}
            required
            placeholder="0000000000000000000000"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] placeholder:text-text-soft/50 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            Alias de cuenta
          </label>
          <input
            type="text"
            name="alias"
            value={formData.alias}
            onChange={handleChange}
            required
            placeholder="Ej: boleto.click.mp"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] placeholder:text-text-soft/50 text-sm"
          />
        </div>
      </div>

      {/* Fila 3: Titular y CUIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            Nombre completo del titular
          </label>
          <input
            type="text"
            name="titular"
            value={formData.titular}
            onChange={handleChange}
            required
            placeholder="Ej: Juan Pérez"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] placeholder:text-text-soft/50 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wide text-text">
            CUIT / CUIL (Sin guiones)
          </label>
          <input
            type="text"
            name="cuit"
            value={formData.cuit}
            onChange={handleChange}
            required
            placeholder="Ej: 20123456789"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] placeholder:text-text-soft/50 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer p-4 font-black text-sm uppercase tracking-wider bg-primary text-background border-4 border-border shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(23,23,23,1)] disabled:opacity-50 disabled:pointer-events-none transition-all"
      >
        {loading ? "Guardando datos..." : "Guardar datos bancarios"}
      </button>
    </form>
  );
}
