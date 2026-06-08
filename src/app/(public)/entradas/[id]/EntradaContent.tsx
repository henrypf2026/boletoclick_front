'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  createTicketQrUrl,
  decodeTicketFromStorage,
  decodeTicketQrData,
  type TicketQrData,
} from '@/lib/ticketQr';
import { formatEventDate, formatPrice } from '@/mocks/events';
import { eventService } from '@/services/eventService';
import TicketQrCode from '@/components/ui/TicketQrCode';
import EventMap from '@/components/ui/EventMap';

function resolveTicket(encoded: string | null, ticketId: string): TicketQrData | null {
  if (encoded) {
    const decoded = decodeTicketQrData(encoded);
    if (decoded?.id === ticketId) return decoded;
  }
  return decodeTicketFromStorage(ticketId);
}

export default function EntradaContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const ticketId = params.id as string;
  const encoded = searchParams.get('d');

  const [ticket, setTicket] = useState<TicketQrData | null>(null);
  const [scanUrl, setScanUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolved = resolveTicket(encoded, ticketId);
    setTicket(resolved);
    setLoading(false);
  }, [encoded, ticketId]);

  useEffect(() => {
    if (!ticket) return;

    setScanUrl(createTicketQrUrl(window.location.origin, ticket));

    if (ticket.coordinates) return;

    let active = true;
    eventService.getEventById(ticket.eventId).then((event) => {
      if (!active || !event) return;
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              city: event.city,
              address: event.address,
              coordinates: event.coordinates,
            }
          : null,
      );
    });

    return () => {
      active = false;
    };
  }, [ticket?.id, ticket?.eventId, ticket?.coordinates]);

  if (loading) {
    return (
      <div className="min-h-dvh -mx-4 -my-8 flex items-center justify-center px-4">
        <p className="text-sm font-bold text-text-soft">Cargando entrada…</p>
      </div>
    );
  }

  if (!ticket || ticket.id !== ticketId) {
    return (
      <div className="min-h-dvh -mx-4 -my-8 flex items-center justify-center px-4">
        <div className="max-w-md border-4 border-border bg-surface p-8 text-center shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <p className="text-sm font-black uppercase tracking-wide text-text">
            Entrada no válida
          </p>
          <p className="mt-2 text-sm text-text-soft">
            El código QR no contiene información de entrada válida o está incompleto.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-black uppercase tracking-wider text-primary hover:underline"
          >
            Volver al inicio →
          </Link>
        </div>
      </div>
    );
  }

  const date = formatEventDate(ticket.date, ticket.time);

  const detailRows = [
    { label: 'Recinto', value: ticket.venue },
    ...(ticket.address ? [{ label: 'Dirección', value: ticket.address }] : []),
    ...(ticket.city ? [{ label: 'Ciudad', value: ticket.city }] : []),
    { label: 'Fecha', value: date.full },
    { label: 'Horario', value: `${date.time} hs` },
    { label: 'Zona', value: ticket.zone },
    { label: 'Entradas', value: String(ticket.quantity) },
    { label: 'Total pagado', value: formatPrice(ticket.total) },
    { label: 'Código', value: ticket.id.slice(0, 8).toUpperCase() },
  ];

  return (
    <div className="min-h-dvh -mx-4 -my-8 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-accent">
          ↗ BoletoClick · Entrada verificada
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-text md:text-3xl">
          {ticket.eventTitle}
        </h1>

        <div className="mt-6 border-4 border-border bg-surface p-6 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <ul className="flex flex-col gap-3 text-sm">
            {detailRows.map(({ label, value }) => (
              <li key={label} className="flex gap-2">
                <span className="w-28 shrink-0 font-black uppercase tracking-wide text-text">
                  {label}:
                </span>
                <span className="text-text-soft">{value}</span>
              </li>
            ))}
          </ul>

          {ticket.coordinates && (
            <div className="mt-8">
              <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-text-soft">
                Ubicación del recinto
              </h2>
              <div className="border-2 border-border overflow-hidden">
                <EventMap
                  coordinates={ticket.coordinates}
                  venue={ticket.venue}
                  city={ticket.city ?? ''}
                  address={ticket.address}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-2 border-t-2 border-border pt-6">
            <div className="border-4 border-border bg-background p-2">
              {scanUrl ? (
                <TicketQrCode value={scanUrl} size={128} />
              ) : (
                <div
                  className="animate-pulse bg-surface-2"
                  style={{ width: 128, height: 128 }}
                />
              )}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-text-soft">
              Presentá este QR en el acceso
            </span>
          </div>
        </div>

        <Link
          href="/mis-tickets"
          className="mt-6 inline-block text-sm font-black uppercase tracking-wider text-primary hover:underline"
        >
          ← Regresar a mis entradas
        </Link>
      </div>
    </div>
  );
}
