import EventCard from './EventCard';
import { type Event } from '@/mocks/events';

interface EventGridProps {
  events: Event[];
  title?: string;
  emptyMessage?: string;
}

export default function EventGrid({ events, title, emptyMessage }: EventGridProps) {
  if (!events.length) {
    return (
      <section>
        {title && <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>}
        <p className="rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-8 text-center text-gray-400">
          {emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section>
      {title && <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
