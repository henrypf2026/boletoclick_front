'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Alert } from 'flowbite-react';
import { useAuth } from '@/context/AuthContext';
import { formatEventDate, formatPrice, type Event } from '@/mocks/events';
import { eventService } from '@/services/eventService';
import { saveTicket } from '@/lib/auth';
import EventMap from '@/components/ui/EventMap';
import { paymentService } from '@/services/paymentService';

export default function EventoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { authenticated, user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [zoneId, setZoneId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [headerSourceIndex, setHeaderSourceIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadingEvent(true);
    eventService.getEventById(id).then((data) => {
      if (!active) return;
      setEvent(data);
      setZoneId(data?.zones[0]?.id ?? '');
      setLoadingEvent(false);
    });
    return () => { active = false; };
  }, [id]);

  const selectedZone = event?.zones.find((zone) => zone.id === zoneId);
  const date = event ? formatEventDate(event.date, event.time) : null;

  const total = useMemo(() => {
    if (!selectedZone) return 0;
    const subtotal = selectedZone.price * quantity;
    return promoApplied ? Math.round(subtotal * 0.9) : subtotal;
  }, [selectedZone, quantity, promoApplied]);

  if (loadingEvent) {
    return (
      <div className="min-h-dvh -mx-4 -my-8 px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-surface-2" />
          <div className="h-64 bg-surface-2 border-4 border-border" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="h-80 bg-surface-2 border-4 border-border lg:col-span-3" />
            <div className="h-80 bg-surface-2 border-4 border-border lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    router.replace('/eventos');
    return null;
  }

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'BOLETO10') {
      setPromoApplied(true);
      setMessage('Código aplicado: 10% de descuento.');
      return;
    }
    setPromoApplied(false);
    setMessage('Código no válido. Probá con BOLETO10.');
  };

  const handlePurchase = async () => {

  if (!authenticated) {
    router.push(`/login?from=/eventos/${event.id}`);
    return;
  }

  if (!selectedZone || quantity > selectedZone.available) {
    setMessage('Cantidad no disponible en esa zona.');
    return;
  }

  try {

    const session = await paymentService.createCheckoutSession({
      id: crypto.randomUUID(),
      userId: user!.id,
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      date: event.date,
      time: event.time,
      zone: selectedZone.name,
      quantity,
      total,
      qrCode: `BC-${Date.now()}`,
      purchasedAt: new Date().toISOString(),
    });

    window.location.href = session.url;

  } catch {

    setMessage('Error procesando la compra');

  }

};
    //saveTicket({
    //id: crypto.randomUUID(),
    //userId: user!.id,
    //eventId: event.id,
    //eventTitle: event.title,
    //venue: event.venue,
    //date: event.date,
    //time: event.time,
    //zone: selectedZone.name,
    //quantity,
    //total,
    //qrCode: `BC-${Date.now()}`,
    //purchasedAt: new Date().toISOString(),
    //});
    //router.push('/mis-tickets');

  const headerSources = [event.posterUrl, event.fallbackImageUrl].filter(Boolean) as string[];
  const headerImage = headerSources[headerSourceIndex];

  return (
    <div className="min-h-dvh -mx-4 -my-8 px-4 py-6">
      <div className="mx-auto max-w-6xl">

        <Link href="/eventos" className="text-sm font-bold text-text-soft hover:text-text transition-colors">
          ← Volver a eventos
        </Link>

        {/* Header del evento */}
        <div
          className="relative mt-4 flex flex-col justify-between gap-4 overflow-hidden border-4 border-border p-6 md:flex-row md:items-end shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          style={{ background: event.imageGradient }}
        >
          {headerImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headerImage}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover object-center"
                referrerPolicy="no-referrer"
                onError={() => setHeaderSourceIndex((i) => i + 1)}
              />
              <div className="absolute inset-0 bg-black/55" />
            </>
          )}
          <div className="relative z-10">
            <span className="mb-2 inline-block border-2 border-white/40 bg-white/20 px-2 py-0.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
              {event.category}
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white md:text-4xl">
              {event.title}
            </h1>
            <p className="mt-2 text-sm text-white/80">{event.subtitle}</p>
          </div>
          <div className="relative z-10 shrink-0 border-2 border-white/30 bg-black/40 px-4 py-3 text-center backdrop-blur-sm">
            <strong className="block text-lg font-black text-white">
              {date!.day} {date!.month}
            </strong>
            <span className="text-sm text-white/80">{date!.time} hs</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">

          {/* Info del evento */}
          <div className="border-4 border-border bg-surface p-6 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] lg:col-span-3">
            <h2 className="mb-5 text-base font-black uppercase tracking-wide text-text">
              Información del evento
            </h2>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Recinto', value: event.venue },
                ...(event.address ? [{ label: 'Dirección', value: event.address }] : []),
                { label: 'Ciudad', value: event.city },
                ...(event.capacity != null ? [{ label: 'Capacidad', value: `${event.capacity.toLocaleString('es-AR')} personas` }] : []),
                { label: 'Fecha', value: date!.full },
                { label: 'Acceso', value: 'QR digital en Mi Cuenta' },
              ].map(({ label, value }) => (
                <li key={label} className="flex gap-2 text-sm">
                  <span className="w-24 shrink-0 font-black uppercase tracking-wide text-text">{label}:</span>
                  <span className="text-text-soft">{value}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="mb-3 text-[11px] font-black uppercase tracking-widest text-text-soft">
                Ubicación del recinto
              </h3>
              <div className="border-2 border-border overflow-hidden">
                <EventMap
                  coordinates={event.coordinates}
                  venue={event.venue}
                  city={event.city}
                  address={event.address}
                />
              </div>
            </div>
          </div>

          {/* Comprar entradas */}
          <div className="border-4 border-border bg-surface p-6 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] lg:col-span-2">
            <h2 className="mb-5 text-base font-black uppercase tracking-wide text-text">
              Comprar entradas
            </h2>

            <div className="mb-4">
              <label htmlFor="quantity" className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-text-soft">
                Cantidad
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border-2 border-border bg-background px-3 py-2.5 text-sm font-bold text-text focus:outline-none focus:border-primary transition-colors"
              >
                {[1, 2, 3, 4, 5, 6].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="zone" className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-text-soft">
                Zona / tribuna
              </label>
              <select
                id="zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full border-2 border-border bg-background px-3 py-2.5 text-sm font-bold text-text focus:outline-none focus:border-primary transition-colors"
              >
                {event.zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} · {formatPrice(zone.price)} ({zone.available} disp.)
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Código de promoción"
                className="min-w-0 flex-1 border-2 border-border bg-background px-3 py-2.5 text-sm text-text placeholder:text-text-soft focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleApplyPromo}
                className="shrink-0 border-2 border-border bg-surface-2 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-text hover:bg-surface transition-colors"
              >
                Aplicar
              </button>
            </div>

            <div className="mb-5 flex items-center justify-between border-t-2 border-border pt-4">
              <span className="text-sm font-bold uppercase tracking-wide text-text-soft">Total</span>
              <strong className="text-2xl font-black text-success">{formatPrice(total)}</strong>
            </div>

            {message && (
              <Alert color={promoApplied ? 'success' : 'failure'} className="mb-4 text-sm">
                {message}
              </Alert>
            )}

            <button
              onClick={handlePurchase}
              className="w-full border-4 border-border bg-primary py-3 text-sm font-black uppercase tracking-wider text-background shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] active:translate-y-0.5 active:shadow-none dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              {authenticated ? 'Confirmar compra' : 'Iniciá sesión para comprar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
