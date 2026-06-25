'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Calendar } from 'lucide-react';
import EventMap from '@/components/ui/EventMap';
import { venueService, type ApiVenue } from '@/services/venueService';

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Aprobado',
  CANCELLED: 'Cancelado',
  INACTIVE: 'Inactivo',
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
};

const STATUS_CLASS: Record<string, string> = {
  APPROVED: 'bg-success/15 text-success border-success/40',
  CANCELLED: 'bg-accent/15 text-accent border-accent/40',
  INACTIVE: 'bg-text-soft/10 text-text-soft border-text-soft/30',
  DRAFT:    'bg-text-soft/10 text-text-soft border-text-soft/30',
  PENDING:  'bg-primary/15 text-primary border-primary/40',
};

function formatEventDate(isoDate: string) {
  const d = new Date(isoDate);
  return {
    date: d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  };
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay, ease: [0.16, 1, 0.3, 1] },
});

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b-2 border-border px-4 py-2.5">
    <h2 className="text-[10px] font-black uppercase tracking-widest text-text-soft">{children}</h2>
  </div>
);

export default function AdminVenueDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [venue, setVenue] = useState<ApiVenue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    venueService.getByIdWithEvents(id)
      .then((data) => {
        if (!data) { router.replace('/admin/venues'); return; }
        setVenue(data);
      })
      .catch(() => router.replace('/admin/venues'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-3 w-20 bg-surface-2" />
        <div className="h-8 w-1/2 bg-surface-2" />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-[58%] flex flex-col gap-4">
            <div className="h-44 bg-surface-2 border-4 border-border" />
            <div className="h-64 bg-surface-2 border-4 border-border" />
          </div>
          <div className="md:w-[42%] flex flex-col gap-4">
            <div className="h-36 bg-surface-2 border-4 border-border" />
            <div className="h-48 bg-surface-2 border-4 border-border" />
          </div>
        </div>
      </div>
    );
  }

  if (!venue) return null;

  const lat = Number(venue.latitude);
  const lng = Number(venue.longitude);
  const city = venue.municipality?.name ?? '';
  const events = venue.events ?? [];

  return (
    <div className="min-h-screen bg-bg text-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="border-b-4 border-border pb-5">
        <button
          onClick={() => router.push('/admin/venues')}
          className="text-[10px] font-black uppercase tracking-widest text-text-soft hover:text-text mb-3 block transition-colors cursor-pointer"
        >
          &larr; Venues
        </button>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            {city && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{city}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-text leading-none">
              {venue.name}
            </h1>
          </div>
          <div className="shrink-0 border-2 border-border bg-surface-2 px-3 py-1.5 text-center">
            <span className="text-[9px] font-black uppercase text-text-soft tracking-widest block">Capacidad</span>
            <span className="text-lg font-black text-text tabular-nums">
              {venue.capacity.toLocaleString('es-AR')}
            </span>
            <span className="text-[9px] font-black uppercase text-text-soft"> personas</span>
          </div>
        </div>
      </motion.div>

      {/* Body — dos columnas flex independientes */}
      <div className="flex flex-col md:flex-row gap-4">

        {/* Columna izquierda: Imagen + Mapa */}
        <div className="md:w-[58%] flex flex-col gap-4">

          {/* Imagen */}
          <motion.div
            {...fadeUp(0.05)}
            className="border-4 border-border shadow-[4px_4px_0px_0px_var(--border)] overflow-hidden h-44 shrink-0"
          >
            {venue.imgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.imgUrl}
                alt={venue.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-surface-2 flex flex-col items-center justify-center gap-2">
                <Building2 size={36} className="opacity-25" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-soft">
                  Sin imagen
                </span>
              </div>
            )}
          </motion.div>

          {/* Mapa */}
          <motion.div
            {...fadeUp(0.1)}
            className="border-4 border-border bg-surface shadow-[4px_4px_0px_0px_var(--border)]"
          >
            <SectionHeader>Ubicación</SectionHeader>
            <div className="p-3">
              <EventMap
                coordinates={{ lat: Number.isNaN(lat) ? 0 : lat, lng: Number.isNaN(lng) ? 0 : lng }}
                venue={venue.name}
                city={city}
                address={venue.address}
              />
            </div>
          </motion.div>

        </div>

        {/* Columna derecha: Info + Eventos */}
        <div className="md:w-[42%] flex flex-col gap-4">

          {/* Info */}
          <motion.div
            {...fadeUp(0.07)}
            className="border-4 border-border bg-surface shadow-[4px_4px_0px_0px_var(--border)] shrink-0"
          >
            <SectionHeader>Información</SectionHeader>
            <ul className="divide-y-2 divide-border">
              {[
                { icon: <MapPin size={12} />, label: 'Ciudad',    value: city || '—' },
                { icon: <MapPin size={12} />, label: 'Dirección', value: venue.address },
                { icon: <Users size={12} />, label: 'Capacidad', value: `${venue.capacity.toLocaleString('es-AR')} personas` },
              ].map(({ icon, label, value }) => (
                <li key={label} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-primary shrink-0">{icon}</span>
                  <span className="w-20 shrink-0 text-[10px] font-black uppercase tracking-wide text-text-soft">{label}</span>
                  <span className="text-xs font-bold text-text truncate">{value}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Próximos eventos */}
          <motion.div
            {...fadeUp(0.12)}
            className="border-4 border-border bg-surface shadow-[4px_4px_0px_0px_var(--border)] flex flex-col flex-1"
          >
            <div className="border-b-2 border-border px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-text-soft flex items-center gap-1.5">
                <Calendar size={10} className="text-primary" />
                Próximos eventos
              </h2>
              {events.length > 0 && (
                <span className="text-[9px] font-black border border-border px-1.5 py-0.5 text-text-soft tabular-nums">
                  {events.length}
                </span>
              )}
            </div>

            {events.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center px-4">
                <Calendar size={24} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-text-soft leading-relaxed">
                  Sin eventos futuros<br />en este recinto
                </p>
              </div>
            ) : (
              <ul className="divide-y-2 divide-border overflow-y-auto">
                {events.map((ev, idx) => {
                  const { date, time } = formatEventDate(ev.eventDate);
                  const statusClass = STATUS_CLASS[ev.status] ?? STATUS_CLASS.DRAFT;
                  const statusLabel = STATUS_LABEL[ev.status] ?? ev.status;
                  return (
                    <motion.li
                      key={ev.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 + idx * 0.04 }}
                      className="px-4 py-3 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-black uppercase tracking-tight text-text leading-tight line-clamp-2 flex-1">
                          {ev.title}
                        </p>
                        <span className={`shrink-0 text-[8px] font-black uppercase border px-1.5 py-0.5 ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-text-soft tabular-nums">
                        {date} · {time} hs
                      </p>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
