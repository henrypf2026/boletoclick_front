'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from 'flowbite-react';
import { formatEventDate, formatPrice, type Event } from '@/mocks/events';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const date = formatEventDate(event.date, event.time);
  const sources = [event.posterUrl, event.fallbackImageUrl].filter(Boolean) as string[];
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sources[sourceIndex];

  return (
    <Link href={`/eventos/${event.id}`} className="block">
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
          {event.badge && (
            <Badge color="dark" className="absolute left-4 top-4 z-10">
              {event.badge}
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
            <strong className="truncate text-primary">Desde {formatPrice(event.priceFrom)}</strong>
          </div>
        </div>
      </Card>
    </Link>
  );
}
