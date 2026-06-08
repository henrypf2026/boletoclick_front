'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PaymentResultPage() {
const searchParams = useSearchParams();

const status = searchParams.get('status');

const sessionId = searchParams.get('session_id');

const isSuccess = status === 'success';

const [verified, setVerified] = useState(false);

const [checkingPayment, setCheckingPayment] = useState(true);

useEffect(() => {

  async function verifyPayment() {

    try {

      // Si el pago falló no consultamos el backend
      if (status !== 'success') {
        setVerified(false);
        setCheckingPayment(false);
        return;
      }

      // Si no existe sessionId
      if (!sessionId) {
        setVerified(false);
        setCheckingPayment(false);
        return;
      }

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/stripe/verify/${sessionId}`
);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setVerified(data.valid);

    } catch {

      setVerified(false);

    } finally {

      setCheckingPayment(false);

    }

  }

  verifyPayment();

}, [sessionId, status]);

if (!status || !['success', 'failed'].includes(status)) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      Ruta no válida
    </div>
  );
}

if (checkingPayment) {

  return (

    <div className="flex min-h-screen items-center justify-center">

      Verificando pago...

    </div>

  );

}

if (!checkingPayment && status === 'success' && !verified) {

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

              {isSuccess
                ? 'Compra realizada'
                : 'Pago no completado'}

            </h1>

            <p className="mt-3 text-text-soft">

              {isSuccess
                ? 'Tu compra fue procesada correctamente y tu ticket ya está disponible.'
                : 'Hubo un problema al procesar el pago.'}

            </p>

          </div>

          <div className="space-y-4 rounded-lg border border-border bg-background p-6">

            {isSuccess ? (
              <>
                <p>
                  ✅ Tu entrada fue generada correctamente.
                </p>

                <p>
                  📩 Recibirás información en tu correo.
                </p>

                <p>
                  🎫 Ya puedes revisar tus tickets.
                </p>
              </>
            ) : (
              <>
                <p>
                  ⚠️ El pago no pudo completarse.
                </p>

                <p>
                  Intenta nuevamente o utiliza otro método de pago.
                </p>
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
              <Link
                href="/mis-compras"
                className="rounded-lg bg-primary px-6 py-3 font-bold text-white"
              >
                Ver mis tickets
              </Link>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}