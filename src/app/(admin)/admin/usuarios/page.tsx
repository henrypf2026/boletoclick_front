"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

export default function AdminUsuarios() {
  const router = useRouter();
  const { usuarios, setUsuarios, alternarEstadoUsuario } = useAdmin();

  const [filtroEmail, setFiltroEmail] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("TODOS");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const triggerNotificacion = (mensaje: string) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 3500);
  };

  const handleCrearAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEmail.includes("@")) return;

    if (
      usuarios.some((u) => u.email.toLowerCase() === nuevoEmail.toLowerCase())
    ) {
      triggerNotificacion(
        `FALLO: EL EMAIL [${nuevoEmail.toUpperCase()}] YA EXISTE EN EL SISTEMA`,
      );
      return;
    }

    const nuevo = {
      id: Date.now(),
      email: nuevoEmail.toLowerCase().trim(),
      rol: "ADMIN" as const,
      estado: "ACTIVO" as const,
      fechaRegistro: "2026-06-16",
    };

    setUsuarios([...usuarios, nuevo]);
    setNuevoEmail("");
    triggerNotificacion(
      `ÉXITO: NUEVO ADMINISTRADOR "${nuevo.email.toUpperCase()}" CONFIGURADO`,
    );
  };

  const metrics = useMemo(() => {
    return {
      users: usuarios.filter((u) => u.rol === "USER").length,
      producers: usuarios.filter((u) => u.rol === "PRODUCER").length,
      admins: usuarios.filter((u) => u.rol === "ADMIN").length,
      suspendidos: usuarios.filter((u) => u.estado === "SUSPENDIDO").length,
    };
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchEmail = u.email
        .toLowerCase()
        .includes(filtroEmail.toLowerCase());
      if (categoriaActiva === "TODOS") return matchEmail;
      if (categoriaActiva === "SUSPENDIDOS")
        return matchEmail && u.estado === "SUSPENDIDO";
      return matchEmail && u.rol === categoriaActiva;
    });
  }, [usuarios, filtroEmail, categoriaActiva]);

  return (
    <div className="min-h-screen bg-background text-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 bg-text text-surface border-4 border-secondary px-4 py-3 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up">
          ⚡ {notificacion}
        </div>
      )}

      <div className="border-b-4 border-text pb-4">
        <button
          onClick={() => router.push("/dashboard-admin")}
          className="text-xs font-bold uppercase underline mb-2 block hover:text-primary active:scale-95 transition-transform origin-left cursor-pointer"
        >
          ← Volver al Dashboard Principal
        </button>
        <h1 className="uppercase font-black text-3xl tracking-tighter">
          Control Central de Cuentas
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border-2 border-text p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-b-4 transition-all hover:-translate-y-0.5">
          <p className="text-[10px] uppercase text-text-soft font-black">
            Clientes Registrados
          </p>
          <p className="text-2xl font-black">
            {metrics.users}{" "}
            <span className="text-xs font-normal text-text-soft">USER</span>
          </p>
        </div>
        <div className="bg-surface border-2 border-text p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-b-4 border-b-primary transition-all hover:-translate-y-0.5">
          <p className="text-[10px] uppercase text-text-soft font-black">
            Empresas / Productores
          </p>
          <p className="text-2xl font-black text-primary">
            {metrics.producers}{" "}
            <span className="text-xs font-normal text-text-soft">PROD</span>
          </p>
        </div>
        <div className="bg-surface border-2 border-text p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-b-4 border-b-secondary transition-all hover:-translate-y-0.5">
          <p className="text-[10px] uppercase text-text-soft font-black">
            Equipo Interno (Staff)
          </p>
          <p className="text-2xl font-black text-secondary">
            {metrics.admins}{" "}
            <span className="text-xs font-normal text-text-soft">ROOT</span>
          </p>
        </div>
        <div className="bg-surface border-2 border-text p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-b-4 border-b-red-500 transition-all hover:-translate-y-0.5">
          <p className="text-[10px] uppercase text-text-soft font-black">
            Cuentas Penalizadas
          </p>
          <p className="text-2xl font-black text-red-500">
            {metrics.suspendidos}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface border-2 border-text p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="🔎 ESCRIBÍ UN EMAIL PARA FILTRAR EN LA BASE DE DATOS..."
                value={filtroEmail}
                onChange={(e) => setFiltroEmail(e.target.value)}
                className="w-full bg-background border-2 border-text p-2.5 pr-10 font-bold uppercase focus:outline-none text-xs"
              />
              {filtroEmail && (
                <button
                  onClick={() => setFiltroEmail("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-text-soft hover:text-red-500 transition-colors uppercase cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 text-[10px] font-black uppercase">
              {["TODOS", "USER", "PRODUCER", "ADMIN", "SUSPENDIDOS"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    className={`px-3 py-1 border-2 border-text cursor-pointer transition-all active:scale-95 ${
                      categoriaActiva === cat
                        ? "bg-text text-surface"
                        : "bg-background hover:bg-text/5"
                    }`}
                  >
                    • {cat}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="bg-surface border-2 border-text shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-150 text-xs">
              <thead>
                <tr className="bg-text text-surface font-black uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Dirección de Email</th>
                  <th className="p-3.5">Fecha Alta</th>
                  <th className="p-3.5">Jerarquía</th>
                  <th className="p-3.5">Estado Cuenta</th>
                  <th className="p-3.5 text-right">Modificar Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text/10 font-bold bg-background">
                {usuariosFiltrados.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors duration-150 hover:bg-text/5 ${
                      u.estado === "SUSPENDIDO"
                        ? "bg-red-500/2 text-text-soft/70"
                        : ""
                    }`}
                  >
                    <td
                      className={`p-3.5 font-black ${u.estado === "SUSPENDIDO" ? "line-through text-text-soft" : "text-text"}`}
                    >
                      {u.estado === "SUSPENDIDO" ? "🚫 " : ""}
                      {u.email}
                    </td>
                    <td className="p-3.5 text-text-soft font-medium">
                      {u.fechaRegistro}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 border text-[9px] font-black ${
                          u.rol === "ADMIN"
                            ? "bg-secondary/10 text-secondary border-secondary/30"
                            : u.rol === "PRODUCER"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-text/5 border-text/20"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-black border uppercase transition-all ${
                          u.estado === "ACTIVO"
                            ? "bg-green-500/20 text-green-600 border-green-600/40"
                            : "bg-red-500 text-white border-black"
                        }`}
                      >
                        {u.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          alternarEstadoUsuario(u.id);
                          triggerNotificacion(
                            `ESTADO ACTUALIZADO PARA: ${u.email.toUpperCase()}`,
                          );
                        }}
                        className={`border-2 border-text px-2.5 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all cursor-pointer ${
                          u.estado === "ACTIVO"
                            ? "bg-background text-red-500 hover:bg-red-600 hover:text-white"
                            : "bg-secondary text-text hover:bg-text hover:text-surface"
                        }`}
                      >
                        {u.estado === "ACTIVO" ? "✕ Suspender" : "🔓 Reactivar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface border-2 border-text p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 lg:sticky lg:top-4">
          <h3 className="font-black text-xs uppercase border-b-2 pb-2 flex items-center gap-1">
            Alta Staff
          </h3>
          <form onSubmit={handleCrearAdmin} className="space-y-3">
            <div>
              <label className="block text-[9px] font-black text-text-soft mb-1 uppercase">
                Email Autorizado
              </label>
              <input
                type="email"
                required
                placeholder="OPERADOR@BOLETOCLICK.COM"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
                className="w-full bg-background border-2 border-text p-2 text-xs uppercase focus:outline-none font-black"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-secondary text-text border-2 border-text font-black py-2 text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-text hover:text-surface active:scale-[0.98] transition-all cursor-pointer"
            >
              Otorgar Permisos
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
