"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "@/lib/apiClient";

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
  setComisionGlobal: (fee: number) => Promise<void>;
  usuarios: Usuario[];
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  eventos: EventoPendiente[];
  setEventos: React.Dispatch<React.SetStateAction<EventoPendiente[]>>;
  balancesProductores: BalanceProductor[];
  liquidarProductor: (email: string) => Promise<void>;
  alternarEstadoUsuario: (id: number) => void;
  cargarDatosFinancieros: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [comisionGlobal, setComisionGlobalState] = useState(12);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [eventos, setEventos] = useState<EventoPendiente[]>([]);
  const [balancesProductores, setBalancesProductores] = useState<
    BalanceProductor[]
  >([]);

  const cargarDatosFinancieros = useCallback(async () => {
    try {
      const dataComision = await api.get<{ comisionGlobal: number }>(
        "/admin/dashboard-metrics/finanzas/comision",
      );
      if (dataComision && typeof dataComision.comisionGlobal === "number") {
        setComisionGlobalState(dataComision.comisionGlobal);
      }

      const dataBalances = await api.get<BalanceProductor[]>(
        "/admin/dashboard-metrics/finanzas/balances",
      );
      if (dataBalances && Array.isArray(dataBalances)) {
        setBalancesProductores(dataBalances);
      }
    } catch (error) {
      console.error(
        "Error al cargar la información financiera del backend:",
        error,
      );
    }
  }, []);

  // 🛠️ CORRECCIÓN: Array de dependencias vacío para fulminar el bucle infinito 429
  useEffect(() => {
    cargarDatosFinancieros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setComisionGlobal = async (fee: number) => {
    try {
      setComisionGlobalState(fee);
      await api.put("/admin/dashboard-metrics/finanzas/comision", { fee });
    } catch (error) {
      console.error("Error al intentar cambiar el fee global:", error);
    }
  };
  const liquidarProductor = async (email: string) => {
    try {
      await api.post("/admin/dashboard-metrics/finanzas/liquidar", { email });
      await cargarDatosFinancieros();
    } catch (error) {
      console.error("Error al registrar liquidación:", error);
    }
  };

  const alternarEstadoUsuario = (id: number) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === "ACTIVO" ? "SUSPENDIDO" : "ACTIVO" }
          : u,
      ),
    );
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
        cargarDatosFinancieros,
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
