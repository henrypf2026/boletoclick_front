"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";
import {
  clearPendingPurchase,
  readPendingPurchase,
} from "@/lib/pendingPurchase";
import { ticketService } from "@/services/ticketService";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  const isSuccess = status === "success";

  const [verified, setVerified] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrReady, setQrReady] = useState(false);

 useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  async function verifyPayment() {
    // 1. Validaciones iniciales tempranas
    if (status !== "success") {
      setVerified(false);
      setCheckingPayment(false);
      return;
    }

    // 2. Resolver el sessionId (Parámetro o Fallback de localStorage)
    let sessionToVerify = sessionId;
    
    if (!sessionToVerify && typeof window !== "undefined") {
      const fallbackKey = Object.keys(window.localStorage).find((k) =>
        k.startsWith("checkoutSession_"),
      );
      if (fallbackKey) {
        try {
          const stored = JSON.parse(window.localStorage.getItem(fallbackKey) || "{}");
          if (stored?.sessionId) sessionToVerify = stored.sessionId;
        } catch {
          // Ignorar errores de parseo
        }
      }
    }

    // Si después del fallback no hay sesión, salir
    if (!sessionToVerify) {
      setVerified(false);
      setCheckingPayment(false);
      return;
    }

    // 3. Configuración del ciclo de reintentos (Polling)
    const maxAttempts = 8;
    let attempt = 0;
    let valid = false;

    while (attempt < maxAttempts && !valid) {
      // IMPORTANTE: Si React canceló este efecto, detenemos el bucle inmediatamente
      if (signal.aborted) return;

      try {
        const token = getToken();
        const response = await fetch(
          `/api/backend/payments/verify/${sessionToVerify}`,
          {
            signal, // 🔴 Conectado para cancelar peticiones en vuelo
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          valid = data.valid === true;
          if (valid) {
            setVerified(true);
            break; // Rompe el ciclo si ya es válido
          }
        }
      } catch (error) {
        // Si el error fue provocado por el aborto manual, salimos silenciosamente
        if (error.name === 'AbortError') return;
        // Otros errores (red, 500, etc) se ignoran para permitir el reintento
      }

      attempt += 1;
      
      if (attempt < maxAttempts && !valid) {
        try {
          // Esperar 1 segundo antes del próximo intento (sensible al aborto)
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, 1000);
            signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
        } catch {
          return; // Salir si se abortó durante la espera
        }
      }
    }

    // 4. Estados finales del procesamiento
    if (!signal.aborted) {
      setVerified(valid);
      setCheckingPayment(false);

      // Limpieza de localStorage si fallaron todos los intentos
      if (!valid && typeof window !== "undefined") {
        Object.keys(window.localStorage).forEach((k) => {
          if (k.startsWith("checkoutSession_")) {
            window.localStorage.removeItem(k);
          }
        });
      }
    }
  }

  verifyPayment();

  // Limpieza de React: Cancela peticiones en vuelo y activa signal.aborted
  return () => controller.abort();
}, [sessionId, status]);


  useEffect(() => {
    if (!verified || !user || qrReady) return;

    const pending = readPendingPurchase();
    if (!pending) {
      setQrReady(true);
      return;
    }

    let active = true;
    setGeneratingQr(true);

    ticketService
      .generateQrAfterPayment(user.id, pending)
      .then(() => {
        if (!active) return;
        clearPendingPurchase();
        // limpiar localStorage de la sesión del checkout
        if (typeof window !== "undefined") {
          Object.keys(window.localStorage).forEach((k) => {
            if (k.startsWith("checkoutSession_"))
              window.localStorage.removeItem(k);
          });
        }
        setQrReady(true);
      })
      .catch(() => {
        if (!active) return;
        // limpiar por si quedó algo pendiente
        if (typeof window !== "undefined") {
          Object.keys(window.localStorage).forEach((k) => {
            if (k.startsWith("checkoutSession_"))
              window.localStorage.removeItem(k);
          });
        }
        setQrReady(true);
      })
      .finally(() => {
        if (active) setGeneratingQr(false);
      });

    return () => {
      active = false;
    };
  }, [verified, user, qrReady]);

  if (!status || !["success", "failed"].includes(status)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Ruta no válida
      </div>
    );
  }

  if (checkingPayment || generatingQr) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {checkingPayment ? "Verificando pago..." : "Generando tu QR..."}
      </div>
    );
  }

  if (!checkingPayment && status === "success" && !verified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Pago no válido
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border-4 border-border bg-surface p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mb-8 flex justify-center">
              {isSuccess ? (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                  <svg
                    className="h-12 w-12 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-red-400/40 bg-red-100 dark:bg-red-900/20">
                  <svg
                    className="h-12 w-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-black uppercase tracking-tight text-text">
              {isSuccess ? "Compra realizada" : "Pago no completado"}
            </h1>

            <p className="mt-3 text-text-soft">
              {isSuccess
                ? "Tu pago fue confirmado. Tu QR ya está disponible en Mis Entradas."
                : "Hubo un problema al procesar el pago."}
            </p>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-background p-6">
            {isSuccess ? (
              <>
                <p>✅ Pago verificado correctamente.</p>
                <p>🎫 Tu código QR fue generado.</p>
                <p>📱 Presentalo desde Mis Entradas al ingresar al evento.</p>
              </>
            ) : (
              <>
                <p>⚠️ El pago no pudo completarse.</p>
                <p>Intentá de nuevo o usá otro método de pago.</p>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/eventos"
              className="rounded-lg border border-border px-6 py-3 font-bold"
            >
              Volver a eventos
            </Link>

            {isSuccess && (
              <button
                type="button"
                onClick={() => router.push("/mis-tickets")}
                className="rounded-lg bg-primary px-6 py-3 font-bold text-white"
              >
                Ver mis tickets
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Cargando...</p>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
