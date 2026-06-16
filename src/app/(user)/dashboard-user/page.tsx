"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ticketService, type ApiTicket } from "@/services/ticketService";
import { orderService } from "@/services/orderService";
import TicketQrCode from "@/components/ui/TicketQrCode";
import AddToWalletButton from "@/components/ui/AddToWalletButton";



interface OrderItem {
  id: string;
  total: number;
  producerSubtotal: number;
  platformFee: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}


function orderStatusLabel(status: ApiTicket["order"]["status"]) {
  switch (status) {
    case "PAID": return "PAGADO";
    case "PENDING": return "PENDIENTE";
    case "FAILED": return "FALLIDO";
    case "REFUNDED": return "REEMBOLSADO";
  }
}

function orderStatusColor(status: ApiTicket["order"]["status"]) {
  switch (status) {
    case "PAID": return "text-success bg-success/10 border-success";
    case "PENDING": return "text-yellow-600 bg-yellow-400/10 border-yellow-500";
    case "FAILED": return "text-red-500 bg-red-500/10 border-red-500";
    case "REFUNDED": return "text-text-soft bg-surface-2 border-text/30";
  }
}


export default function UserDashboard() {

  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<"entradas" | "historial">("entradas");
  const [ticketExpandido, setTicketExpandido] = useState<ApiTicket | null>(null);
  const [filtroHistorial, setFiltroHistorial] = useState("");
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorTickets, setErrorTickets] = useState(false);
  const [errorOrders, setErrorOrders] = useState(false);


  useEffect(() => {
  if (!user) return;
  const fetchTickets = async () => {
    try {
      const data = await ticketService.getMyTickets(user.id);
      setTickets(data);
    } catch {
      setErrorTickets(true);
    } finally {
      setLoadingTickets(false);
    }
  };
  fetchTickets();
}, [user]);

  
  useEffect(() => {
  if (!user) return;
  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch {
      setErrorOrders(true);
    } finally {
      setLoadingOrders(false);
    }
  };
  fetchOrders();
}, [user]);
 
  const ordenesFiltradas = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(filtroHistorial.toLowerCase()) ||
      o.status.toLowerCase().includes(filtroHistorial.toLowerCase()),
  );

   const firstName = user
    ? (user.name ?? user.email.split("@")[0]).split(" ")[0]
    : "";

    
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-xs uppercase text-text-soft animate-pulse">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    router.push("/login?from=/dashboard-user");
    return null;
  }


  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-background text-text transition-colors">

      
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Mi Cuenta
          </h1>
          {firstName && (
            <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
              Bienvenido/a, <span className="text-text font-black">{firstName}</span>
            </p>
          )}
        </div>
        <div className="bg-surface border-2 border-text px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--color-text)]">
          ESTADO: <span className="text-success animate-pulse">● En Línea</span>
        </div>
      </div>

      
      <div className="flex border-b-2 border-text mb-6 gap-2 overflow-x-auto pb-0">
        {(
          [
            { id: "entradas", label: "MIS ENTRADAS" },
            { id: "historial", label: "HISTORIAL DE COMPRAS" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSeccionActiva(tab.id)}
            className={`pb-3 px-4 font-black text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer border-t-2 border-x-2 ${
              seccionActiva === tab.id
                ? "bg-text text-surface border-text translate-y-0.5"
                : "border-transparent text-text-soft hover:text-text bg-surface/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => router.push("/perfil")}
          className="pb-3 px-4 font-black text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer border-t-2 border-x-2 border-transparent text-text-soft hover:text-text bg-surface/40"
        >
          👤 MI PERFIL
        </button>
      </div>

      {/*  MIS ENTRADAS  */}
      {seccionActiva === "entradas" && (
        <>
          {loadingTickets ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-surface border-2 border-text w-full"></div>
              <div className="h-32 bg-surface border-2 border-text w-full"></div>
            </div>
          ) : errorTickets ? (
            <div className="p-8 text-center font-mono text-xs uppercase text-red-500 border-2 border-red-500 bg-red-500/10">
              Error al cargar las entradas. Intentá de nuevo.
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs uppercase text-text-soft border-2 border-dashed border-text/30">
              No tenés entradas activas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setTicketExpandido(ticket)}
                  className="bg-surface border-2 border-text rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] p-5 flex flex-col justify-between transition-all hover:shadow-[7px_7px_0px_0px_var(--color-text)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="border-b-2 border-dashed border-text/40 pb-4 mb-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-text font-black text-lg uppercase tracking-tight group-hover:text-primary transition-colors">
                        {ticket.eventTitle ?? ticket.ticketType.name}
                      </h3>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 font-bold whitespace-nowrap border ${orderStatusColor(ticket.order.status)}`}>
                        {orderStatusLabel(ticket.order.status)}
                      </span>
                    </div>
                    {ticket.ticketType.zone && (
                      <p className="text-text-soft mt-2 text-[11px] uppercase font-bold tracking-wider">
                        SECTOR:{" "}
                        <span className="text-text font-black font-mono bg-surface-2 px-2 py-0.5 border border-text/20">
                          {ticket.ticketType.zone}
                        </span>
                      </p>
                    )}
                    <p className="text-primary-deep dark:text-primary font-black mt-2 font-mono text-sm">
                      ${ticket.ticketType.price.toLocaleString("es-MX")}
                    </p>
                  </div>
                  <div className="bg-surface-2 p-3 border-2 border-text flex flex-col items-center justify-center max-w-40 mx-auto w-full transition-transform group-hover:scale-105">
                    <TicketQrCode value={ticket.qrCode} size={112} className="w-full h-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/*  HISTORIAL DE COMPRAS  */}
      {seccionActiva === "historial" && (
        <div className="space-y-4">
          <div className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_var(--color-text)]">
            <input
              type="text"
              placeholder="🔎 BUSCAR POR N° DE ORDEN O ESTADO..."
              value={filtroHistorial}
              onChange={(e) => setFiltroHistorial(e.target.value)}
              className="w-full bg-background border-2 border-text p-2 font-mono text-xs font-bold uppercase focus:outline-none"
            />
          </div>

          {loadingOrders ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-surface border-2 border-text w-full"></div>
              <div className="h-24 bg-surface border-2 border-text w-full"></div>
            </div>
          ) : errorOrders ? (
            <div className="p-8 text-center font-mono text-xs uppercase text-red-500 border-2 border-red-500 bg-red-500/10">
              Error al cargar el historial. Intentá de nuevo.
            </div>
          ) : (
            <div className="bg-surface border-2 border-text rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] divide-y-2 divide-text">
              {ordenesFiltradas.length > 0 ? (
                ordenesFiltradas.map((orden) => (
                  <div
                    key={orden.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono bg-text text-surface px-2 py-0.5 font-bold text-[10px]">
                          {orden.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-text-soft text-xs font-mono font-bold">
                          {new Date(orden.createdAt).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className={`text-[10px] font-mono font-black uppercase border px-2 py-0.5 ${orderStatusColor(orden.status)}`}>
                          {orderStatusLabel(orden.status)}
                        </span>
                      </div>
                      <p className="text-text-soft text-xs font-mono mt-0.5">
                        Comisión plataforma: ${orden.platformFee.toLocaleString("es-MX")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-text/20">
                      <div className="sm:text-right">
                        <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                          TOTAL ABONADO
                        </span>
                        <span className="font-black text-lg font-mono text-text">
                          ${orden.total.toLocaleString("es-MX")}
                        </span>
                      </div>
                      <button
                        onClick={() => alert(`Simulación: Descargando PDF de la orden ${orden.id}...`)}
                        className="bg-primary hover:brightness-105 text-background font-mono font-black text-xs uppercase tracking-wider transition-all border-2 border-text px-4 py-2 shadow-[2px_2px_0px_0px_var(--color-text)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center font-mono text-xs uppercase text-text-soft">
                  No se encontraron registros que coincidan.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ticket expandido */}
      {ticketExpandido && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setTicketExpandido(null)}
        >
          <div
            className="bg-white text-black border-4 border-black max-w-sm w-full p-6 rounded-none shadow-[8px_8px_0px_0px_#CCFF00] flex flex-col justify-between relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-r-full border-r-4 border-y-4 border-black -ml-1"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-l-full border-l-4 border-y-4 border-black -mr-1"></div>

            <div className="border-b-4 border-black border-dashed pb-5 text-center">
              <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 uppercase font-black tracking-widest">
                PASES DIGITALES BOLETOCLICK
              </span>
              <h2 className="text-black font-black text-2xl uppercase tracking-tighter mt-4 leading-tight">
                {ticketExpandido.eventTitle ?? ticketExpandido.ticketType.name}
              </h2>
              {ticketExpandido.ticketType.zone && (
                <div className="mt-3">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block mb-1">
                    SECTOR ASIGNADO
                  </span>
                  <span className="bg-black text-white px-3 py-1 text-xs font-mono font-black uppercase tracking-wider">
                    {ticketExpandido.ticketType.zone}
                  </span>
                </div>
              )}
              <p className="text-neutral-500 font-mono text-xs mt-2">
                {new Date(ticketExpandido.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* QR */}
            <div className="my-6 bg-white p-4 border-4 border-black flex flex-col items-center justify-center aspect-square w-full max-w-60 mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <TicketQrCode value={ticketExpandido.qrCode} size={200} className="w-full h-full" />
            </div>

            <div className="space-y-3">
              <p className="text-center text-[10px] font-mono font-black text-neutral-600 uppercase tracking-tight">
                📱 Presentá esta pantalla en los lectores de puerta
              </p>
              <div className="grid grid-cols-1 gap-2">
                <AddToWalletButton
                  ticket={{
                    id: ticketExpandido.id,
                    qrCode: ticketExpandido.qrCode,
                    eventTitle: ticketExpandido.eventTitle,
                    ticketTypeName: ticketExpandido.ticketType.name,
                    zone: ticketExpandido.ticketType.zone,
                  }}
                />
                <button
                  onClick={() => setTicketExpandido(null)}
                  className="w-full bg-black hover:bg-neutral-900 text-white font-mono font-black py-2.5 text-[11px] uppercase tracking-wider border-2 border-black transition-colors cursor-pointer"
                >
                  [ VOLVER A MIS ENTRADAS ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}