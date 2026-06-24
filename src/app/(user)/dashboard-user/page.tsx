"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ticketService, type ApiTicket } from "@/services/ticketService";
import { orderService } from "@/services/orderService";
import TicketQrCode from "@/components/ui/TicketQrCode";
import AddToWalletButton from "@/components/ui/AddToWalletButton";
import jsPDF from "jspdf";
import Swal from "sweetalert2";


interface OrderItem {
  id: string;
  total: number;
  producerSubtotal: number;
  platformFee: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  tickets?: {
    id: string;
    ticketType?: {
      id: string;
      eventId: string;
      name: string;
      price: number;
      zone: string;
    };
  }[];
}

interface EventData {
  id: string;
  title: string;
  eventDate: string;
  venue?: { name: string };
}

function orderStatusLabel(status: string) {
  switch (status) {
    case "PAID":      return "PAGADO";
    case "PENDING":   return "PENDIENTE";
    case "FAILED":    return "FALLIDO";
    case "REFUNDED":  return "REEMBOLSADO";
    case "CANCELLED": return "CANCELADO";
    default:          return status;
  }
}

function orderStatusColor(status: string) {
  switch (status) {
    case "PAID":      return "text-success bg-success/10 border-success";
    case "PENDING":   return "text-yellow-600 bg-yellow-400/10 border-yellow-500";
    case "FAILED":    return "text-red-500 bg-red-500/10 border-red-500";
    case "REFUNDED":  return "text-text-soft bg-surface-2 border-text/30";
    case "CANCELLED": return "text-text-soft bg-surface-2 border-text/30";
    default:          return "text-text-soft bg-surface-2 border-text/30";
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
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`/api/backend/events/${eventId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit",
  });
}

function formatPeso(n: number) {
  return "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

// PDF

async function generarComprobantePDF(orden: OrderItem) {
  let evento: EventData | null = null;
  const primerTicket = orden.tickets?.[0];
  if (primerTicket?.ticketType?.eventId) {
    evento = await fetchEvent(primerTicket.ticketType.eventId);
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho  = doc.internal.pageSize.getWidth();
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


  const estadoTexto = orderStatusLabel(orden.status);
  const badgeColor = orden.status === "PAID" ? PURPLE : orden.status === "REFUNDED" ? "#555" : "#cc3333";
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
    if (evento.eventDate) doc.text(`📅  ${formatFecha(evento.eventDate)}`, margen + 7, y + 20);
    if (evento.venue?.name) doc.text(`📍  ${evento.venue.name}`, margen + 7, y + 25);
    y += 36;
  }

 
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GRAY);
  doc.text("DETALLE DE LA TRANSACCIÓN", margen, y);
  y += 7;

  const col1 = margen;
  const col2 = ancho / 2;

  const celdas = [
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
    doc.text("TIPO",   margen + 3,       y + 1);
    doc.text("ZONA",   margen + 60,      y + 1);
    doc.text("PRECIO", ancho - margen - 25, y + 1);
    y += 8;

    orden.tickets.forEach((ticket, i) => {
      doc.setFillColor(i % 2 === 0 ? WHITE : LGRAY);
      doc.rect(margen, y - 3.5, ancho - margen * 2, 8, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(BLACK);
      doc.text(ticket.ticketType?.name ?? "—", margen + 3, y + 1);
      doc.text(ticket.ticketType?.zone ?? "—", margen + 60, y + 1);
      doc.text(
        ticket.ticketType?.price ? formatPeso(ticket.ticketType.price) : "—",
        ancho - margen - 3, y + 1, { align: "right" }
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

export default function UserDashboard() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva]     = useState<"entradas" | "historial">("entradas");
  const [ticketExpandido, setTicketExpandido] = useState<ApiTicket | null>(null);
  const [filtroHistorial, setFiltroHistorial] = useState("");
  const [tickets, setTickets]                 = useState<ApiTicket[]>([]);
  const [orders, setOrders]                   = useState<OrderItem[]>([]);
  const [loadingTickets, setLoadingTickets]   = useState(true);
  const [loadingOrders, setLoadingOrders]     = useState(true);
  const [errorTickets, setErrorTickets]       = useState(false);
  const [errorOrders, setErrorOrders]         = useState(false);
  const [pdfLoading, setPdfLoading]           = useState<string | null>(null);
  const [cancellingId, setCancellingId]       = useState<string | null>(null);
  const [ticketEventTitles, setTicketEventTitles] = useState<Record<string, string>>({});
  const [orderEventTitles, setOrderEventTitles]   = useState<Record<string, string>>({});

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

  useEffect(() => {
    const needsTitle = tickets.filter((t) => !t.eventTitle && t.ticketType.eventId);
    const uniqueIds = [...new Set(needsTitle.map((t) => t.ticketType.eventId!))];
    if (!uniqueIds.length) return;
    Promise.all(uniqueIds.map((id) => fetchEvent(id).then((e) => ({ id, title: e?.title ?? null }))))
      .then((results) => {
        const map: Record<string, string> = {};
        results.forEach(({ id, title }) => { if (title) map[id] = title; });
        setTicketEventTitles(map);
      });
  }, [tickets]);

  useEffect(() => {
    if (!orders.length) return;
    const pairs = orders
      .map((o) => ({ orderId: o.id, eventId: o.tickets?.[0]?.ticketType?.eventId }))
      .filter((p): p is { orderId: string; eventId: string } => !!p.eventId);
    if (!pairs.length) return;
    const uniqueEventIds = [...new Set(pairs.map((p) => p.eventId))];
    Promise.all(uniqueEventIds.map((id) => fetchEvent(id).then((e) => ({ id, title: e?.title ?? null }))))
      .then((results) => {
        const eventMap: Record<string, string> = {};
        results.forEach(({ id, title }) => { if (title) eventMap[id] = title; });
        const orderMap: Record<string, string> = {};
        pairs.forEach((p) => { if (eventMap[p.eventId]) orderMap[p.orderId] = eventMap[p.eventId]; });
        setOrderEventTitles(orderMap);
      });
  }, [orders]);

  const ordenesFiltradas = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(filtroHistorial.toLowerCase()) ||
      o.status.toLowerCase().includes(filtroHistorial.toLowerCase())
  );

  const firstName = user
    ? (user.name ?? user.email.split("@")[0]).split(" ")[0]
    : "";

  async function handleCancelOrder(orderId: string) {
    const result = await Swal.fire({
      title: "¿Cancelar esta compra?",
      text: "Se anularán tus entradas y no podrás usarlas. Esta acción no tiene vuelta atrás. Solo podés cancelar hasta 48 hs antes del evento.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar compra",
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
        throw new Error(data.message || "No se pudo cancelar la orden.");
      }

      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: "CANCELLED" as const } : o)
      );

      Swal.fire({
        title: "COMPRA CANCELADA",
        text: "Tu compra fue cancelada. Las entradas ya no son válidas.",
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

  async function handleDescargarPDF(orden: OrderItem) {
    setPdfLoading(orden.id);
    try {
      await generarComprobantePDF(orden);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No se pudo generar el comprobante. Intentá de nuevo.");
    } finally {
      setPdfLoading(null);
    }
  }

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

      {/* Título */}
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

      {/* Tabs */}
      <div className="flex border-b-2 border-text mb-6 gap-2 overflow-x-auto pb-0">
        {(
          [
            { id: "entradas",  label: "MIS ENTRADAS" },
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

      {/* MIS ENTRADAS */}
      {seccionActiva === "entradas" && (
        <>
          {loadingTickets ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-surface border-2 border-text w-full" />
              <div className="h-32 bg-surface border-2 border-text w-full" />
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
                        {ticketEventTitles[ticket.ticketType.eventId ?? ""] ?? ticket.eventTitle ?? ticket.ticketType.name}
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

      {/* HISTORIAL DE COMPRAS */}
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
              <div className="h-24 bg-surface border-2 border-text w-full" />
              <div className="h-24 bg-surface border-2 border-text w-full" />
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
                      {orderEventTitles[orden.id] && (
                        <p className="font-black text-sm uppercase tracking-tight text-text mb-2">
                          {orderEventTitles[orden.id]}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono bg-text text-surface px-2 py-0.5 font-bold text-[10px]">
                          {orden.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-text-soft text-xs font-mono font-bold">
                          {new Date(orden.createdAt).toLocaleDateString("es-AR", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className={`text-[10px] font-mono font-black uppercase border px-2 py-0.5 ${orderStatusColor(orden.status)}`}>
                          {orderStatusLabel(orden.status)}
                        </span>
                      </div>
                      <p className="text-text-soft text-xs font-mono mt-0.5">
                        Comisión plataforma: ${orden.platformFee.toLocaleString("es-AR")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-text/20 flex-wrap">
                      <div className="sm:text-right">
                        <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                          TOTAL ABONADO
                        </span>
                        <span className="font-black text-lg font-mono text-text">
                          ${orden.total.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {orden.status === "PAID" && (
                          <button
                            onClick={() => handleCancelOrder(orden.id)}
                            disabled={cancellingId === orden.id}
                            className="bg-red-600 text-white font-mono font-black text-xs uppercase tracking-wider transition-all border-2 border-text px-3 py-2 shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                          >
                            {cancellingId === orden.id ? "..." : "✕ Cancelar"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDescargarPDF(orden)}
                          disabled={orden.status !== "PAID" || pdfLoading === orden.id}
                          className="bg-primary text-background font-mono font-black text-xs uppercase tracking-wider transition-all border-2 border-text px-4 py-2 shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 min-w-[64px] flex items-center justify-center gap-1"
                        >
                          {pdfLoading === orden.id ? (
                            <>
                              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              ...
                            </>
                          ) : (
                            <>↓ PDF</>
                          )}
                        </button>
                      </div>
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
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-r-full border-r-4 border-y-4 border-black -ml-1" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-l-full border-l-4 border-y-4 border-black -mr-1" />

            <div className="border-b-4 border-black border-dashed pb-5 text-center">
              <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 uppercase font-black tracking-widest">
                PASES DIGITALES BOLETOCLICK
              </span>
              <h2 className="text-black font-black text-2xl uppercase tracking-tighter mt-4 leading-tight">
                {ticketEventTitles[ticketExpandido.ticketType.eventId ?? ""] ?? ticketExpandido.eventTitle ?? ticketExpandido.ticketType.name}
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
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>

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