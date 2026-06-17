'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button } from 'flowbite-react';
import CategoryFilter from '@/components/ui/CategoryFilter';
import EventCard from '@/components/ui/EventCard';
import EventGrid from '@/components/ui/EventGrid';
import { type Event } from '@/mocks/events';
import { eventService, type CategoryOption } from '@/services/eventService';

const ALL_CATEGORY: CategoryOption = { id: 'all', label: 'Todos' };

export default function EventosPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([ALL_CATEGORY]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadEvents = useCallback(async (signal?: { cancelled: boolean }) => {
    setLoading(true);
    setError(null);

    const [eventsResult, categoriesResult] = await Promise.allSettled([
      eventService.getEvents(),
      eventService.getCategories(),
    ]);

    if (signal?.cancelled) return;

    if (eventsResult.status === 'fulfilled') {
      setEvents(eventsResult.value);
      setError(null);
    } else {
      setEvents([]);
      const reason = eventsResult.reason;
      setError(
        reason instanceof Error
          ? reason.message
          : 'No se pudieron cargar los eventos.',
      );
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories([ALL_CATEGORY, ...categoriesResult.value]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    void loadEvents(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadEvents, reloadKey]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory = category === 'all' || event.category === category;
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.subtitle.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, category, events]);

  const featuredEvents = filteredEvents.filter((e) => e.featured);
  const upcomingEvents = filteredEvents.filter((e) => !e.featured);

  return (
    <div className="min-h-dvh -my-8">
      <div className="border-b-4 border-border bg-surface px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-black uppercase tracking-tight text-text md:text-3xl">
            Cartelera de eventos
          </h1>
          <p className="mt-1 text-sm text-text-soft">
            Encontrá entradas para los mejores shows en vivo.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-6">
        <section className="mb-6 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar eventos o venues..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text placeholder:text-text-soft focus:border-primary focus:outline-none"
          />
          <CategoryFilter categories={categories} activeCategory={category} onChange={setCategory} />
        </section>

        {error && (
          <Alert color="failure" className="mb-6">
            <span className="block font-medium">No se pudieron cargar los eventos.</span>
            <span className="mt-1 block text-sm">{error}</span>
            <Button
              color="failure"
              size="sm"
              className="mt-3"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Reintentar
            </Button>
          </Alert>
        )}

        {featuredEvents.length > 0 && (
          <section className="mb-10">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-text">Destacados</h2>
              <p className="text-text-soft">Los eventos con mayor demanda ahora mismo</p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} featured />
              ))}
            </div>
          </section>
        )}

        <EventGrid
          events={upcomingEvents}
          title="Todos los eventos"
          emptyMessage={
            loading
              ? 'Cargando eventos...'
              : 'No encontramos eventos con esos filtros. Probá otra búsqueda.'
          }
        />
      </div>
    </div>
  );
}
