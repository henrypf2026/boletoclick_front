'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge } from 'flowbite-react';
import CategoryFilter from '@/components/ui/CategoryFilter';
import EventCard from '@/components/ui/EventCard';
import EventGrid from '@/components/ui/EventGrid';
import { type Event } from '@/mocks/events';
import { eventService, type CategoryOption } from '@/services/eventService';

const ALL_CATEGORY: CategoryOption = { id: 'all', label: 'Todos' };

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([ALL_CATEGORY]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([eventService.getEvents(), eventService.getCategories()])
      .then(([eventsData, categoriesData]) => {
        if (!active) return;
        setEvents(eventsData);
        setCategories([ALL_CATEGORY, ...categoriesData]);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setEvents([]);
        setError(
          err instanceof Error ? err.message : 'No se pudieron cargar los eventos.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
      <section className="border-b border-border bg-surface pb-2 md:pb-2">
        <div className="mx-auto max-w-6xl">
          <Badge color="success" className="mb-4 w-fit">
            Preventas y venta oficial
          </Badge>
          <h1 className="max-w-3xl text-[18px] font-bold leading-tight text-text sm:text-[22.5px] md:text-[36px]">
            Tus entradas para los mejores eventos en un solo lugar
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-text-soft sm:mt-4 sm:text-base md:text-lg">
            Compra boletos para partidos, conciertos y shows en vivo. Regístrate,
            elige tu zona y recibe tu QR al instante.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
            {[
              { value: `${events.length}+`, label: 'Eventos activos' },
              { value: 'QR', label: 'Acceso digital' },
              { value: '100%', label: 'Compra segura' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-surface-2 px-2 py-2 sm:px-4 sm:py-3"
              >
                <strong className="block text-base text-text sm:text-xl">{stat.value}</strong>
                <span className="text-[11px] text-text-soft sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl pb-8 pt-2" id="eventos">
        <section className="mb-6 space-y-4 sm:mb-8 sm:space-y-6">
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
            <span className="mt-2 block text-sm text-text-soft">
              Verifica que el backend esté corriendo (puerto 3000) y NEXT_PUBLIC_API_URL.
            </span>
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
          title="Próximos eventos"
          emptyMessage={
            loading
              ? 'Cargando eventos...'
              : 'No encontramos eventos con esos filtros. Prueba otra búsqueda.'
          }
        />
      </div>

      <section className="mx-auto max-w-6xl py-6 sm:py-8" id="faq">
        <h2 className="mb-4 text-xl font-bold text-text">¿Cómo comprar?</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['1', 'Regístrate', 'Crea tu cuenta con correo y contraseña en segundos.'],
            ['2', 'Elige tu evento', 'Filtra por categoría o busca por nombre.'],
            ['3', 'Selecciona zona', 'Escoge tribuna, cantidad y aplica códigos promo.'],
            ['4', 'Recibe tu QR', 'Tus entradas quedan en Mis entradas al confirmar.'],
          ].map(([step, title, text]) => (
            <article
              key={step}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-success text-sm font-bold text-background">
                {step}
              </span>
              <h3 className="mb-2 font-semibold text-text">{title}</h3>
              <p className="text-sm text-text-soft">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
