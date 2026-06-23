'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatEventDate, formatPrice, isLowStock, type Event } from '@/mocks/events';

interface EventCardProps {
  event: Event;
  featured?: boolean;
  isPast?: boolean;
}

export default function EventCard({ event, featured = false, isPast = false }: EventCardProps) {
  const date = formatEventDate(event.date, event.time);
  const sources = [event.posterUrl, event.fallbackImageUrl].filter(Boolean) as string[];
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sources[sourceIndex];

  const totalAvailable = event.zones.reduce((sum, z) => sum + z.available, 0);
  const isSoldOut = event.status === 'SOLDOUT' || (event.zones.length > 0 && totalAvailable === 0);
  const showLowStock = !isSoldOut && !isPast && isLowStock(event.zones);

  const statusBadge = isSoldOut
    ? { label: 'Agotado', color: 'failure' as const }
    : showLowStock
    ? { label: 'Últimas entradas', color: 'warning' as const }
    : null;

  const displayBadge = statusBadge ?? (event.badge ? { label: event.badge, color: 'dark' as const } : null);

  return (
    <Link href={`/eventos/${event.id}`} className={`block h-full${isPast ? ' opacity-60 grayscale' : ''}`}>
      <div className="h-full flex flex-col overflow-hidden rounded-lg border-2 border-border bg-surface transition hover:-translate-y-1 hover:border-primary/40">
        {/* Imagen — altura fija, recorta sin deformar */}
        <div
          className={`relative overflow-hidden flex-shrink-0 ${featured ? 'h-[190px]' : 'h-[160px]'}`}
          style={{ background: event.imageGradient }}
        >
          {imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setSourceIndex((index) => index + 1)}
            />
          )}
          {isSoldOut && (
            <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center">
              <span className="rotate-[-12deg] border-4 border-red-500 px-4 py-1 text-2xl font-black uppercase tracking-widest text-red-500">
                Agotado
              </span>
            </div>
          )}
          {!isSoldOut && displayBadge && (
            <span className={`absolute left-4 top-4 z-10 px-2 py-1 text-[10px] font-black uppercase tracking-wider border ${
              displayBadge.color === 'warning'
                ? 'bg-yellow-400 text-black border-yellow-600'
                : 'bg-surface text-text border-border'
            }`}>
              {displayBadge.label}
            </span>
          )}
          <div className="absolute bottom-4 right-4 z-10 rounded-xl bg-black/65 px-3 py-2 text-center text-sm leading-tight text-white">
            <span className="block text-xs uppercase">{date.weekday}</span>
            <strong className="block text-2xl">{date.day}</strong>
            <span className="block text-xs uppercase">{date.month}</span>
          </div>
        </div>

        {/* Contenido — ocupa el resto y clava el precio al fondo */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <span className="w-fit px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-primary text-background border border-border">
            {event.category}
          </span>
          <h3 className="line-clamp-2 text-base font-bold text-text sm:text-lg">{event.title}</h3>
          <p className="line-clamp-2 text-sm text-text-soft">{event.subtitle}</p>
          <p className="flex items-center gap-1 truncate text-sm text-text-soft">
            <svg className="shrink-0 w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{event.venue} · {event.city}</span>
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
            <span className="shrink-0 text-text-soft">{date.time} hs</span>
            {isSoldOut
              ? <strong className="truncate text-text-soft line-through">{formatPrice(event.priceFrom)}</strong>
              : <strong className="truncate text-primary">Desde {formatPrice(event.priceFrom)}</strong>
            }
          </div>
        </div>
      </div>
    </Link>
  );
}
