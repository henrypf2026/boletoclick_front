'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Alert, Badge, Button, Card, Label, Select, TextInput } from 'flowbite-react';
import { useAuth } from '@/context/AuthContext';
import { formatEventDate, formatPrice, type Event } from '@/mocks/events';
import { eventService } from '@/services/eventService';
import { saveTicket } from '@/lib/auth';
import EventMap from '@/components/ui/EventMap';

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
    return () => {
      active = false;
    };
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
      <div className="mx-auto max-w-6xl px-4 py-10 text-text-soft">Cargando evento...</div>
    );
  }

  if (!event) {
    router.replace('/');
    return null;
  }

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'BOLETO10') {
      setPromoApplied(true);
      setMessage('Código aplicado: 10% de descuento.');
      return;
    }
    setPromoApplied(false);
    setMessage('Código no válido. Prueba BOLETO10.');
  };

  const handlePurchase = () => {
    if (!authenticated) {
      router.push(`/login?from=/eventos/${event.id}`);
      return;
    }
    if (!selectedZone || quantity > selectedZone.available) {
      setMessage('Cantidad no disponible en esa zona.');
      return;
    }
    saveTicket({
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
    router.push('/mis-tickets');
  };

  return (
    <div className="min-h-dvh bg-gray-950 -mx-4 -my-8 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          ← Volver a eventos
        </Link>

        {(() => {
          const headerSources = [event.posterUrl, event.fallbackImageUrl].filter(
            Boolean,
          ) as string[];
          const headerImage = headerSources[headerSourceIndex];

          return (
            <div
              className="relative mt-4 flex flex-col justify-between gap-4 overflow-hidden rounded-2xl p-6 md:flex-row md:items-end"
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
                    onError={() => setHeaderSourceIndex((index) => index + 1)}
                  />
                  <div className="absolute inset-0 bg-black/45" />
                </>
              )}
              <div className="relative z-10">
                <Badge color="dark" className="mb-2 uppercase">{event.category}</Badge>
                <h1 className="text-2xl font-bold text-white md:text-4xl">{event.title}</h1>
                <p className="mt-2 text-white/90">{event.subtitle}</p>
              </div>
              <div className="relative z-10 rounded-xl bg-black/45 px-4 py-3 text-center">
                <strong className="block text-lg text-white">
                  {date!.day} {date!.month}
                </strong>
                <span className="text-sm text-white/90">{date!.time} hs</span>
              </div>
            </div>
          );
        })()}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="border-gray-800 bg-gray-900 lg:col-span-3">
            <h2 className="mb-4 text-lg font-bold text-white">Información del evento</h2>
            <ul className="grid list-disc gap-2 pl-5 text-gray-400">
              <li><strong className="text-white">Recinto:</strong> {event.venue}</li>
              {event.address && (
                <li><strong className="text-white">Dirección:</strong> {event.address}</li>
              )}
              <li><strong className="text-white">Ciudad:</strong> {event.city}</li>
              {event.capacity != null && (
                <li><strong className="text-white">Capacidad:</strong> {event.capacity.toLocaleString('es-MX')} personas</li>
              )}
              <li><strong className="text-white">Fecha:</strong> {date!.full}</li>
              <li><strong className="text-white">Acceso:</strong> QR digital en Mis entradas</li>
            </ul>

            <div className="mt-6" id="ubicacion-recinto">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Ubicación del recinto
              </h3>
              <EventMap
                coordinates={event.coordinates}
                venue={event.venue}
                city={event.city}
                address={event.address}
              />
            </div>
          </Card>

          <Card className="border-gray-800 bg-gray-900 lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-white">Comprar entradas</h2>

            <div className="mb-4">
              <Label htmlFor="quantity" className="mb-2 block">Cantidad</Label>
              <Select id="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="zone" className="mb-2 block">Zona / tribuna</Label>
              <Select id="zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                {event.zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} · {formatPrice(zone.price)} ({zone.available} disp.)
                  </option>
                ))}
              </Select>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <TextInput value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Código de promoción" />
              <Button color="gray" onClick={handleApplyPromo}>Aplicar</Button>
            </div>

            <div className="mb-4 flex items-center justify-between border-t border-gray-800 pt-4">
              <span className="text-gray-400">Total</span>
              <strong className="text-xl text-green-400">{formatPrice(total)}</strong>
            </div>

            {message && <Alert color="info" className="mb-4">{message}</Alert>}

            <Button onClick={handlePurchase} className="w-full bg-brand text-gray-950 hover:bg-brand-dark">
              {authenticated ? 'Confirmar compra' : 'Inicia sesión para comprar'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
