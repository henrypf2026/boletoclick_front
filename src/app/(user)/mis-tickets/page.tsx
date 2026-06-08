'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatEventDate, formatPrice } from '@/mocks/events';
import { getTicketsByUser } from '@/lib/auth';

export default function MisTicketsPage() {
  const { user } = useAuth();

  const tickets = useMemo(
    () => (user ? getTicketsByUser(user.id).slice().reverse() : []),
    [user],
  );

  if (!user) {
    return (
      <div className="min-h-dvh -mx-4 -my-8 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm font-bold text-text-soft">
            Tenés que{' '}
            <Link href="/login" className="text-primary hover:underline">
              iniciar sesión
            </Link>{' '}
            para ver tus entradas. HOLA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh -mx-4 -my-8 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-accent">
              ↗ Tu historial
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-text md:text-3xl">
              Mis entradas
            </h1>
            <p className="mt-1 text-sm text-text-soft">
              Tus boletos con código QR listos para el acceso al evento.
            </p>
          </div>
          <Link
            href="/eventos"
            className="inline-flex h-10 items-center border-4 border-border bg-primary px-5 text-sm font-black uppercase tracking-wider text-background shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(23,23,23,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] md:w-auto"
          >
            Buscar más eventos
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="border-4 border-dashed border-border bg-surface p-12 text-center">
            <p className="text-sm font-black uppercase tracking-wide text-text-soft">
              Aún no tenés entradas compradas.
            </p>
            <Link
              href="/eventos"
              className="mt-4 inline-block text-sm font-black uppercase tracking-wider text-primary hover:underline"
            >
              Explorar eventos disponibles →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((ticket) => {
              const date = formatEventDate(ticket.date, ticket.time);
              return (
                <div
                  key={ticket.id}
                  className="border-4 border-border bg-surface shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-lg font-black uppercase tracking-tight text-text">
                        {ticket.eventTitle}
                      </h2>
                      <p className="text-sm text-text-soft">{ticket.venue}</p>
                      <p className="text-sm text-text-soft">
                        {date.full} · {date.time} hs
                      </p>
                      <p className="text-sm text-text-soft">
                        {ticket.zone} · {ticket.quantity} boleto(s)
                      </p>
                      <strong className="mt-1 text-lg font-black text-success">
                        {formatPrice(ticket.total)}
                      </strong>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-28 w-28 items-center justify-center border-4 border-border bg-background p-2 font-mono text-xs font-black text-text shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                        {ticket.qrCode}
                      </div>
                      <span className="max-w-[140px] text-center text-[11px] font-bold uppercase tracking-wide text-text-soft">
                        Presentá este QR en el acceso
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
