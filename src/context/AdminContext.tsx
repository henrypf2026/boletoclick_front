"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

export interface Usuario {
  id: number;
  email: string;
  rol: "USER" | "PRODUCER" | "ADMIN";
  estado: "ACTIVO" | "SUSPENDIDO";
  fechaRegistro: string;
  motivoSuspension?: string;
  suspendidoHasta?: string;
}

export interface EventoPendiente {
  id: number;
  titulo: string;
  productor: string;
  categoria: string;
  precioBase: number;
  aforo: number;
  ubicacion: string;
  fechaCreacion: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
}

export interface BalanceProductor {
  email: string;
  recaudacionBruta: number;
  comisionPlataforma: number;
  netoAPagar: number;
  estadoLiquidacion: "PENDIENTE" | "LIQUIDADO";
}

interface AdminContextType {
  comisionGlobal: number;
  setComisionGlobal: (fee: number) => void;
  usuarios: Usuario[];
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  eventos: EventoPendiente[];
  setEventos: React.Dispatch<React.SetStateAction<EventoPendiente[]>>;
  balancesProductores: BalanceProductor[];
  liquidarProductor: (email: string) => void;
  alternarEstadoUsuario: (id: number) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [comisionGlobal, setComisionGlobal] = useState(12);

  // Mocks iniciales de sesión (frontend-only)
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      email: "cosme.fulanito@gmail.com",
      rol: "USER",
      estado: "ACTIVO",
      fechaRegistro: "2026-02-14",
    },
    {
      id: 2,
      email: "baba.management@empresa.com",
      rol: "PRODUCER",
      estado: "ACTIVO",
      fechaRegistro: "2026-01-20",
    },
    {
      id: 3,
      email: "lucas.dev@boletoclick.com",
      rol: "ADMIN",
      estado: "ACTIVO",
      fechaRegistro: "2025-11-05",
    },
    {
      id: 4,
      email: "malicious.hacker@fail.com",
      rol: "USER",
      estado: "SUSPENDIDO",
      fechaRegistro: "2026-05-12",
      motivoSuspension: "Violación de términos de servicio",
      suspendidoHasta: "2026-11-12",
    },
    {
      id: 5,
      email: "tickets.norte@eventos.com",
      rol: "PRODUCER",
      estado: "ACTIVO",
      fechaRegistro: "2026-06-01",
    },
  ]);

  const [eventos, setEventos] = useState<EventoPendiente[]>([
    {
      id: 101,
      titulo: "Cachengue Fest Vol. 4",
      productor: "baba.management@empresa.com",
      categoria: "Fiestas",
      precioBase: 8000,
      aforo: 2500,
      ubicacion: "Complejo Arena, Pabellón C",
      fechaCreacion: "2026-06-15",
      estado: "PENDIENTE",
    },
    {
      id: 102,
      titulo: "Rock en el Galpón - Ciclo Under",
      productor: "tickets.norte@eventos.com",
      categoria: "Recitales",
      precioBase: 4500,
      aforo: 300,
      ubicacion: "El Galpón Cultural - CABA",
      fechaCreacion: "2026-06-16",
      estado: "PENDIENTE",
    },
    {
      id: 103,
      titulo: "Stand Up: Casi Famosos",
      productor: "comedia.indie@gmail.com",
      categoria: "Teatro",
      precioBase: 6000,
      aforo: 120,
      ubicacion: "Teatro Picadilly, Sala 2",
      fechaCreacion: "2026-06-14",
      estado: "PENDIENTE",
    },
  ]);

  const [liquidadosIds, setLiquidadosIds] = useState<string[]>([]);

  // Acción reactiva: Banear / Reactivar usuario
  const alternarEstadoUsuario = (id: number) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === "ACTIVO" ? "SUSPENDIDO" : "ACTIVO" }
          : u,
      ),
    );
  };

  // Cálculo financiero dinámico en base al input del Fee Global y eventos aprobados
  const balancesProductores = useMemo(() => {
    const producersMap: Record<string, number> = {};

    usuarios
      .filter((u) => u.rol === "PRODUCER")
      .forEach((p) => {
        producersMap[p.email] = 0;
      });

    eventos.forEach((ev) => {
      if (ev.estado === "APROBADO") {
        const totalCaja = ev.precioBase * ev.aforo;
        if (producersMap[ev.productor] !== undefined) {
          producersMap[ev.productor] += totalCaja;
        } else {
          producersMap[ev.productor] = totalCaja;
        }
      }
    });

    return Object.keys(producersMap).map((email) => {
      const bruta = producersMap[email];
      const comision = (bruta * comisionGlobal) / 100;
      const neto = bruta - comision;

      return {
        email,
        recaudacionBruta: bruta,
        comisionPlataforma: comision,
        netoAPagar: neto,
        estadoLiquidacion: liquidadosIds.includes(email)
          ? ("LIQUIDADO" as const)
          : ("PENDIENTE" as const),
      };
    });
  }, [usuarios, eventos, comisionGlobal, liquidadosIds]);

  const liquidarProductor = (email: string) => {
    if (!liquidadosIds.includes(email)) {
      setLiquidadosIds([...liquidadosIds, email]);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        comisionGlobal,
        setComisionGlobal,
        usuarios,
        setUsuarios,
        eventos,
        setEventos,
        balancesProductores,
        liquidarProductor,
        alternarEstadoUsuario,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin debe usarse dentro de un AdminProvider");
  return context;
}
