'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { decodeTicketQrData } from '@/lib/ticketQr';
import { formatEventDate, formatPrice } from '@/mocks/events';
import { eventService } from '@/services/eventService';
import { getStoredTicketById } from '@/services/ticketService';
import EventMap from '@/components/ui/EventMap';
import { getDirectionsUrl, normalizeCoordinates } from '@/lib/geo/mapbox';
import type { TicketQrData } from '@/lib/ticketQr';

interface EntradaContentProps {
  ticketId: string;
  encoded: string | null;
}

function readEncodedFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('d');
}

function withNormalizedCoords(ticket: TicketQrData): TicketQrData {
  const coordinates = normalizeCoordinates(ticket.coordinates);
  return coordinates ? { ...ticket, coordinates } : ticket;
}

function resolveTicket(encoded: string | null, ticketId: string): TicketQrData | null {
  if (encoded) {
    const decoded = decodeTicketQrData(encoded);
    if (decoded && decoded.id === ticketId) return withNormalizedCoords(decoded);
  }

  const stored = getStoredTicketById(ticketId);
  if (stored) return withNormalizedCoords(stored);

  return null;
}

export default function EntradaContent({ ticketId, encoded: encodedFromServer }: EntradaContentProps) {
  const encoded = useMemo(
    () => encodedFromServer ?? readEncodedFromUrl(),
    [encodedFromServer],
  );

  const [ticket, setTicket] = useState<TicketQrData | null>(() =>
    resolveTicket(encoded, ticketId),
  );
  const [loadingMap, setLoadingMap] = useState(true);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const token = encoded ?? readEncodedFromUrl();
    setTicket(resolveTicket(token, ticketId));
  }, [encoded, ticketId]);

  useEffect(() => {
    const check = () => {
      authenticatedFetch('/api/backend/tickets/me', { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : []))
        .then((tickets: { id: string; allowEntrance: boolean }[]) => {
          const found = tickets.find((t) => t.id === ticketId);
          if (found && !found.allowEntrance) setCancelled(true);
        })
        .catch(() => {});
    };

    check();

    const onVisible = () => { if (!document.hidden) check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [ticketId]);

  useEffect(() => {
    if (!ticket) return;

    let active = true;
    setLoadingMap(true);

    eventService.getEventById(ticket.eventId).then((event) => {
      if (!active) return;
      if (event) {
        setTicket((prev) =>
          prev
            ? withNormalizedCoords({
                ...prev,
                city: event.city || prev.city,
                address: event.address || prev.address,
                coordinates: prev.coordinates ?? event.coordinates,
                venue: event.venue || prev.venue,
              })
            : null,
        );
      }
      setLoadingMap(false);
    }).catch(() => {
      if (active) setLoadingMap(false);
    });

    return () => {
      active = false;
    };
  }, [ticket?.id, ticket?.eventId]);

  if (!ticket) {
    return (
      <div className="min-h-dvh -mx-4 -my-8 flex items-center justify-center px-4">
        <div className="max-w-md border-4 border-border bg-surface p-8 text-center shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <p className="text-sm font-black uppercase tracking-wide text-text">
            Entrada no válida
          </p>
          <p className="mt-2 text-xs text-text-soft">
            El enlace puede estar incompleto. Volvé a escanear el QR desde Mis Entradas.
          </p>
          <Link href="/mis-tickets" className="mt-6 inline-block text-sm font-black uppercase tracking-wider text-primary hover:underline">
            ← Regresar a mis entradas
          </Link>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-dvh -mx-4 -my-8 flex items-center justify-center px-4">
        <div className="max-w-md border-4 border-red-500 bg-surface p-8 text-center shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
          <p className="text-sm font-black uppercase tracking-wide text-red-500">
            Entrada cancelada
          </p>
          <p className="mt-2 text-xs text-text-soft">
            El evento fue cancelado. Esta entrada ya no es válida.
          </p>
          <Link href="/mis-tickets" className="mt-6 inline-block text-sm font-black uppercase tracking-wider text-primary hover:underline">
            ← Regresar a mis entradas
          </Link>
        </div>
      </div>
    );
  }

  const date = formatEventDate(ticket.date, ticket.time);
  const coordinates = normalizeCoordinates(ticket.coordinates);
  const directionsLabel = [ticket.venue, ticket.address, ticket.city].filter(Boolean).join(', ');

  return (
    <div className="min-h-dvh -mx-4 -my-8 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <span className="inline-block border-2 border-border bg-surface-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-text-soft">
          Entrada verificada
        </span>
        <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-text md:text-3xl">
          {ticket.eventTitle}
        </h1>

        <div className="mt-6 border-4 border-border bg-surface p-6 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <ul className="flex flex-col gap-3 text-sm">
            {[
              { label: 'Recinto', value: ticket.venue },
              ...(ticket.address ? [{ label: 'Dirección', value: ticket.address }] : []),
              ...(ticket.city ? [{ label: 'Ciudad', value: ticket.city }] : []),
              { label: 'Zona / tribuna', value: ticket.zone },
              { label: 'Tipo', value: ticket.ticketTypeName },
              { label: 'Fecha', value: date.full },
              { label: 'Horario', value: `${date.time} hs` },
              { label: 'Total', value: formatPrice(ticket.total) },
            ].map(({ label, value }) => (
              <li key={label} className="flex gap-2">
                <span className="w-28 shrink-0 font-black uppercase tracking-wide text-text">{label}:</span>
                <span className="text-text-soft">{value}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-2 border-border overflow-hidden">
            <p className="bg-surface-2 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-text">
              Ubicación del evento
            </p>

            {loadingMap && !coordinates ? (
              <div className="flex h-64 items-center justify-center bg-surface-2 md:h-80">
                <p className="text-xs font-bold uppercase tracking-wide text-text-soft">
                  Cargando mapa…
                </p>
              </div>
            ) : coordinates ? (
              <div className="p-3">
                <EventMap
                  coordinates={coordinates}
                  venue={ticket.venue}
                  city={ticket.city ?? ''}
                  address={ticket.address}
                />
              </div>
            ) : (
              <div className="space-y-3 p-4">
                <p className="text-sm text-text-soft">
                  {directionsLabel || 'Consultá la dirección del recinto en la app del evento.'}
                </p>
                {directionsLabel && (
                  <a
                    href={getDirectionsUrl(null, directionsLabel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-primary hover:underline"
                  >
                    Cómo llegar al recinto →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <Link href="/mis-tickets" className="mt-6 inline-block text-sm font-black uppercase tracking-wider text-primary hover:underline">
          ← Regresar a mis entradas
        </Link>
      </div>
    </div>
  );
}
