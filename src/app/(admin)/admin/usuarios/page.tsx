"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

type PestanaInterna = "LISTADO" | "ALTA_STAFF";
type ModoSuspension = "PERMANENTE" | "TEMPORAL";
type UnidadTiempo = "HORAS" | "DIAS";

const MOTIVOS_RAPIDOS = [
  "SPAM / CONTENIDO INAPROPIADO",
  "INCUMPLIMIENTO DE TÉRMINOS Y CONDICIONES",
  "COMPORTAMIENTO ABUSIVO / REPORTE DE USUARIOS",
];

interface UsuarioBase {
  id: number;
  email: string;
  rol: "USER" | "PRODUCER" | "ADMIN";
  estado: "ACTIVO" | "SUSPENDIDO";
  fechaRegistro: string;
  motivoSuspension?: string;
  tipoSuspension?: "PERMANENTE" | "TEMPORAL";
  suspendidoHasta?: string;
}

export default function AdminUsuarios() {
  const router = useRouter();
  const { usuarios, setUsuarios } = useAdmin();

  const [pestanaActiva, setPestanaActiva] = useState<PestanaInterna>("LISTADO");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("TODOS");

  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);

  const [usuarioInspeccionado, setUsuarioInspeccionado] =
    useState<UsuarioBase | null>(null);

  const [modalSuspension, setModalSuspension] = useState<{
    isOpen: boolean;
    usuarioId: number | null;
    email: string;
    motivo: string;
    modo: ModoSuspension;
    cantidadTiempo: number;
    unidadTiempo: UnidadTiempo;
  }>({
    isOpen: false,
    usuarioId: null,
    email: "",
    motivo: "",
    modo: "TEMPORAL",
    cantidadTiempo: 24,
    unidadTiempo: "HORAS",
  });

  const [notificacion, setNotificacion] = useState<string | null>(null);

  const triggerNotificacion = (mensaje: string) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 3500);
  };

  useEffect(() => {
    const ahora = new Date();
    let huboCambios = false;

    const listaActualizada = usuarios.map((u) => {
      if (u.estado === "SUSPENDIDO" && u.suspendidoHasta) {
        const limite = new Date(u.suspendidoHasta);
        if (ahora > limite) {
          huboCambios = true;
          return {
            ...u,
            estado: "ACTIVO" as const,
            motivoSuspension: undefined,
            tipoSuspension: undefined,
            suspendidoHasta: undefined,
          };
        }
      }
      return u;
    });

    if (huboCambios) {
      setUsuarios(listaActualizada);
      triggerNotificacion(
        "SISTEMA: CUENTAS TEMPORALES REACTIVADAS AUTOMÁTICAMENTE",
      );
      if (
        usuarioInspeccionado &&
        usuarioInspeccionado.estado === "SUSPENDIDO"
      ) {
        const fresco = listaActualizada.find(
          (u) => u.id === usuarioInspeccionado.id,
        );
        if (fresco) setUsuarioInspeccionado(fresco as UsuarioBase);
      }
    }
  }, [usuarios, setUsuarios, usuarioInspeccionado]);

  const obtenerTiempoRestante = (isoString?: string) => {
    if (!isoString) return "PERMANENTE";
    const difMs = new Date(isoString).getTime() - new Date().getTime();
    if (difMs <= 0) return "EXPIRADO";

    const totalHoras = Math.floor(difMs / (1000 * 60 * 60));
    if (totalHoras >= 24) {
      const dias = Math.floor(totalHoras / 24);
      return `QUEDAN ${dias} DÍA${dias > 1 ? "S" : ""}`;
    }
    return `QUEDAN ${totalHoras} HORA${totalHoras !== 1 ? "S" : ""}`;
  };

  const handleCrearAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEmail.includes("@") || nuevaPassword.trim().length < 4) return;

    if (
      usuarios.some((u) => u.email.toLowerCase() === nuevoEmail.toLowerCase())
    ) {
      triggerNotificacion(
        `FALLO: EL EMAIL [${nuevoEmail.toUpperCase()}] YA EXISTE`,
      );
      return;
    }

    const nuevo = {
      id: Date.now(),
      email: nuevoEmail.toLowerCase().trim(),
      rol: "ADMIN" as const,
      estado: "ACTIVO" as const,
      fechaRegistro: new Date().toISOString().split("T")[0],
    };

    setUsuarios([...usuarios, nuevo]);
    triggerNotificacion(`ÉXITO: STAFF "${nuevo.email.toUpperCase()}" CREADO`);
    setNuevoEmail("");
    setNuevaPassword("");
    setVerPassword(false);
    setPestanaActiva("LISTADO");
  };

  const abrirModalSuspension = (
    e: React.MouseEvent,
    id: number,
    email: string,
  ) => {
    e.stopPropagation();
    setModalSuspension({
      isOpen: true,
      usuarioId: id,
      email,
      motivo: "",
      modo: "TEMPORAL",
      cantidadTiempo: 24,
      unidadTiempo: "HORAS",
    });
  };

  const confirmarSuspension = () => {
    if (!modalSuspension.usuarioId || !modalSuspension.motivo.trim()) return;

    let fechaHasta: string | undefined = undefined;

    if (modalSuspension.modo === "TEMPORAL") {
      const calculoFecha = new Date();
      if (modalSuspension.unidadTiempo === "HORAS") {
        calculoFecha.setHours(
          calculoFecha.getHours() + modalSuspension.cantidadTiempo,
        );
      } else {
        calculoFecha.setDate(
          calculoFecha.getDate() + modalSuspension.cantidadTiempo,
        );
      }
      fechaHasta = calculoFecha.toISOString();
    }

    const nuevosUsuarios = usuarios.map((u) =>
      u.id === modalSuspension.usuarioId
        ? {
            ...u,
            estado: "SUSPENDIDO" as const,
            motivoSuspension: modalSuspension.motivo.trim().toUpperCase(),
            tipoSuspension: modalSuspension.modo,
            suspendidoHasta: fechaHasta,
          }
        : u,
    );

    setUsuarios(nuevosUsuarios);

    if (
      usuarioInspeccionado &&
      usuarioInspeccionado.id === modalSuspension.usuarioId
    ) {
      const target = nuevosUsuarios.find(
        (u) => u.id === modalSuspension.usuarioId,
      );
      if (target) setUsuarioInspeccionado(target as UsuarioBase);
    }

    const txtNotif =
      modalSuspension.modo === "TEMPORAL"
        ? `${modalSuspension.cantidadTiempo} ${modalSuspension.unidadTiempo}`
        : "PERMANENTE";

    triggerNotificacion(
      `SUSPENSIÓN APLICADA: ${txtNotif} A ${modalSuspension.email.toUpperCase()}`,
    );
    setModalSuspension({ ...modalSuspension, isOpen: false });
  };

  const reactivarCuentaManual = (
    e: React.MouseEvent,
    id: number,
    email: string,
  ) => {
    e.stopPropagation();
    const nuevosUsuarios = usuarios.map((u) =>
      u.id === id
        ? {
            ...u,
            estado: "ACTIVO" as const,
            motivoSuspension: undefined,
            tipoSuspension: undefined,
            suspendidoHasta: undefined,
          }
        : u,
    );

    setUsuarios(nuevosUsuarios);

    if (usuarioInspeccionado && usuarioInspeccionado.id === id) {
      const target = nuevosUsuarios.find((u) => u.id === id);
      if (target) setUsuarioInspeccionado(target as UsuarioBase);
    }

    triggerNotificacion(`ACCESO RESTAURADO: ${email.toUpperCase()}`);
  };

  const metrics = useMemo(() => {
    return {
      todos: usuarios.length,
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
    <div className="min-h-screen bg-background text-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative overflow-x-hidden">
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 bg-text text-surface border-4 border-text px-4 py-3 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚡ {notificacion}
        </div>
      )}

      <div className="border-b-4 border-text pb-4">
        <button
          onClick={() => router.push("/dashboard-admin")}
          className="text-xs font-bold uppercase underline mb-2 block hover:text-text-soft cursor-pointer"
        >
          ← Volver al Dashboard Principal
        </button>
        <h1 className="uppercase font-black text-3xl tracking-tighter">
          Control Central de Cuentas
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { id: "TODOS", label: "Todas las Cuentas", count: metrics.todos },
          { id: "USER", label: "Clientes", count: metrics.users, sub: "USER" },
          {
            id: "PRODUCER",
            label: "Empresas / Prod",
            count: metrics.producers,
            sub: "PROD",
          },
          {
            id: "ADMIN",
            label: "Equipo Interno",
            count: metrics.admins,
            sub: "STAFF",
          },
        ].map((card) => {
          const isActive = categoriaActiva === card.id;
          return (
            <div
              key={card.id}
              onClick={() => {
                setCategoriaActiva(card.id);
                setPestanaActiva("LISTADO");
              }}
              className={`border-2 border-text p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:-translate-y-0.5 ${isActive ? "bg-text/10 border-text" : "bg-surface"}`}
            >
              <p className="text-[10px] uppercase font-black text-text-soft">
                {card.label}
              </p>
              <p className="text-2xl font-black">
                {card.count}{" "}
                {card.sub && (
                  <span className="text-xs font-normal opacity-60">
                    {" "}
                    {card.sub}
                  </span>
                )}
              </p>
            </div>
          );
        })}

        <div
          onClick={() => {
            setCategoriaActiva("SUSPENDIDOS");
            setPestanaActiva("LISTADO");
          }}
          className={`border-2 p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:-translate-y-0.5 col-span-2 lg:col-span-1 ${categoriaActiva === "SUSPENDIDOS" ? "bg-red-500/10 border-red-500" : "bg-surface border-red-500/30"}`}
        >
          <p className="text-[10px] uppercase font-black text-red-500">
            Penalizados
          </p>
          <p className="text-2xl font-black text-red-500">
            {metrics.suspendidos}
          </p>
        </div>
      </div>

      <div className="flex border-b-2 border-text gap-2 pt-2">
        <button
          onClick={() => setPestanaActiva("LISTADO")}
          className={`pb-2 px-4 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${pestanaActiva === "LISTADO" ? "border-b-4 border-text text-text" : "text-text-soft hover:text-text"}`}
        >
          📋 Registros ({usuariosFiltrados.length})
        </button>
        <button
          onClick={() => setPestanaActiva("ALTA_STAFF")}
          className={`pb-2 px-4 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${pestanaActiva === "ALTA_STAFF" ? "border-b-4 border-text text-text" : "text-text-soft hover:text-text"}`}
        >
          ⚡ Otorgar Alta Staff
        </button>
      </div>

      {pestanaActiva === "LISTADO" ? (
        <div className="space-y-4">
          <div className="bg-surface border-2 border-text p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <input
              type="text"
              placeholder="🔎 Filtrar base de datos por dirección de email..."
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
              className="w-full bg-background border-2 border-text p-2.5 font-bold uppercase focus:outline-none text-xs"
            />
          </div>

          <div className="bg-surface border-2 border-text shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-150 text-xs">
              <thead>
                <tr className="bg-text text-surface font-black uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Dirección de Email</th>
                  <th className="p-3.5">Fecha Alta</th>
                  <th className="p-3.5">Jerarquía</th>
                  <th className="p-3.5">Estado Cuenta</th>
                  <th className="p-3.5 text-right">Acciones de Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text/10 font-bold bg-background">
                {usuariosFiltrados.map((u) => {
                  const esAdmin = u.rol === "ADMIN";
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setUsuarioInspeccionado(u as UsuarioBase)}
                      className={`transition-all duration-150 hover:bg-text/5 cursor-pointer ${u.estado === "SUSPENDIDO" ? "bg-red-500/5 text-text-soft" : ""} ${usuarioInspeccionado?.id === u.id ? "bg-text/10" : ""}`}
                    >
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span
                            className={`font-black ${u.estado === "SUSPENDIDO" ? "text-text-soft/60" : "text-text"}`}
                          >
                            {u.estado === "SUSPENDIDO" ? "🚫 " : ""}
                            {u.email}
                          </span>
                          {u.estado === "SUSPENDIDO" && (
                            <span className="text-[9px] text-red-500 font-mono tracking-wide uppercase mt-0.5 truncate max-w-xs">
                              🔍 Ver historial y detalles visuales
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-text-soft font-medium">
                        {u.fechaRegistro}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 border text-[9px] font-black uppercase ${esAdmin ? "bg-text text-surface border-text" : "bg-surface border-text/40"}`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.estado === "ACTIVO" ? (
                          <span className="px-2 py-0.5 text-[9px] font-black border uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-black border uppercase bg-red-500 text-white border-red-600">
                            SUSPENDIDO
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {esAdmin ? (
                          <span className="text-[10px] text-text-soft uppercase italic font-bold">
                            🔒 Protegido
                          </span>
                        ) : u.estado === "ACTIVO" ? (
                          <button
                            onClick={(e) =>
                              abrirModalSuspension(e, u.id, u.email)
                            }
                            className="border-2 border-text px-2.5 py-1 text-[10px] font-black uppercase bg-surface text-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-text hover:text-surface transition-all cursor-pointer"
                          >
                            ✕ Penalizar
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) =>
                                reactivarCuentaManual(e, u.id, u.email)
                              }
                              className="border-2 border-text px-2.5 py-1 text-[10px] font-black uppercase bg-text text-surface shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-surface hover:text-text transition-all cursor-pointer"
                            >
                              Aprobar Acceso
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xl">
          <div className="mb-4 border-b border-text/10 pb-2">
            <span className="text-[10px] font-black bg-text text-surface px-2 py-0.5 uppercase">
              Formulario de Credenciales Internas
            </span>
            <p className="text-[9px] text-text-soft uppercase mt-1">
              * Nota: Todo usuario creado bajo este módulo recibirá privilegios
              globales de ADMINISTRADOR (`ADMIN`).
            </p>
          </div>

          <form
            onSubmit={handleCrearAdmin}
            className="space-y-4 font-mono text-xs"
          >
            <div>
              <label className="block text-[10px] font-black text-text-soft mb-1 uppercase">
                Email Institucional
              </label>
              <input
                type="email"
                required
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
                className="w-full bg-background border-2 border-text p-2.5 font-black uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-text-soft mb-1 uppercase">
                Contraseña Temporal
              </label>
              <div className="relative">
                <input
                  type={verPassword ? "text" : "password"}
                  required
                  minLength={4}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="w-full bg-background border-2 border-text p-2.5 font-black focus:outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-2 top-1.5 border border-text/40 bg-surface px-2 py-1 font-bold text-[10px] uppercase hover:bg-text hover:text-surface transition-all cursor-pointer"
                >
                  {verPassword ? "Ocultar" : "Ver 👀"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-text text-surface border-2 border-text font-black py-3 uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-surface hover:text-text transition-all cursor-pointer"
            >
              Confirmar Alta de Administrador
            </button>
          </form>
        </div>
      )}

      {usuarioInspeccionado && (
        <div className="fixed inset-0 z-50 bg-text/20 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div
            className="flex-1"
            onClick={() => setUsuarioInspeccionado(null)}
          />

          <div className="w-full max-w-md bg-surface border-l-4 border-text h-full p-6 shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between overflow-y-auto animate-slideLeft">
            <div className="space-y-5">
              <div className="border-b-2 border-text pb-4 relative pr-10">
                <div>
                  <span className="text-[10px] font-black bg-text text-surface px-2 py-0.5 uppercase inline-block">
                    Ficha de Auditoría
                  </span>
                  <h3 className="font-black text-sm uppercase mt-1.5 text-text break-all tracking-tight">
                    {usuarioInspeccionado.email}
                  </h3>
                </div>

                <button
                  onClick={() => setUsuarioInspeccionado(null)}
                  className="absolute right-0 top-0 border-2 border-text font-black text-xs w-7 h-7 flex items-center justify-center bg-background hover:bg-text hover:text-surface transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  title="Cerrar panel"
                >
                  ✕
                </button>
              </div>{" "}
              <div className="bg-background border-2 border-text p-4 space-y-3">
                <p className="text-[10px] font-black uppercase text-text-soft border-b border-text/10 pb-1">
                  Metadatos de Registro
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase">
                  <div>ID de Cuenta:</div>
                  <div className="text-right font-mono">
                    {usuarioInspeccionado.id}
                  </div>
                  <div>Jerarquía (Rol):</div>
                  <div className="text-right text-indigo-600 font-black">
                    {usuarioInspeccionado.rol}
                  </div>
                  <div>Fecha de Alta:</div>
                  <div className="text-right font-mono">
                    {usuarioInspeccionado.fechaRegistro}
                  </div>
                  <div>Condición Actual:</div>
                  <div className="text-right">
                    <span
                      className={`px-1.5 py-0.5 font-black text-[10px] ${usuarioInspeccionado.estado === "ACTIVO" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500 text-white"}`}
                    >
                      {usuarioInspeccionado.estado}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-background border-2 border-text p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-text/10 pb-1">
                  <p className="text-[10px] font-black uppercase text-text-soft">
                    Récord de Infracciones (Histórico Visual)
                  </p>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 uppercase border ${usuarioInspeccionado.estado === "SUSPENDIDO" ? "bg-amber-500 text-black border-black" : "bg-surface text-text-soft border-text/20"}`}
                  >
                    {usuarioInspeccionado.estado === "SUSPENDIDO"
                      ? "⚠️ REINCIDENTE"
                      : "SIN ALERTA"}
                  </span>
                </div>

                {usuarioInspeccionado.rol === "ADMIN" ? (
                  <p className="text-[10px] text-text-soft italic uppercase">
                    Exento de historial punitivo.
                  </p>
                ) : usuarioInspeccionado.estado === "SUSPENDIDO" ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    <div className="border border-red-500/30 p-2 text-[10px] bg-red-500/5 space-y-0.5">
                      <div className="flex justify-between font-black text-red-500">
                        <span>❌ INFRACCIÓN #2 (ACTUAL)</span>
                        <span className="font-mono">HOY</span>
                      </div>
                      <p className="font-bold text-text-soft">
                        MOTIVO: {usuarioInspeccionado.motivoSuspension}
                      </p>
                    </div>
                    <div className="border border-text/20 p-2 text-[10px] bg-surface/50 space-y-0.5 opacity-60">
                      <div className="flex justify-between font-bold text-text-soft">
                        <span>⚠️ INFRACCIÓN #1 (RESUELTA)</span>
                        <span className="font-mono">HACE 3 MESES</span>
                      </div>
                      <p className="font-medium text-text-soft">
                        MOTIVO: ADVERTENCIA GENERAL POR REPORTES MÚLTIPLES
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-[10px] text-emerald-600 font-black uppercase">
                      ✓ HISTORIAL LIMPIO / 0 REINCIDENCIAS
                    </p>
                    <p className="text-[9px] text-text-soft uppercase mt-0.5">
                      No se registran antecedentes previos en esta cuenta.
                    </p>
                  </div>
                )}
              </div>
              {usuarioInspeccionado.estado === "SUSPENDIDO" && (
                <div className="border-4 border-red-500 bg-red-500/5 p-4 space-y-4 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)]">
                  <div className="flex items-center gap-1.5 text-red-600">
                    <span className="text-lg">🚨</span>
                    <h4 className="font-black text-xs uppercase tracking-wide">
                      Restricción de Acceso en Curso
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs uppercase">
                    <div>
                      <span className="block text-[9px] font-black text-text-soft">
                        Modalidad:
                      </span>
                      <span className="font-black bg-text text-surface px-2 py-0.5 text-[10px] inline-block mt-0.5">
                        {usuarioInspeccionado.tipoSuspension}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[9px] font-black text-text-soft">
                        Tiempo Restante:
                      </span>
                      <span className="font-black text-red-500 block text-sm mt-0.5">
                        ⏱️{" "}
                        {obtenerTiempoRestante(
                          usuarioInspeccionado.suspendidoHasta,
                        )}
                      </span>
                      {usuarioInspeccionado.suspendidoHasta && (
                        <span className="text-[9px] font-mono text-text-soft block mt-0.5">
                          Remoción automática:{" "}
                          {new Date(
                            usuarioInspeccionado.suspendidoHasta,
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="bg-surface border border-red-500/30 p-2.5">
                      <span className="block text-[9px] font-black text-red-500 mb-1">
                        Causa de la sanción:
                      </span>
                      <p className="font-mono font-black text-text text-xs leading-relaxed tracking-wide bg-background p-2 border border-text/10 uppercase wrap-break-word">
                        {usuarioInspeccionado.motivoSuspension ||
                          "SIN MOTIVO ESPECIFICADO"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t-2 border-text mt-6 space-y-2">
              {usuarioInspeccionado.rol === "ADMIN" ? (
                <p className="text-[10px] text-text-soft uppercase text-center italic font-bold">
                  🔒 Las cuentas internas de Staff no admiten modificaciones de
                  acceso.
                </p>
              ) : usuarioInspeccionado.estado === "ACTIVO" ? (
                <button
                  onClick={(e) => {
                    setUsuarioInspeccionado(null);
                    abrirModalSuspension(
                      e,
                      usuarioInspeccionado.id,
                      usuarioInspeccionado.email,
                    );
                  }}
                  className="w-full border-2 border-text p-2.5 font-black uppercase bg-red-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  ✕ Aplicar Penalización Directa
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    reactivarCuentaManual(
                      e,
                      usuarioInspeccionado.id,
                      usuarioInspeccionado.email,
                    );
                  }}
                  className="w-full border-2 border-text p-2.5 font-black uppercase bg-text text-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-surface hover:text-text transition-all cursor-pointer"
                >
                  🔓 Levantar Suspensión Inmediatamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {modalSuspension.isOpen && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border-4 border-text p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-md w-full font-mono space-y-4">
            <div className="border-b-2 border-text pb-2">
              <h2 className="font-black text-sm uppercase text-red-500">
                ⚠️ Panel de Configuración de Penalización
              </h2>
              <p className="text-[10px] text-text-soft uppercase font-bold mt-1">
                Usuario: {modalSuspension.email}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-text mb-1.5">
                Tipo de Restricción
              </label>
              <div className="grid grid-cols-2 border-2 border-text font-bold text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setModalSuspension({ ...modalSuspension, modo: "TEMPORAL" })
                  }
                  className={`py-2 uppercase transition-all cursor-pointer ${modalSuspension.modo === "TEMPORAL" ? "bg-text text-surface" : "bg-surface text-text hover:bg-background"}`}
                >
                  ⏱️ Temporal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModalSuspension({
                      ...modalSuspension,
                      modo: "PERMANENTE",
                    })
                  }
                  className={`py-2 uppercase transition-all cursor-pointer ${modalSuspension.modo === "PERMANENTE" ? "bg-text text-surface" : "bg-surface text-text hover:bg-background"}`}
                >
                  🚫 Permanente
                </button>
              </div>
            </div>

            {modalSuspension.modo === "TEMPORAL" && (
              <div className="p-3 bg-background border-2 border-dashed border-text/40 space-y-2">
                <label className="block text-[10px] font-black uppercase text-text-soft">
                  Establecer Duración del Bloqueo
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={modalSuspension.cantidadTiempo}
                    onChange={(e) =>
                      setModalSuspension({
                        ...modalSuspension,
                        cantidadTiempo: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-20 bg-surface border-2 border-text p-1.5 font-black text-center text-xs focus:outline-none"
                  />
                  <select
                    value={modalSuspension.unidadTiempo}
                    onChange={(e) =>
                      setModalSuspension({
                        ...modalSuspension,
                        unidadTiempo: e.target.value as UnidadTiempo,
                      })
                    }
                    className="flex-1 bg-surface border-2 border-text p-1.5 font-black text-xs focus:outline-none uppercase cursor-pointer"
                  >
                    <option value="HORAS">Horas</option>
                    <option value="DIAS">Días</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-text mb-1">
                Motivo Imputado
              </label>
              <textarea
                required
                rows={3}
                placeholder="Indique la causa específica de la penalización..."
                value={modalSuspension.motivo}
                onChange={(e) =>
                  setModalSuspension({
                    ...modalSuspension,
                    motivo: e.target.value,
                  })
                }
                className="w-full bg-background border-2 border-text p-2 text-xs font-black uppercase focus:outline-none resize-none"
              />

              <div className="space-y-1">
                <p className="text-[9px] font-bold text-text-soft uppercase tracking-wide">
                  📋 Plantillas de motivos frecuentes:
                </p>
                <div className="flex flex-wrap gap-1">
                  {MOTIVOS_RAPIDOS.map((motivoPlantilla) => (
                    <button
                      key={motivoPlantilla}
                      type="button"
                      onClick={() =>
                        setModalSuspension({
                          ...modalSuspension,
                          motivo: motivoPlantilla,
                        })
                      }
                      className="text-[9px] font-black uppercase border border-text/40 bg-background hover:bg-text hover:text-surface px-1.5 py-1 text-left transition-all tracking-tight cursor-pointer"
                    >
                      + {motivoPlantilla.split(" / ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs font-black uppercase pt-2 border-t border-text/10">
              <button
                onClick={() =>
                  setModalSuspension({ ...modalSuspension, isOpen: false })
                }
                className="px-3 py-2 border-2 border-text bg-background hover:bg-text/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSuspension}
                disabled={!modalSuspension.motivo.trim()}
                className="px-4 py-2 bg-red-500 text-white border-2 border-text shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 cursor-pointer"
              >
                Bloquear Cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
