"use client";

import React, { useState } from "react";
import { getToken } from "@/lib/auth";
import {
  mapFormToApi,
  type BankFormData,
} from "./bankAccountMapper";

interface BankFormProps {
  initialData: BankFormData | null;
}

const EMPTY_FORM: BankFormData = {
  banco: "",
  tipoCuenta: "Caja de Ahorros",
  cbu: "",
  alias: "",
  titular: "",
  cuit: "",
};

function parseErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Error al guardar los datos.";
  }

  const message = (payload as { message?: string | string[] }).message;

  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(". ");

  return "Error al guardar los datos.";
}

export default function BankForm({ initialData }: BankFormProps) {
  const [formData, setFormData] = useState<BankFormData>(
    initialData ?? EMPTY_FORM,
  );

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

    const token = getToken();
    if (!token) {
      setStatus({
        type: "error",
        msg: "Tenés que iniciar sesión como productor para guardar los datos.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/backend/bank-accounts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mapFormToApi(formData)),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(parseErrorMessage(data));
      }

      setStatus({
        type: "success",
        msg: "¡Datos bancarios guardados con éxito!",
      });
    } catch (error) {
      setStatus({
        type: "error",
        msg:
          error instanceof Error
            ? error.message
            : "Hubo un problema con el servidor.",
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
            Alias de cuenta (opcional)
          </label>
          <input
            type="text"
            name="alias"
            value={formData.alias}
            onChange={handleChange}
            placeholder="Ej: boleto.click.mp"
            className="p-3 border-2 border-border bg-background text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] placeholder:text-text-soft/50 text-sm"
          />
        </div>
      </div>

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
