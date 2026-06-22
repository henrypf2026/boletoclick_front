'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from 'flowbite-react';
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

  const isSoldOut = event.status === 'SOLDOUT';
  const showLowStock = !isSoldOut && !isPast && isLowStock(event.zones, event.capacity);

  const statusBadge = isSoldOut
    ? { label: 'Agotado', color: 'failure' as const }
    : showLowStock
    ? { label: 'Últimas entradas', color: 'warning' as const }
    : null;

  const displayBadge = statusBadge ?? (event.badge ? { label: event.badge, color: 'dark' as const } : null);

  return (
    <Link href={`/eventos/${event.id}`} className={`block${isPast ? ' opacity-60 grayscale' : ''}`}>
      <Card className="overflow-hidden border-border bg-surface transition hover:-translate-y-1 hover:border-primary/40">
        <div
          className={`relative overflow-hidden rounded-lg ${featured ? 'min-h-[190px]' : 'min-h-[150px]'}`}
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
          {displayBadge && (
            <Badge color={displayBadge.color} className="absolute left-4 top-4 z-10">
              {displayBadge.label}
            </Badge>
          )}
          <div className="absolute bottom-4 right-4 z-10 rounded-xl bg-black/65 px-3 py-2 text-center text-sm leading-tight text-white">
            <span className="block text-xs uppercase">{date.weekday}</span>
            <strong className="block text-2xl">{date.day}</strong>
            <span className="block text-xs uppercase">{date.month}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Badge color="success" className="w-fit uppercase">
            {event.category}
          </Badge>
          <h3 className="line-clamp-2 text-base font-bold text-text sm:text-lg">{event.title}</h3>
          <p className="line-clamp-2 text-sm text-text-soft">{event.subtitle}</p>
          <p className="truncate text-sm text-text-soft">
            {event.venue} · {event.city}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
            <span className="shrink-0 text-text-soft">{date.time} hs</span>
            {isSoldOut
              ? <strong className="truncate text-text-soft line-through">{formatPrice(event.priceFrom)}</strong>
              : <strong className="truncate text-primary">Desde {formatPrice(event.priceFrom)}</strong>
            }
          </div>
        </div>
      </Card>
    </Link>
  );
}
