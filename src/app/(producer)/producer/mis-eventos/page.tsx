'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/eventService';
import type { Event } from '@/mocks/events';

export default function MisEventosPage() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!authenticated) { router.push('/login?from=/producer/mis-eventos'); return; }

    eventService.getMyProducerEvents()
      .then(setEvents)
      .catch(() => setError('No se pudieron cargar tus eventos.'))
      .finally(() => setLoadingEvents(false));
  }, [authenticated, loading, router]);

  if (loading || loadingEvents) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-soft">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between border-b-4 border-text pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-text">Mis Eventos</h1>
          <p className="mt-1 text-sm text-text-soft">Eventos creados por vos.</p>
        </div>
        <Link
          href="/producer/eventos/crear"
          className="border-2 border-border bg-primary px-4 py-2 text-sm font-black uppercase text-background hover:opacity-90 transition-opacity"
        >
          + Crear evento
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {!error && events.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="font-bold text-text">No creaste ningún evento todavía.</p>
          <Link
            href="/producer/eventos/crear"
            className="border-2 border-border bg-primary px-4 py-2 text-sm font-black uppercase text-background hover:opacity-90"
          >
            Crear primer evento
          </Link>
        </div>
      )}

      {events.length > 0 && (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between border-4 border-border bg-surface p-4 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-text-soft">
                  {event.category}
                </span>
                <h2 className="font-black uppercase tracking-tight text-text">{event.title}</h2>
                <p className="text-sm text-text-soft">
                  {event.venue} · {new Date(event.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Link
                href="/producer/dashboard"
                className="shrink-0 border-2 border-border px-3 py-2 text-sm font-black uppercase text-text hover:bg-surface-2 transition-colors"
              >
                Gestionar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
