"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";
import { savePendingPurchase } from "@/lib/pendingPurchase";
import { checkoutService } from "@/services/checkoutService";
import type { Event, Zone } from "@/mocks/events";
import Swal from "sweetalert2";
import Link from "next/link";

const TIMER_SECONDS = 10 * 60; // 10 minutos

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authenticated, loading } = useAuth();

  const ticketTypeId = searchParams.get("ticketTypeId") ?? "";
  const eventId = searchParams.get("eventId") ?? "";
  const ticketTypeName = searchParams.get("nombre") ?? "Entrada";
  const ticketTypeZone =
    searchParams.get("tribuna") ?? searchParams.get("zona") ?? "";
  const ticketTypeLabel = searchParams.get("tipo") ?? ticketTypeName;
  const ticketPrice = Number(searchParams.get("precio") ?? 0);
  const initialQuantity = Number(searchParams.get("cantidad") ?? 1);
  const venue = searchParams.get("venue") ?? "";
  const city = searchParams.get("city") ?? "";
  const address = searchParams.get("address") ?? undefined;
  const eventDate = searchParams.get("date") ?? "";
  const eventTime = searchParams.get("time") ?? "";
  const lat = Number(searchParams.get("lat") ?? 0);
  const lng = Number(searchParams.get("lng") ?? 0);

  const [quantity] = useState(initialQuantity);
  const [timerSeconds, setTimerSeconds] = useState(TIMER_SECONDS);
  const [timerExpired, setTimerExpired] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponId, setCouponId] = useState<string | undefined>(undefined);
  const [discount, setDiscount] = useState(0);
  const [loadingPurchase, setLoadingPurchase] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!authenticated) {
      router.push(`/login?from=/checkout?ticketTypeId=${ticketTypeId}`);
    }
  }, [authenticated, loading, router, ticketTypeId]);

  useEffect(() => {
    if (!ticketTypeId || !eventId) {
      router.push("/eventos");
    }
  }, [ticketTypeId, eventId, router]);

  // Usamos localStorage para persistir `sessionId` y `expiresAt` por ticketType
  useEffect(() => {
    if (!ticketTypeId || timerExpired) return;

    const storageKey = `checkoutSession_${ticketTypeId}`;

    // Si hay una sesión guardada, usamos su expiresAt como referencia
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(storageKey)
        : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          sessionId?: string;
          expiresAt?: string;
        };
        if (parsed?.expiresAt) {
          const remaining = Math.floor(
            (new Date(parsed.expiresAt).getTime() - Date.now()) / 1000,
          );
          if (remaining <= 0) {
            if (typeof window !== "undefined")
              window.localStorage.removeItem(storageKey);
            setTimerExpired(true);
            Swal.fire({
              title: "TIEMPO AGOTADO",
              text: "Tu reserva expiró. Volvé a seleccionar las entradas.",
              icon: "warning",
              confirmButtonText: "VOLVER A EVENTOS",
              confirmButtonColor: "#6750e0",
              background: "#f5f4f0",
              color: "#171717",
              allowOutsideClick: false,
            }).then(() => router.push("/eventos"));
            return;
          }
          setTimerSeconds(remaining);
        }
      } catch {
        if (typeof window !== "undefined")
          window.localStorage.removeItem(storageKey);
      }
    }

    const interval = setInterval(() => {
      // Recalcular cada segundo a partir de expiresAt (si existe)
      const s =
        typeof window !== "undefined"
          ? window.localStorage.getItem(storageKey)
          : null;
      if (!s) return;
      try {
        const p = JSON.parse(s) as { expiresAt?: string };
        if (!p?.expiresAt) return;
        const remaining = Math.floor(
          (new Date(p.expiresAt).getTime() - Date.now()) / 1000,
        );
        setTimerSeconds(Math.max(0, remaining));
        if (remaining <= 0) {
          clearInterval(interval);
          if (typeof window !== "undefined")
            window.localStorage.removeItem(storageKey);
          setTimerExpired(true);
          Swal.fire({
            title: "TIEMPO AGOTADO",
            text: "Tu reserva expiró. Volvé a seleccionar las entradas.",
            icon: "warning",
            confirmButtonText: "VOLVER A EVENTOS",
            confirmButtonColor: "#6750e0",
            background: "#f5f4f0",
            color: "#171717",
            allowOutsideClick: false,
          }).then(() => router.push("/eventos"));
        }
      } catch {
        // ignore parse errors
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ticketTypeId, timerExpired, router]);

  const subtotal = ticketPrice * quantity;
  const totalFinal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const coupon = await checkoutService.validateCoupon(couponCode.trim());

      // Calcular descuento según el tipo
      let descuento = 0;
      if (coupon.discountType === "PERCENTAGE") {
        descuento = Math.round(subtotal * (coupon.discountValue / 100));
      } else {
        descuento = coupon.discountValue;
      }

      setDiscount(descuento);
      setCouponApplied(true);
      setCouponId(coupon.id);

      Swal.fire({
        title: "CUPÓN APLICADO",
        text:
          coupon.discountType === "PERCENTAGE"
            ? `Descuento del ${coupon.discountValue}%: -$${descuento.toLocaleString("es-MX")}`
            : `Descuento fijo: -$${descuento.toLocaleString("es-MX")}`,
        icon: "success",
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
    } catch {
      Swal.fire({
        title: "CUPÓN INVÁLIDO",
        text: "El código ingresado no es válido, está vencido o ya fue usado.",
        icon: "error",
        confirmButtonText: "REINTENTAR",
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
    }
  };

  const handlePurchase = useCallback(async () => {
    if (!user || timerExpired) return;

    setLoadingPurchase(true);

    try {
      const token = getToken();

      const checkoutEvent: Event = {
        id: eventId,
        title: ticketTypeName,
        subtitle: "",
        category: "otros",
        teamId: "all",
        venue,
        city,
        address,
        coordinates: { lat: lat || 19.4326, lng: lng || -99.1332 },
        country: null,
        date: eventDate,
        time: eventTime,
        priceFrom: ticketPrice,
        featured: false,
        badge: null,
        imageGradient: "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)",
        zones: [],
      };

      const checkoutZone: Zone = {
        id: ticketTypeId,
        ticketTypeId,
        name: ticketTypeLabel,
        zone: ticketTypeZone || ticketTypeLabel,
        price: ticketPrice,
        available: initialQuantity,
      };

      savePendingPurchase({
        userId: user.id,
        event: checkoutEvent,
        zone: checkoutZone,
        quantity,
        total: totalFinal,
      });

      const res = await fetch("/api/backend/payments/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketTypeId,
          quantity,
          ...(couponId ? { couponId } : {}),
        }),
      });

      const session = await res.json().catch(() => null);

      if (!res.ok) {
        const message = session?.message;
        const detail =
          typeof message === "string"
            ? message
            : Array.isArray(message)
              ? message.join(". ")
              : "No se pudo iniciar el pago";
        throw new Error(detail);
      }

      if (!session?.url) {
        throw new Error("Stripe no devolvió una URL de pago");
      }

      // Guardar sessionId y expiresAt para sobrevivir refresh y usar el countdown del server
      try {
        if (typeof window !== "undefined") {
          const storageKey = `checkoutSession_${ticketTypeId}`;
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({
              sessionId: session.sessionId,
              expiresAt: session.expiresAt,
            }),
          );
        }
      } catch {
        // no bloquear por errores de storage
      }

      window.location.href = session.url;
    } catch (error) {
      Swal.fire({
        title: "ERROR",
        text:
          error instanceof Error ? error.message : "No se pudo iniciar el pago",
        icon: "error",
      });
    } finally {
      setLoadingPurchase(false);
    }
  }, [
    user,
    timerExpired,
    eventId,
    ticketTypeName,
    venue,
    city,
    address,
    lat,
    lng,
    eventDate,
    eventTime,
    ticketTypeId,
    ticketTypeLabel,
    ticketTypeZone,
    ticketPrice,
    initialQuantity,
    quantity,
    totalFinal,
    couponId,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Verificando sesión...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen bg-background text-text transition-colors">
      {/* Header */}
      <div className="mb-8 border-b-4 border-text pb-4">
        <Link
          href="/eventos"
          className="font-mono text-[11px] font-black uppercase tracking-widest text-text-soft hover:text-text transition-colors mb-2 block"
        >
          ← Volver a eventos
        </Link>
        <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
          Checkout
        </h1>
        <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
          Confirmá tu compra antes de que expire el tiempo
        </p>
      </div>

      {/* Temporizador */}
      <div
        className={`border-4 p-4 mb-6 flex items-center justify-between shadow-[4px_4px_0px_0px_var(--color-text)] ${
          timerSeconds <= 60
            ? "border-red-500 bg-red-500/10"
            : timerSeconds <= 180
              ? "border-yellow-500 bg-yellow-400/10"
              : "border-text bg-surface"
        }`}
      >
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-text-soft">
            Tiempo restante para completar tu compra
          </p>
          <p
            className={`font-mono font-black text-3xl tracking-tighter ${
              timerSeconds <= 60 ? "text-red-500 animate-pulse" : "text-text"
            }`}
          >
            {formatTime(timerSeconds)}
          </p>
        </div>
        <div className="text-4xl">
          {timerSeconds <= 60 ? "🚨" : timerSeconds <= 180 ? "⚠️" : "⏱️"}
        </div>
      </div>

      {/* Resumen de la compra */}
      <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)] mb-6">
        <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
          🎟️ Resumen de compra
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-black uppercase text-sm tracking-tight">
                {ticketTypeName}
              </p>
              {ticketTypeZone && (
                <p className="text-text-soft text-[11px] font-mono uppercase mt-0.5">
                  Sector: {ticketTypeZone} · {ticketTypeLabel}
                </p>
              )}
            </div>
            <span className="font-mono font-black text-sm">
              ${ticketPrice.toLocaleString("es-MX")} x {quantity}
            </span>
          </div>

          <div className="border-t border-text/20 pt-3 space-y-2">
            <div className="flex justify-between text-xs font-mono text-text-soft">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-MX")}</span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-xs font-mono text-success">
                <span>Descuento cupón</span>
                <span>-${discount.toLocaleString("es-MX")}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg font-mono border-t-2 border-text pt-2">
              <span>TOTAL</span>
              <span className="text-success">
                ${totalFinal.toLocaleString("es-MX")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)] mb-6">
        <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
          🏷️ Código de descuento
        </h2>

        {couponApplied ? (
          <div className="flex items-center gap-3 p-3 border-2 border-success bg-success/10">
            <span className="text-success font-black text-sm">✔</span>
            <div>
              <p className="font-black uppercase text-sm text-success tracking-tight">
                {couponCode.toUpperCase()} aplicado
              </p>
              <p className="text-[11px] font-mono text-text-soft">
                Descuento: -${discount.toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="INGRESÁ TU CÓDIGO"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 bg-background border-2 border-text px-4 py-2.5 font-mono text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim()}
              className="bg-surface-2 border-2 border-text font-mono font-black px-4 py-2.5 text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handlePurchase}
        disabled={loadingPurchase || timerExpired}
        className="w-full bg-primary text-background border-4 border-text font-mono font-black py-4 text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
      >
        {loadingPurchase
          ? "[ PROCESANDO... ]"
          : timerExpired
            ? "[ TIEMPO AGOTADO ]"
            : `Confirmar compra · $${totalFinal.toLocaleString("es-MX")}`}
      </button>

      <p className="text-center font-mono text-[10px] text-text-soft uppercase tracking-wide mt-4">
        Al confirmar aceptás los términos y condiciones de BoletoClick
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-text-soft">Cargando...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
