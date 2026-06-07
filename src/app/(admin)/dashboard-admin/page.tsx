"use client";

import React, { useState, useEffect } from "react";

interface Usuario {
  id: number;
  email: string;
  rol: "USER" | "PRODUCER" | "ADMIN";
  estado: "ACTIVO" | "SUSPENDIDO";
}

interface LogEvent {
  id: string;
  timestamp: string;
  type: "SUCCESS" | "INFO" | "WARN" | "CRITICAL";
  message: string;
}

export default function AdminDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<
    "finanzas" | "usuarios" | "moderacion"
  >("finanzas");
  const [comision, setComision] = useState(12);
  const [loading, setLoading] = useState(false);
  const [filtroEmail, setFiltroEmail] = useState("");

  const [notificacion, setNotificacion] = useState<string | null>(null);

  const gmvTotal = 2450000;
  const entradasVendidas = 1420;

  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, email: "cosme.fulanito@gmail.com", rol: "USER", estado: "ACTIVO" },
    {
      id: 2,
      email: "baba.management@empresa.com",
      rol: "PRODUCER",
      estado: "ACTIVO",
    },
    {
      id: 3,
      email: "lucas.dev@boletoclick.com",
      rol: "USER",
      estado: "ACTIVO",
    },
    {
      id: 4,
      email: "malicious.hacker@fail.com",
      rol: "USER",
      estado: "SUSPENDIDO",
    },
  ]);

  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"USER" | "PRODUCER" | "ADMIN">(
    "USER",
  );

  // Log de consola vivo (reactivo)
  const [logs, setLogs] = useState<LogEvent[]>([
    {
      id: "1",
      timestamp: "21:41:02",
      type: "SUCCESS",
      message: "Webhook procesado - Pago Recibido - FAC-9843 ($44.000)",
    },
    {
      id: "2",
      timestamp: "21:39:15",
      type: "INFO",
      message: "Generando Token de Acceso seguro para QR-DK-992",
    },
    {
      id: "3",
      timestamp: "21:22:50",
      type: "WARN",
      message: "Latencia elevada en pasarela MercadoPago (Gateway Id: 8821)",
    },
  ]);

  // Simulación de Consola Viva (agrega eventos cada 7 segundos)
  useEffect(() => {
    const eventosMock = [
      {
        type: "SUCCESS" as const,
        message: "Nueva compra aprobada FAC-1102 por 2 entradas ($30.000)",
      },
      {
        type: "INFO" as const,
        message: "Sincronizando base de datos local con storage de la academia",
      },
      {
        type: "WARN" as const,
        message: "Intento de login fallido desde IP remota en cuenta ID #2",
      },
      {
        type: "CRITICAL" as const,
        message:
          "Intento de alteración de precio detectado y bloqueado en checkout",
      },
    ];

    const interval = setInterval(() => {
      const azar = eventosMock[Math.floor(Math.random() * eventosMock.length)];
      const ahora = new Date();
      const timeStr = `${ahora.getHours().toString().padStart(2, "0")}:${ahora.getMinutes().toString().padStart(2, "0")}:${ahora.getSeconds().toString().padStart(2, "0")}`;

      setLogs((prev) => [
        {
          id: Date.now().toString(),
          timestamp: timeStr,
          type: azar.type,
          message: azar.message,
        },
        ...prev.slice(0, 8),
      ]);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [seccionActiva]);

  const triggerNotificacion = (mensaje: string) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 3500);
  };

  const cambiarRol = (
    id: number,
    email: string,
    rol: "USER" | "PRODUCER" | "ADMIN",
  ) => {
    setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, rol } : u)));
    triggerNotificacion(`SISTEMA: ROL DE [${email}] ACTUALIZADO A ${rol}`);
  };

  const alternarEstadoUsuario = (
    id: number,
    email: string,
    estadoActual: "ACTIVO" | "SUSPENDIDO",
  ) => {
    const nuevoEstado = estadoActual === "ACTIVO" ? "SUSPENDIDO" : "ACTIVO";
    setUsuarios(
      usuarios.map((u) => (u.id === id ? { ...u, estado: nuevoEstado } : u)),
    );
    triggerNotificacion(
      `SEGURIDAD: STATUS DE [${email}] CAMBIADO A ${nuevoEstado}`,
    );
  };

  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEmail.includes("@")) return;

    const nuevo: Usuario = {
      id: Date.now(),
      email: nuevoEmail.toLowerCase(),
      rol: nuevoRol,
      estado: "ACTIVO",
    };

    setUsuarios([...usuarios, nuevo]);
    setNuevoEmail("");
    triggerNotificacion(`ÉXITO: CUENTA INTERNA [${nuevo.email}] REGISTRADA`);
  };

  const actualizarFee = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotificacion(
      `CONFIGURACIÓN: FEE GLOBAL FIJADO EN ${comision}% NETO`,
    );
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(filtroEmail.toLowerCase()),
  );

  // Cálculos dinámicos basados en la comisión
  const netoTicketera = (gmvTotal * comision) / 100;
  const netoProductores = gmvTotal - netoTicketera;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-background text-text transition-colors relative">
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 w-11/12 max-w-md bg-text text-surface border-4 border-primary px-5 py-4 font-mono text-xs font-black uppercase tracking-wider shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all">
          <div className="flex items-center justify-between">
            <span className="leading-snug text-primary">⚡ {notificacion}</span>
            <button
              onClick={() => setNotificacion(null)}
              className="ml-4 font-black border-2 border-primary px-1.5 py-0.5 bg-background text-text text-[10px] hover:bg-surface cursor-pointer"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Consola de Control Global
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Auditoría de negocio, pasarela y control operacional de roles
          </p>
        </div>
        <div className="bg-red-500 text-white border-2 border-text px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
          SYSTEM_ACCESS: ROOT_ADMIN
        </div>
      </div>

      <div className="flex border-b-2 border-text mb-6 gap-2 overflow-x-auto pb-0">
        {(
          [
            { id: "finanzas", label: "📈 METRICAS DE NEGOCIO" },
            { id: "usuarios", label: "👥 PANEL DE USUARIOS" },
            { id: "moderacion", label: "🛡️ CONFIGURACIÓN DE FEES" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSeccionActiva(tab.id)}
            className={`pb-3 px-5 font-black text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer border-t-2 border-x-2 ${
              seccionActiva === tab.id
                ? "bg-text text-surface border-text translate-y-0.5"
                : "border-transparent text-text-soft hover:text-text bg-surface/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER PRINCIPAL */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 bg-surface border-2 border-text w-full"></div>
            <div className="h-28 bg-surface border-2 border-text w-full"></div>
            <div className="h-28 bg-surface border-2 border-text w-full"></div>
          </div>
          <div className="h-52 bg-surface border-2 border-text w-full"></div>
        </div>
      ) : (
        <>
          {seccionActiva === "finanzas" && (
            <div className="space-y-6">
              {/* PANORAMA DE MÉTRICAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_var(--color-text)]">
                  <p className="text-text-soft text-[10px] font-mono font-black uppercase tracking-wider">
                    Volumen Bruto Procesado (GMV)
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-text mt-2 font-mono">
                    ${gmvTotal.toLocaleString("es-AR")}
                  </p>
                  <span className="text-[9px] font-mono text-success bg-success/10 border border-success/30 px-2 py-0.5 mt-3 inline-block font-black">
                    ↑ +24.8% ESTE MES
                  </span>
                </div>

                <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_var(--color-text)] bg-linear-to-br from-surface to-primary/5">
                  <p className="text-text-soft text-[10px] font-mono font-black uppercase tracking-wider">
                    Neto Retenido Ticketera ({comision}%)
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-primary mt-2 font-mono">
                    ${netoTicketera.toLocaleString("es-AR")}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={comision}
                      onChange={(e) => setComision(Number(e.target.value))}
                      className="accent-primary cursor-pointer w-24 h-1.5 bg-background border border-text/20"
                    />
                    <span className="font-mono text-[10px] text-text-soft uppercase font-bold">
                      Ajuste: {comision}%
                    </span>
                  </div>
                </div>

                <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_var(--color-text)] sm:col-span-2 lg:col-span-1">
                  <p className="text-text-soft text-[10px] font-mono font-black uppercase tracking-wider">
                    Distribución a Productores
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-text mt-2 font-mono">
                    ${netoProductores.toLocaleString("es-AR")}
                  </p>
                  <p className="text-[10px] font-mono text-text-soft uppercase mt-3 font-bold">
                    Tickets validados:{" "}
                    <span className="text-text font-black">
                      {entradasVendidas} uds
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
                <div className="flex justify-between items-center border-b-2 border-text pb-2 mb-4">
                  <h3 className="font-black text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
                    ⚡ CONSOLA DE EVENTOS
                  </h3>
                  <span className="font-mono text-[10px] uppercase text-text-soft">
                    REFRESCO DINÁMICO ACTIVO
                  </span>
                </div>

                <div className="font-mono text-xs space-y-2.5 max-h-60 overflow-y-auto bg-background/50 p-4 border-2 border-text/20 rounded-none">
                  {logs.map((log) => (
                    <p
                      key={log.id}
                      className="text-text leading-relaxed uppercase break-all"
                    >
                      <span className="text-neutral-500 font-bold mr-2">
                        [{log.timestamp}]
                      </span>
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-black mr-2 border border-black ${
                          log.type === "SUCCESS"
                            ? "bg-success text-black"
                            : log.type === "WARN"
                              ? "bg-secondary text-black"
                              : log.type === "CRITICAL"
                                ? "bg-red-500 text-white"
                                : "bg-text text-surface"
                        }`}
                      >
                        {log.type}
                      </span>
                      {log.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "usuarios" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* TABLA DE USUARIOS */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_var(--color-text)]">
                  <input
                    type="text"
                    placeholder="🔎 FILTRAR CUENTAS POR CORREO ELECTRÓNICO..."
                    value={filtroEmail}
                    onChange={(e) => setFiltroEmail(e.target.value)}
                    className="w-full bg-background border-2 border-text p-2.5 font-mono text-xs font-bold uppercase focus:outline-none"
                  />
                </div>

                <div className="bg-surface border-2 border-text shadow-[4px_4px_0px_0px_var(--color-text)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-text text-surface border-b-2 border-text text-xs font-black uppercase font-mono">
                          <th className="p-4">Identificador / Email</th>
                          <th className="p-4">Rol</th>
                          <th className="p-4">Seguridad</th>
                          <th className="p-4 text-right">Modificación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-text text-xs bg-surface">
                        {usuariosFiltrados.length > 0 ? (
                          usuariosFiltrados.map((u) => (
                            <tr
                              key={u.id}
                              className={`hover:bg-text/5 transition-colors ${u.estado === "SUSPENDIDO" ? "bg-red-500/5" : ""}`}
                            >
                              <td className="p-4 font-black font-mono text-text">
                                <span className="text-text-soft text-[10px] mr-1.5 font-normal">
                                  #{u.id}
                                </span>
                                {u.email}
                              </td>
                              <td className="p-4">
                                <select
                                  value={u.rol ?? u.rol}
                                  onChange={(e) =>
                                    cambiarRol(
                                      u.id,
                                      u.email,
                                      e.target.value as any,
                                    )
                                  }
                                  className="bg-background border border-text p-1 font-mono font-black text-[11px] uppercase focus:outline-none"
                                >
                                  <option value="USER">USER</option>
                                  <option value="PRODUCER">PRODUCER</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 font-mono font-black border border-black ${
                                    u.estado === "ACTIVO"
                                      ? "bg-success/20 text-success"
                                      : "bg-red-500/20 text-red-500"
                                  }`}
                                >
                                  {u.estado}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() =>
                                    alternarEstadoUsuario(
                                      u.id,
                                      u.email,
                                      u.estado,
                                    )
                                  }
                                  className={`font-mono font-black px-3 py-1 border-2 border-text uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                                    u.estado === "ACTIVO"
                                      ? "bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
                                      : "bg-success text-black hover:bg-success/90"
                                  }`}
                                >
                                  {u.estado === "ACTIVO"
                                    ? "SUSPENDER"
                                    : "REACTIVAR"}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-8 text-center font-mono text-xs uppercase text-text-soft bg-surface"
                            >
                              Ninguna credencial coincide con la búsqueda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* COLUMNA ALTA USUARIO */}
              <div className="bg-surface border-2 border-text p-5 shadow-[4px_4px_0px_0px_var(--color-text)] space-y-4">
                <h3 className="font-black text-sm uppercase tracking-tight border-b-2 border-text pb-2 font-mono">
                  + Registrar Cuenta Interna
                </h3>
                <form onSubmit={handleCrearUsuario} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono">
                      Dirección de Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="OPERADOR@BOLETOCLICK.COM"
                      value={nuevoEmail}
                      onChange={(e) => setNuevoEmail(e.target.value)}
                      className="w-full bg-background border-2 border-text text-text p-2 font-mono text-xs focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono">
                      Nivel de Privilegios
                    </label>
                    <select
                      value={nuevoRol}
                      onChange={(e) => setNuevoRol(e.target.value as any)}
                      className="w-full bg-background border-2 border-text text-text p-2 font-mono text-xs font-bold uppercase focus:outline-none"
                    >
                      <option value="USER">USER (Cliente)</option>
                      <option value="PRODUCER">PRODUCER (Organizador)</option>
                      <option value="ADMIN">ADMIN (Soporte)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-secondary text-text border-2 border-text font-mono font-black py-2.5 text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Crear Usuario Base
                  </button>
                </form>
              </div>
            </div>
          )}

          {seccionActiva === "moderacion" && (
            <div className="bg-surface border-2 border-text p-6 rounded-none max-w-md shadow-[4px_4px_0px_0px_var(--color-text)] space-y-4">
              <h2 className="uppercase font-black text-xl border-b-2 border-text pb-2">
                Comisión de Plataforma
              </h2>
              <form onSubmit={actualizarFee} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                    Fee por servicio operativo global
                  </label>
                  <div className="flex items-center bg-background border-2 border-text px-4 py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-within:ring-1 focus-within:ring-primary">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={comision}
                      onChange={(e) => setComision(Number(e.target.value))}
                      className="bg-transparent font-black text-text font-mono text-2xl w-20 text-center focus:outline-none"
                    />
                    <span className="text-primary font-black font-mono text-xs ml-3 tracking-wider">
                      % NETO POR ENTRADA EMITIDA
                    </span>
                  </div>
                </div>
                <div className="bg-background border border-dashed border-text/40 p-3 font-mono text-[10px] text-text-soft uppercase leading-relaxed">
                  ⚠️ ADVERTENCIA: La alteración de esta variable reconfigura
                  dinámicamente los esquemas de retención bancaria simulados en
                  el panel financiero principal de forma inmediata.
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-primary text-background border-2 border-text font-mono font-black py-3 text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Confirmar Guardado de Red
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
