'use client';

import { useMemo, useState } from 'react';
import { Badge } from 'flowbite-react';
import CategoryFilter from '@/components/ui/CategoryFilter';
import TeamFilter from '@/components/ui/TeamFilter';
import EventCard from '@/components/ui/EventCard';
import EventGrid from '@/components/ui/EventGrid';
import { categories, events, teams } from '@/mocks/events';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [team, setTeam] = useState('all');

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory = category === 'all' || event.category === category;
      const matchesTeam = team === 'all' || event.teamId === team || event.teamId === 'all';
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.subtitle.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query);
      return matchesCategory && matchesTeam && matchesSearch;
    });
  }, [search, category, team]);

  const featuredEvents = filteredEvents.filter((e) => e.featured);
  const upcomingEvents = filteredEvents.filter((e) => !e.featured);

  return (
    <div className="min-h-dvh -mx-4 -my-8 px-4 py-8">
      <section className="border-b border-border bg-surface -mx-4 px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Badge color="success" className="mb-4 w-fit">
            Preventas y venta oficial
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-text md:text-5xl">
            Tus entradas para los mejores eventos en un solo lugar
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-soft md:text-lg">
            Compra boletos para partidos, conciertos y shows en vivo. Regístrate,
            elige tu zona y recibe tu QR al instante.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { value: `${events.length}+`, label: 'Eventos activos' },
              { value: 'QR', label: 'Acceso digital' },
              { value: '100%', label: 'Compra segura' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-surface-2 px-4 py-3"
              >
                <strong className="block text-xl text-text">{stat.value}</strong>
                <span className="text-sm text-text-soft">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl py-8" id="eventos">
        <section className="mb-8 space-y-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar eventos, equipos o venues..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text placeholder:text-text-soft focus:border-primary focus:outline-none"
          />
          <CategoryFilter categories={categories} activeCategory={category} onChange={setCategory} />
          <TeamFilter teams={teams} activeTeam={team} onChange={setTeam} />
        </section>

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
          emptyMessage="No encontramos eventos con esos filtros. Prueba otra búsqueda."
        />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8" id="faq">
        <h2 className="mb-4 text-xl font-bold text-text">¿Cómo comprar?</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['1', 'Regístrate', 'Crea tu cuenta con correo y contraseña en segundos.'],
            ['2', 'Elige tu evento', 'Filtra por categoría, equipo o busca por nombre.'],
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
