'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Search, Building2 } from 'lucide-react';
import { venueService, type ApiVenue } from '@/services/venueService';

export default function AdminVenues() {
  const router = useRouter();
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    venueService.getAll()
      .then(setVenues)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = venues.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      (v.municipality?.name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-bg text-text font-mono p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b-4 border-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <button
            onClick={() => router.push('/dashboard-admin')}
            className="text-xs font-black uppercase text-text-soft hover:text-text mb-2 block transition-colors cursor-pointer"
          >
            &larr; Volver a Consola
          </button>
          <h1 className="text-2xl md:text-3xl text-text">Venues</h1>
          <p className="text-text-soft text-xs uppercase font-bold tracking-wide mt-1 flex items-center gap-1.5">
            <Building2 size={12} className="text-primary" />
            Todos los recintos registrados en la plataforma
          </p>
        </div>
        <span className="text-xs font-black uppercase text-text-soft border-2 border-border px-3 py-1.5">
          {venues.length} venue{venues.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center bg-surface border-2 border-border px-3 py-2 text-xs gap-2 max-w-sm">
        <Search size={14} className="text-text-soft shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nombre, ciudad o dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent font-bold focus:outline-none w-full text-text placeholder:text-text-soft/40"
        />
      </div>

      {loading ? (
        <div className="border-4 border-border bg-surface p-12 text-center text-xs font-black uppercase tracking-widest animate-pulse">
          ⏳ Cargando venues...
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((venue, idx) => (
                <motion.div
                  key={venue.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  onClick={() => router.push(`/admin/venues/${venue.id}`)}
                  className="border-4 border-border bg-surface shadow-[4px_4px_0px_0px_var(--border)] flex flex-col cursor-pointer hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all"
                >
                  {venue.imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={venue.imgUrl}
                      alt={venue.name}
                      className="h-36 w-full object-cover object-center border-b-4 border-border"
                    />
                  ) : (
                    <div className="h-36 w-full border-b-4 border-border bg-surface-2 flex items-center justify-center">
                      <Building2 size={40} className="text-border" />
                    </div>
                  )}

                  <div className="p-5 space-y-4 flex flex-col flex-1">
                    <div>
                      <p className="text-[9px] font-black uppercase text-text-soft tracking-wider mb-1">
                        {venue.municipality?.name ?? '—'}
                      </p>
                      <h3 className="font-black text-base uppercase tracking-tight text-text line-clamp-2">
                        {venue.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-text-soft uppercase mt-auto">
                      <div className="bg-surface-2 p-2 border border-border/10">
                        <span className="flex items-center gap-1 mb-0.5">
                          <MapPin size={10} /> Dirección
                        </span>
                        <span className="text-text font-black block truncate">{venue.address}</span>
                      </div>
                      <div className="bg-surface-2 p-2 border border-border/10">
                        <span className="flex items-center gap-1 mb-0.5">
                          <Users size={10} /> Capacidad
                        </span>
                        <span className="text-success font-black block">
                          {venue.capacity.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    {venue.events.length > 0 && (
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wide">
                        {venue.events.length} evento{venue.events.length !== 1 ? 's' : ''} próximo{venue.events.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-text-soft text-xs font-black uppercase border-4 border-dashed border-border/30">
                No se encontraron venues con esa búsqueda.
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
