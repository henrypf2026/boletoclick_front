'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Button, Card } from 'flowbite-react';
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
      <div className="min-h-dvh bg-gray-950 -mx-4 -my-8 flex items-center justify-center">
        <p className="text-gray-400">
          Debes{' '}
          <Link href="/login" className="text-green-400 hover:underline">
            iniciar sesión
          </Link>{' '}
          para ver tus entradas.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-950 -mx-4 -my-8 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis entradas</h1>
            <p className="text-gray-400">Tus boletos con código QR listos para el acceso al evento.</p>
          </div>
          <Button as={Link} href="/" className="w-full bg-brand text-gray-950 hover:bg-brand-dark md:w-auto">
            Buscar más eventos
          </Button>
        </div>

        {!tickets.length ? (
          <Card className="border-gray-800 bg-gray-900 text-center">
            <p className="text-gray-400">Aún no tienes entradas compradas.</p>
            <Link href="/" className="mt-3 inline-block text-green-400 hover:underline">
              Explorar eventos disponibles
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const date = formatEventDate(ticket.date, ticket.time);
              return (
                <Card key={ticket.id} className="border-gray-800 bg-gray-900">
                  <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                    <div className="text-center md:text-left">
                      <h2 className="text-lg font-bold text-white">{ticket.eventTitle}</h2>
                      <p className="text-sm text-gray-400">{ticket.venue}</p>
                      <p className="text-sm text-gray-400">{date.full} · {date.time} hs</p>
                      <p className="text-sm text-gray-400">{ticket.zone} · {ticket.quantity} boleto(s)</p>
                      <strong className="mt-2 inline-block text-green-400">{formatPrice(ticket.total)}</strong>
                    </div>
                    <div className="text-center">
                      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-green-400 p-2 text-xs font-bold text-green-400">
                        {ticket.qrCode}
                      </div>
                      <span className="mt-2 block max-w-[140px] text-xs text-gray-400">
                        Presenta este QR en el acceso
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
