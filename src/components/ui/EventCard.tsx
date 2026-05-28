'use client';

import Link from 'next/link';
import { Badge, Card } from 'flowbite-react';
import { formatEventDate, formatPrice, type Event } from '@/mocks/events';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const date = formatEventDate(event.date, event.time);

  return (
    <Link href={`/eventos/${event.id}`} className="block">
      <Card className="overflow-hidden border-gray-800 bg-gray-900 transition hover:-translate-y-1 hover:border-brand/40">
        <div
          className={`relative rounded-lg ${featured ? 'min-h-[190px]' : 'min-h-[150px]'}`}
          style={{ background: event.imageGradient }}
        >
          {event.badge && (
            <Badge color="dark" className="absolute left-4 top-4">
              {event.badge}
            </Badge>
          )}
          <div className="absolute bottom-4 right-4 rounded-xl bg-black/65 px-3 py-2 text-center text-sm leading-tight">
            <span className="block text-xs uppercase">{date.weekday}</span>
            <strong className="block text-2xl">{date.day}</strong>
            <span className="block text-xs uppercase">{date.month}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Badge color="success" className="w-fit uppercase">
            {event.category}
          </Badge>
          <h3 className="text-lg font-bold text-white">{event.title}</h3>
          <p className="text-sm text-gray-400">{event.subtitle}</p>
          <p className="text-sm text-gray-400">
            {event.venue} · {event.city}
          </p>
          <div className="mt-2 flex items-center justify-between border-t border-gray-800 pt-3 text-sm">
            <span className="text-gray-400">{date.time} hs</span>
            <strong className="text-brand">Desde {formatPrice(event.priceFrom)}</strong>
          </div>
        </div>
      </Card>
    </Link>
  );
}
