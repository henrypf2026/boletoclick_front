"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";
import Swal from "sweetalert2";
import jsPDF from "jspdf";



type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface Order {
  id: string;
  total: number;
  producerSubtotal: number;
  platformFee: number;
  status: OrderStatus;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  tickets?: { id: string }[];
}

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "PAID":      return "PAGADO";
    case "PENDING":   return "PENDIENTE";
    case "FAILED":    return "FALLIDO";
    case "REFUNDED":  return "REEMBOLSADO";
  }
}

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "PAID":      return "text-success bg-success/10 border-success";
    case "PENDING":   return "text-yellow-600 bg-yellow-400/10 border-yellow-500";
    case "FAILED":    return "text-red-500 bg-red-500/10 border-red-500";
    case "REFUNDED":  return "text-text-soft bg-surface-2 border-text/30";
  }
}

// Generador de PDF 
function generarComprobantePDF(orden: Order) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const margen = 20;
  const ancho  = doc.internal.pageSize.getWidth();   // 210 mm
  let   y      = margen;

 
  const linea = (grosor = 0.3) => {
    doc.setLineWidth(grosor);
    doc.line(margen, y, ancho - margen, y);
    y += 4;
  };

  const texto = (
    contenido: string,
    opciones: { size?: number; bold?: boolean; color?: string; align?: "left" | "center" | "right" } = {}
  ) => {
    const { size = 10, bold = false, color = "#171717", align = "left" } = opciones;
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(color);
    const x =
      align === "center" ? ancho / 2 :
      align === "right"  ? ancho - margen :
      margen;
    doc.text(contenido, x, y, { align });
    y += size * 0.5;   
  };

  const par = (etiqueta: string, valor: string) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#555555");
    doc.text(etiqueta.toUpperCase(), margen, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor("#171717");
    doc.text(valor, ancho - margen, y, { align: "right" });
    y += 6;
  };

 
  doc.setFillColor("#171717");
  doc.rect(0, 0, ancho, 28, "F");

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#ffffff");
  doc.text("COMPROBANTE DE PAGO", margen, 17);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#aaaaaa");
  doc.text("Plataforma de Tickets", ancho - margen, 17, { align: "right" });

  y = 38;
  
  texto("Orden N°", { size: 8, color: "#888888" });
  texto(orden.id.toUpperCase(), { size: 14, bold: true });
  y += 2;
  linea(0.5);


  texto("Detalle de la transacción", { size: 11, bold: true });
  y += 2;

  par("Fecha de compra", new Date(orden.createdAt).toLocaleDateString("es-AR", {
    day: "numeric", month: "long", year: "numeric",
  }));
  par("Hora", new Date(orden.createdAt).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit",
  }));
  par("Estado", statusLabel(orden.status));

  if (orden.transactionId) {
    par("ID de transacción", orden.transactionId);
  }

  y += 2;
  linea();


  if (orden.tickets && orden.tickets.length > 0) {
    texto("Entradas incluidas", { size: 11, bold: true });
    y += 2;

    orden.tickets.forEach((ticket, i) => {
      par(`Entrada ${i + 1}`, ticket.id.slice(0, 12).toUpperCase() + "...");
    });

    y += 2;
    linea();
  }

  texto("Resumen de pago", { size: 11, bold: true });
  y += 2;

  const formatPeso = (n: number) =>
    "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2 });

  par("Subtotal productor",  formatPeso(orden.producerSubtotal));
  par("Comisión plataforma", formatPeso(orden.platformFee));

  y += 1;
  doc.setLineWidth(0.8);
  doc.line(margen, y, ancho - margen, y);
  y += 5;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#171717");
  doc.text("TOTAL ABONADO", margen, y);
  doc.text(formatPeso(orden.total), ancho - margen, y, { align: "right" });
  y += 10;

  linea();

  texto("Este comprobante es válido como constancia de pago.", { size: 8, color: "#888888", align: "center" });
  texto("Guardalo para futuros reclamos o devoluciones.", { size: 8, color: "#888888", align: "center" });

 
  doc.save(`comprobante-${orden.id.slice(0, 8).toUpperCase()}.pdf`);
}



export default function MisComprasPage() {
  const { user } = useAuth();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!user) return;
    const token = getToken();

    fetch("/api/backend/orders/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
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
          customClass: {
            popup:
              "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
            title: "uppercase font-black tracking-tighter",
            confirmButton:
              "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
          },
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const ordenesFiltradas = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.id.toLowerCase().includes(busqueda.toLowerCase()) ||
          statusLabel(o.status).toLowerCase().includes(busqueda.toLowerCase())
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
              <div className="border-b-2 border-text px-5 py-3 flex items-center justify-between gap-2 flex-wrap bg-background/40">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono bg-text text-surface px-2 py-0.5 font-bold text-[10px] whitespace-nowrap">
                    {orden.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-text-soft text-[11px] font-mono font-bold">
                    {new Date(orden.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-black uppercase border px-2 py-0.5 whitespace-nowrap ${statusStyle(orden.status)}`}
                >
                  {statusLabel(orden.status)}
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-background border border-text/20 p-2.5">
                    <span className="text-text-soft text-[9px] block uppercase font-mono font-bold mb-0.5">
                      Entradas
                    </span>
                    <span className="font-black text-sm font-mono">
                      {orden.tickets?.length ?? "—"}x
                    </span>
                  </div>
                  <div className="bg-background border border-text/20 p-2.5">
                    <span className="text-text-soft text-[9px] block uppercase font-mono font-bold mb-0.5">
                      Comisión
                    </span>
                    <span className="font-black text-sm font-mono">
                      ${orden.platformFee.toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>

                {/* Total + botón PDF */}
                <div className="flex items-center justify-between border-t-2 border-dashed border-text/30 pt-4 gap-4">
                  <div>
                    <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                      Total abonado
                    </span>
                    <span className="font-black text-xl font-mono text-text">
                      ${orden.total.toLocaleString("es-MX")}
                    </span>
                  </div>

                  {/* Solo habilitado si el pago fue exitoso */}
                  <button
                    onClick={() => generarComprobantePDF(orden)}
                    disabled={orden.status !== "PAID"}
                    className="flex items-center gap-2 bg-primary text-background font-mono font-black text-xs uppercase tracking-wider border-2 border-text px-4 py-2.5 shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                  >
                    ↓ Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Resumen total */}
          <div className="mt-2 bg-surface border-2 border-text p-4 shadow-[3px_3px_0px_0px_var(--color-text)] flex items-center justify-between">
            <div>
              <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                {ordenesFiltradas.length} compra{ordenesFiltradas.length > 1 ? "s" : ""}
              </span>
              <span className="font-black text-lg font-mono text-text">
                Total: $
                {ordenesFiltradas
                  .reduce((acc, o) => acc + o.total, 0)
                  .toLocaleString("es-MX")}
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