"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";
import Swal from "sweetalert2";
import Link from "next/link";


const TIMER_SECONDS = 10 * 60; // 10 minutos



function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authenticated, loading } = useAuth();


  const ticketTypeId = searchParams.get("ticketTypeId") ?? "";
  const ticketTypeName = searchParams.get("nombre") ?? "Entrada";
  const ticketTypeZone = searchParams.get("zona") ?? "";
  const ticketPrice = Number(searchParams.get("precio") ?? 0);
  const initialQuantity = Number(searchParams.get("cantidad") ?? 1);


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
    if (!ticketTypeId) {
      router.push("/eventos");
    }
  }, [ticketTypeId, router]);


  useEffect(() => {
    if (timerExpired) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
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
            customClass: {
              popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
              title: "uppercase font-black tracking-tighter",
              confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
            },
          }).then(() => router.push("/eventos"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerExpired, router]);

  
  const subtotal = ticketPrice * quantity;
  const totalFinal = Math.max(0, subtotal - discount);

  

  const handleApplyCoupon = async () => {
  if (!couponCode.trim()) return;

  try {
    const token = getToken();
    const res = await fetch(`/api/backend/coupons/validate/${couponCode.trim()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Cupón inválido, vencido o apagado.");

    const coupon = await res.json();

    // Calcular descuento según el tipo
    let descuento = 0;
    if (coupon.discountType === "PERCENTAGE") {
      descuento = Math.round(subtotal * (coupon.discountValue / 100));
    } else {
      descuento = coupon.discountValue;
    }

    setDiscount(descuento);
    setCouponApplied(true);
    setCouponId(coupon.id); // para mandarlo en el POST /orders

    Swal.fire({
      title: "CUPÓN APLICADO",
      text: coupon.discountType === "PERCENTAGE"
        ? `Descuento del ${coupon.discountValue}%: -$${descuento.toLocaleString("es-MX")}`
        : `Descuento fijo: -$${descuento.toLocaleString("es-MX")}`,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#6750e0",
      background: "#f5f4f0",
      color: "#171717",
      customClass: {
        popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
        title: "uppercase font-black tracking-tighter",
        confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
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
        popup: "border-4 border-[#171717] rounded-none shadow-[6px_6px_0px_0px_#171717] font-mono",
        title: "uppercase font-black tracking-tighter",
        confirmButton: "font-mono font-black uppercase tracking-wider border-2 border-[#171717] rounded-none",
      },
    });
  }
};

const handlePurchase = useCallback(async()=>{

if (!user || timerExpired) return;

setLoadingPurchase(true);

try{

const token=getToken();

const res=await fetch(
`${process.env.NEXT_PUBLIC_API_URL}/payments/create-session`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
ticketTypeId,
quantity,
couponId
})
}
);

if(!res.ok){
throw new Error();
}

const session=await res.json();

window.location.href=session.url;

}catch{

Swal.fire({
title:"ERROR",
text:"No se pudo iniciar el pago",
icon:"error"
});

}
finally{
setLoadingPurchase(false);
}

},[
ticketTypeId,
quantity,
couponId,
user,
timerExpired
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
      <div className={`border-4 p-4 mb-6 flex items-center justify-between shadow-[4px_4px_0px_0px_var(--color-text)] ${
        timerSeconds <= 60
          ? "border-red-500 bg-red-500/10"
          : timerSeconds <= 180
          ? "border-yellow-500 bg-yellow-400/10"
          : "border-text bg-surface"
      }`}>
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-text-soft">
            Tiempo restante para completar tu compra
          </p>
          <p className={`font-mono font-black text-3xl tracking-tighter ${
            timerSeconds <= 60 ? "text-red-500 animate-pulse" : "text-text"
          }`}>
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
              <p className="font-black uppercase text-sm tracking-tight">{ticketTypeName}</p>
              {ticketTypeZone && (
                <p className="text-text-soft text-[11px] font-mono uppercase mt-0.5">
                  Sector: {ticketTypeZone}
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
              <span className="text-success">${totalFinal.toLocaleString("es-MX")}</span>
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