"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import jsPDF from "jspdf";

type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  stock: number;
  zone: string;
}

interface Ticket {
  id: string;
  orderId: string;
  ticketTypeId: string;
  qrCode: string;
  allowEntrance: boolean;
  usedAt: string | null;
  createdAt: string;
  ticketType: TicketType;
}

interface Order {
  id: string;
  total: number;
  producerSubtotal: number;
  platformFee: number;
  status: OrderStatus;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  tickets: Ticket[];
}

interface EventData {
  id: string;
  title: string;
  eventDate: string;
  venue?: { name: string };
}

function getEffectiveStatus(orden: Order): OrderStatus {
  if (
    orden.status === "PAID" &&
    orden.tickets.length > 0 &&
    orden.tickets.every((t) => !t.allowEntrance)
  ) {
    return "CANCELLED";
  }
  return orden.status;
}

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "PAID":      return "PAGADO";
    case "PENDING":   return "PENDIENTE";
    case "FAILED":    return "FALLIDO";
    case "REFUNDED":  return "REEMBOLSADO";
    case "CANCELLED": return "CANCELADO";
  }
}

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "PAID":      return "text-success bg-success/10 border-success";
    case "PENDING":   return "text-yellow-600 bg-yellow-400/10 border-yellow-500";
    case "FAILED":    return "text-red-500 bg-red-500/10 border-red-500";
    case "REFUNDED":  return "text-text-soft bg-surface-2 border-text/30";
    case "CANCELLED": return "text-text-soft bg-surface-2 border-text/30";
  }
}

const SWAL_CUSTOM = {
  popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
  title: "uppercase font-black tracking-tighter",
  confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
  cancelButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
};

async function fetchEvent(eventId: string): Promise<EventData | null> {
  try {
    const res = await fetch(`/api/backend/events/${eventId}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPeso(n: number) {
  return "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

async function generarComprobantePDF(orden: Order) {
  let evento: EventData | null = null;
  const primerTicket = orden.tickets?.[0];
  if (primerTicket?.ticketType?.eventId) {
    evento = await fetchEvent(primerTicket.ticketType.eventId);
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const margen = 20;
  let y = margen;

  const PURPLE = "#6750e0";
  const ORANGE = "#ff6b00";
  const BLACK  = "#171717";
  const GRAY   = "#888888";
  const LGRAY  = "#f2f2f2";
  const WHITE  = "#ffffff";

  doc.setFillColor(BLACK);
  doc.rect(0, 0, ancho, 30, "F");

  doc.setFillColor(ORANGE);
  doc.rect(0, 30, ancho, 2, "F");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(WHITE);
  doc.text("BOLETOCLICK", margen, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#aaaaaa");
  doc.text("COMPROBANTE DE COMPRA", margen, 21);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#aaaaaa");
  doc.text("N° DE ORDEN", ancho - margen, 13, { align: "right" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(ORANGE);
  doc.text(`#${orden.id.slice(0, 8).toUpperCase()}`, ancho - margen, 21, { align: "right" });

  y = 42;

  const efectiveStatus = getEffectiveStatus(orden);
  const estadoTexto = statusLabel(efectiveStatus);
  const badgeColor = efectiveStatus === "PAID" ? PURPLE : efectiveStatus === "REFUNDED" ? "#555" : "#cc3333";
  doc.setFillColor(badgeColor);
  doc.roundedRect(margen, y - 4, 38, 7, 1, 1, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(WHITE);
  doc.text(`✓ ${estadoTexto}`, margen + 4, y + 0.8);
  y += 12;

  if (evento) {
    doc.setFillColor(LGRAY);
    doc.rect(margen, y, ancho - margen * 2, 28, "F");

    doc.setFillColor(PURPLE);
    doc.rect(margen, y, 3, 28, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(GRAY);
    doc.text("EVENTO", margen + 7, y + 6);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BLACK);
    doc.text(evento.title ?? "—", margen + 7, y + 13);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY);
    const fechaEvento = evento.eventDate ? `📅  ${formatFecha(evento.eventDate)}` : "—";
    const venue = evento.venue?.name ? `📍  ${evento.venue.name}` : "";
    doc.text(fechaEvento, margen + 7, y + 20);
    if (venue) doc.text(venue, margen + 7, y + 25);

    y += 36;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GRAY);
  doc.text("DETALLE DE LA TRANSACCIÓN", margen, y);
  y += 7;

  const col1 = margen;
  const col2 = ancho / 2;

  interface CeldaDato { label: string; value: string; }
  const celdas: CeldaDato[] = [
    { label: "Fecha de compra", value: formatFecha(orden.createdAt) },
    { label: "Hora",            value: formatHora(orden.createdAt) },
    { label: "Método de pago",  value: "Stripe" },
    { label: "Estado",          value: estadoTexto },
  ];

  celdas.forEach((celda, i) => {
    const x = i % 2 === 0 ? col1 : col2;
    if (i % 2 === 0 && i > 0) y += 12;

    doc.setFillColor(LGRAY);
    doc.rect(x, y - 3.5, (ancho - margen * 2) / 2 - 2, 10, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(GRAY);
    doc.text(celda.label.toUpperCase(), x + 3, y + 1);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BLACK);
    doc.text(celda.value, x + 3, y + 6.5);
  });

  y += 18;

  if (orden.transactionId) {
    doc.setFillColor(LGRAY);
    doc.rect(margen, y - 3.5, ancho - margen * 2, 10, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(GRAY);
    doc.text("ID DE TRANSACCIÓN", margen + 3, y + 1);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BLACK);
    const txId = orden.transactionId.length > 55
      ? orden.transactionId.slice(0, 55) + "..."
      : orden.transactionId;
    doc.text(txId, margen + 3, y + 6.5);
    y += 16;
  }

  if (orden.tickets && orden.tickets.length > 0) {
    y += 2;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(GRAY);
    doc.text("DETALLE DE TICKETS", margen, y);
    y += 7;

    doc.setFillColor(PURPLE);
    doc.rect(margen, y - 3.5, ancho - margen * 2, 8, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(WHITE);
    doc.text("TIPO",   margen + 3, y + 1);
    doc.text("ZONA",   margen + 60, y + 1);
    doc.text("PRECIO", ancho - margen - 25, y + 1);
    y += 8;

    orden.tickets.forEach((ticket, i) => {
      const bg = i % 2 === 0 ? WHITE : LGRAY;
      doc.setFillColor(bg);
      doc.rect(margen, y - 3.5, ancho - margen * 2, 8, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(BLACK);
      doc.text(ticket.ticketType?.name ?? "—", margen + 3, y + 1);
      doc.text(ticket.ticketType?.zone ?? "—", margen + 60, y + 1);
      doc.text(
        ticket.ticketType?.price ? formatPeso(ticket.ticketType.price) : "—",
        ancho - margen - 3,
        y + 1,
        { align: "right" }
      );
      y += 8;
    });

    y += 4;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GRAY);
  doc.text("RESUMEN DE PAGO", margen, y);
  y += 8;

  const filaResumen = (label: string, valor: string, bold = false) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(bold ? BLACK : GRAY);
    doc.text(label, margen, y);
    doc.text(valor, ancho - margen, y, { align: "right" });
    y += 6;
  };

  filaResumen("Subtotal productor",  formatPeso(orden.producerSubtotal));
  filaResumen("Comisión plataforma", formatPeso(orden.platformFee));

  y += 2;
  doc.setDrawColor(PURPLE);
  doc.setLineWidth(0.8);
  doc.line(margen, y, ancho - margen, y);
  y += 6;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BLACK);
  doc.text("TOTAL ABONADO", margen, y);
  doc.setTextColor(ORANGE);
  doc.text(formatPeso(orden.total), ancho - margen, y, { align: "right" });
  y += 14;

  doc.setDrawColor("#dddddd");
  doc.setLineWidth(0.3);
  doc.line(margen, y, ancho - margen, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GRAY);
  doc.text("Este comprobante es válido como constancia de pago.", ancho / 2, y, { align: "center" });
  y += 4;
  doc.text("Guardalo para futuros reclamos o devoluciones.", ancho / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PURPLE);
  doc.text("boletoclick.com", ancho / 2, y, { align: "center" });

  doc.save(`boletoclick-comprobante-${orden.id.slice(0, 8).toUpperCase()}.pdf`);
}

export default function MisComprasPage() {
  const { user } = useAuth();
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [pdfLoading,  setPdfLoading]  = useState<string | null>(null);
  const [eventTitles, setEventTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const load = () => {
      fetch("/api/backend/orders/me", { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Error al traer órdenes");
          return res.json();
        })
        .then((data) => setOrders(data))
        .catch(() => {
          Swal.fire({
            title: "ERROR",
            text: "No pudimos cargar tu historial de compras. Intentá de nuevo.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#6750e0",
            background: "#f5f4f0",
            color: "#171717",
            customClass: SWAL_CUSTOM,
          });
        })
        .finally(() => setLoading(false));
    };

    load();

    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user]);

  useEffect(() => {
    const uniqueIds = [
      ...new Set(
        orders
          .map((o) => o.tickets?.[0]?.ticketType?.eventId)
          .filter(Boolean) as string[]
      ),
    ];
    if (!uniqueIds.length) return;
    Promise.all(
      uniqueIds.map((id) =>
        fetch(`/api/backend/events/${id}`, { credentials: "include" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((ev) => { if (ev?.id && ev?.title) map[ev.id] = ev.title; });
      setEventTitles(map);
    });
  }, [orders]);

  async function handleCancelOrder(orderId: string) {
    const result = await Swal.fire({
      title: "¿Cancelar orden?",
      text: "Se anularán tus entradas y se restaurará el stock. Solo podés cancelar hasta 48 hs antes del evento.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, volver",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6750e0",
      background: "#f5f4f0",
      color: "#171717",
      customClass: SWAL_CUSTOM,
    });

    if (!result.isConfirmed) return;

    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/backend/orders/${orderId}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al cancelar la orden");
      }

      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: "CANCELLED" as OrderStatus } : o)
      );

      Swal.fire({
        title: "CANCELADO",
        text: "Tu orden fue cancelada exitosamente.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: SWAL_CUSTOM,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo cancelar la orden.";
      Swal.fire({
        title: "ERROR",
        text: message,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: SWAL_CUSTOM,
      });
    } finally {
      setCancellingId(null);
    }
  }

  async function handleDescargarPDF(orden: Order) {
    setPdfLoading(orden.id);
    try {
      await generarComprobantePDF(orden);
    } catch (err) {
      console.error("Error generando PDF:", err);
      Swal.fire({
        title: "ERROR",
        text: "No se pudo generar el comprobante. Intentá de nuevo.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#6750e0",
        background: "#f5f4f0",
        color: "#171717",
        customClass: SWAL_CUSTOM,
      });
    } finally {
      setPdfLoading(null);
    }
  }

  const ordenesFiltradas = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.id.toLowerCase().includes(busqueda.toLowerCase()) ||
          statusLabel(getEffectiveStatus(o)).toLowerCase().includes(busqueda.toLowerCase())
      ),
    [orders, busqueda]
  );

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center border-4 border-text p-8 bg-surface shadow-[6px_6px_0px_0px_var(--color-text)]">
          <p className="font-mono text-xs font-black uppercase tracking-widest text-text-soft">
            Tenés que{" "}
            <Link href="/login" className="text-primary underline hover:opacity-80">
              iniciar sesión
            </Link>{" "}
            para ver tus compras.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen bg-background text-text transition-colors">
      <div className="mb-8 border-b-4 border-text pb-4">
        <p className="font-mono text-[11px] font-black uppercase tracking-widest text-text-soft mb-1">
          ↗ Tu historial
        </p>
        <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
          Mis Compras
        </h1>
        <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
          Historial de transacciones y comprobantes
        </p>
      </div>

      <div className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_var(--color-text)] mb-6">
        <input
          type="text"
          placeholder="🔎 BUSCAR POR N° DE ORDEN O ESTADO..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-background border-2 border-text p-2.5 font-mono text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-surface border-2 border-text w-full" />
          <div className="h-40 bg-surface border-2 border-text w-full" />
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="border-4 border-dashed border-text/30 bg-surface p-12 text-center">
          <p className="font-mono text-xs font-black uppercase tracking-wide text-text-soft">
            {busqueda
              ? "No se encontraron resultados."
              : "Aún no tenés compras registradas."}
          </p>
          {!busqueda && (
            <Link
              href="/eventos"
              className="mt-4 inline-block text-xs font-black uppercase tracking-wider text-primary hover:underline font-mono"
            >
              Explorar eventos →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {ordenesFiltradas.map((orden) => (
            <div
              key={orden.id}
              className="bg-surface border-2 border-text shadow-[4px_4px_0px_0px_var(--color-text)]"
            >
              <div className="border-b-2 border-text px-5 py-3 bg-background/40">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono bg-text text-surface px-2 py-0.5 font-bold text-[10px] whitespace-nowrap">
                      {orden.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-text-soft text-[11px] font-mono font-bold">
                      {new Date(orden.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-black uppercase border px-2 py-0.5 whitespace-nowrap ${statusStyle(getEffectiveStatus(orden))}`}
                  >
                    {statusLabel(getEffectiveStatus(orden))}
                  </span>
                </div>
                {(() => {
                  const eventId = orden.tickets?.[0]?.ticketType?.eventId;
                  const title = eventId ? eventTitles[eventId] : null;
                  return title ? (
                    <p className="mt-1.5 font-black text-sm uppercase tracking-tight text-text truncate">
                      {title}
                    </p>
                  ) : null;
                })()}
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-background border border-text/20 p-2.5">
                    <span className="text-text-soft text-[9px] block uppercase font-mono font-bold mb-0.5">
                      Entradas
                    </span>
                    <span className="font-black text-sm font-mono">
                      {orden.tickets?.length > 0 ? `${orden.tickets.length}x` : "—"}
                    </span>
                  </div>
                  <div className="bg-background border border-text/20 p-2.5">
                    <span className="text-text-soft text-[9px] block uppercase font-mono font-bold mb-0.5">
                      Comisión
                    </span>
                    <span className="font-black text-sm font-mono">
                      ${orden.platformFee.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {orden.tickets?.[0]?.ticketType && (
                  <div className="bg-background border border-text/20 p-2.5 mb-4">
                    <span className="text-text-soft text-[9px] block uppercase font-mono font-bold mb-0.5">
                      Tipo · Zona
                    </span>
                    <span className="font-bold text-xs font-mono">
                      {orden.tickets[0].ticketType.name}
                      {orden.tickets[0].ticketType.zone
                        ? ` · ${orden.tickets[0].ticketType.zone}`
                        : ""}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t-2 border-dashed border-text/30 pt-4 gap-2 flex-wrap">
                  <div>
                    <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                      Total abonado
                    </span>
                    <span className="font-black text-xl font-mono text-text">
                      ${orden.total.toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {getEffectiveStatus(orden) === "PAID" && (
                      <button
                        onClick={() => handleCancelOrder(orden.id)}
                        disabled={cancellingId === orden.id}
                        className="flex items-center gap-1.5 bg-red-600 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-text px-3 py-2.5 shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                      >
                        {cancellingId === orden.id ? "..." : "✕ Cancelar"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDescargarPDF(orden)}
                      disabled={getEffectiveStatus(orden) !== "PAID" || pdfLoading === orden.id}
                      className="flex items-center gap-2 bg-primary text-background font-mono font-black text-xs uppercase tracking-wider border-2 border-text px-4 py-2.5 shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                    >
                      {pdfLoading === orden.id ? (
                        <>
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Generando...
                        </>
                      ) : (
                        <>↓ Descargar PDF</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-2 bg-surface border-2 border-text p-4 shadow-[3px_3px_0px_0px_var(--color-text)] flex items-center justify-between">
            <div>
              <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                {ordenesFiltradas.length} compra{ordenesFiltradas.length > 1 ? "s" : ""}
              </span>
              <span className="font-black text-lg font-mono text-text">
                Total: $
                {ordenesFiltradas
                  .reduce((acc, o) => acc + o.total, 0)
                  .toLocaleString("es-AR")}
              </span>
            </div>
            <span className="font-mono text-[10px] font-black uppercase text-text-soft border border-text/30 px-2 py-1">
              HISTORIAL
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
