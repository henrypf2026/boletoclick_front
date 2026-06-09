"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ticketService, type ApiTicket } from "@/services/ticketService";
import TicketQrCode from "@/components/ui/TicketQrCode";
import AddToWalletButton from "@/components/ui/AddToWalletButton";


function statusStyle(status: ApiTicket["order"]["status"]) {
  switch (status) {
    case "PAID": return "text-success bg-success/10 border-success";
    case "PENDING": return "text-yellow-600 bg-yellow-400/10 border-yellow-500";
    case "FAILED": return "text-red-500 bg-red-500/10 border-red-500";
    case "REFUNDED": return "text-text-soft bg-surface-2 border-text/30";
  }
}

function statusLabel(status: ApiTicket["order"]["status"]) {
  switch (status) {
    case "PAID": return "PAGADO";
    case "PENDING": return "PENDIENTE";
    case "FAILED": return "FALLIDO";
    case "REFUNDED": return "REEMBOLSADO";
  }
}

export default function MisTicketsPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketExpandido, setTicketExpandido] = useState<ApiTicket | null>(null);

  
  useEffect(() => {
    if (!user) return;

    ticketService
      .getMyTickets(user.id)
      .then((data) => setTickets(data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user]);

  
  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center border-4 border-text p-8 bg-surface shadow-[6px_6px_0px_0px_var(--color-text)]">
          <p className="font-mono text-xs font-black uppercase tracking-widest text-text-soft mb-4">
            Tenés que iniciar sesión para ver tus entradas.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary text-background border-2 border-text font-mono font-black px-5 py-2.5 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen bg-background text-text transition-colors">


      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="font-mono text-[11px] font-black uppercase tracking-widest text-text-soft mb-1">
            ↗ Tu historial
          </p>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Mis Entradas
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Tus boletos digitales listos para el acceso
          </p>
        </div>
        <Link
          href="/eventos"
          className="inline-flex items-center bg-primary text-background border-2 border-text font-mono font-black px-4 py-2.5 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all whitespace-nowrap"
        >
          Buscar eventos
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-surface border-2 border-text w-full"></div>
          <div className="h-40 bg-surface border-2 border-text w-full"></div>
        </div>

      /* Sin tickets */
      ) : tickets.length === 0 ? (
        <div className="border-4 border-dashed border-text/30 bg-surface p-12 text-center">
          <p className="font-mono text-xs font-black uppercase tracking-wide text-text-soft">
            Aún no tenés entradas compradas.
          </p>
          <Link
            href="/eventos"
            className="mt-4 inline-block text-xs font-black uppercase tracking-wider text-primary hover:underline font-mono"
          >
            Explorar eventos disponibles →
          </Link>
        </div>

      /* Lista de tickets */
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setTicketExpandido(ticket)}
              className="bg-surface border-2 border-text shadow-[4px_4px_0px_0px_var(--color-text)] cursor-pointer transition-all hover:shadow-[7px_7px_0px_0px_var(--color-text)] hover:-translate-x-0.5 hover:-translate-y-0.5 group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">

                {/* Info del ticket */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black uppercase tracking-tight text-text group-hover:text-primary transition-colors">
                      {ticket.eventTitle ?? ticket.ticketType.name}
                    </h2>
                    <span className={`text-[10px] font-mono font-black uppercase border px-2 py-0.5 ${statusStyle(ticket.order.status)}`}>
                      {statusLabel(ticket.order.status)}
                    </span>
                  </div>

                  {ticket.ticketType.zone && (
                    <p className="text-text-soft text-[11px] uppercase font-bold tracking-wider font-mono">
                      SECTOR:{" "}
                      <span className="text-text font-black bg-surface-2 px-2 py-0.5 border border-text/20">
                        {ticket.ticketType.zone}
                      </span>
                    </p>
                  )}

                  <p className="text-text-soft text-xs font-mono">
                    Comprado el{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <strong className="text-lg font-black text-success font-mono">
                    ${ticket.ticketType.price.toLocaleString("es-AR")}
                  </strong>
                </div>

                {/* QR */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="flex h-28 w-28 items-center justify-center border-4 border-text bg-background p-2 shadow-[2px_2px_0px_0px_var(--color-text)] group-hover:scale-105 transition-transform">
                    <TicketQrCode value={ticket.qrCode} size={96} className="w-full h-full" />
                  </div>
                  <span className="text-center text-[10px] font-bold uppercase tracking-wide text-text-soft font-mono">
                    Tocá para ver
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/*Modal ticket expandido  */}
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
                {new Date(ticketExpandido.createdAt).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* QR expandido */}
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