'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import EventCard from '@/components/ui/EventCard';
import { type Event } from '@/mocks/events';
import { eventService } from '@/services/eventService';

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function TicketDecoration() {
  return (
    <svg
      viewBox="0 0 340 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none absolute right-2 top-4 w-[clamp(180px,30vw,320px)] select-none opacity-[0.07] dark:opacity-[0.05]"
    >
      <rect x="2" y="2" width="336" height="196" rx="4" stroke="currentColor" strokeWidth="4" />
      <line x1="220" y1="2" x2="220" y2="68" stroke="currentColor" strokeWidth="4" />
      <line x1="220" y1="132" x2="220" y2="198" stroke="currentColor" strokeWidth="4" />
      <circle cx="220" cy="100" r="32" stroke="currentColor" strokeWidth="4" />
      <line x1="200" y1="2" x2="240" y2="2" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="200" y1="198" x2="240" y2="198" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <rect x="30" y="40" width="140" height="8" rx="2" fill="currentColor" />
      <rect x="30" y="60" width="100" height="8" rx="2" fill="currentColor" />
      <rect x="30" y="90" width="60" height="6" rx="2" fill="currentColor" />
      <rect x="30" y="108" width="80" height="6" rx="2" fill="currentColor" />
      <rect x="30" y="130" width="120" height="20" rx="2" fill="currentColor" />
    </svg>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const eventsReveal = useReveal();
  const stepsReveal = useReveal();
  const ctaReveal = useReveal();

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let active = true;
    eventService.getEvents()
      .then((data) => {
        if (!active) return;
        const feat = data.filter((e) => e.featured);
        setFeatured((feat.length >= 3 ? feat : data).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => { if (active) setLoadingEvents(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-dvh -my-8 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative border-b-4 border-border bg-surface px-4 pb-16 pt-14 md:pt-20">
        <TicketDecoration />

        <div className="relative mx-auto max-w-6xl">

          <div
            className="transition-all duration-500"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(12px)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span className="inline-flex items-center gap-2 border-2 border-border bg-accent px-3 py-1 text-[11px] font-black uppercase tracking-widest text-background shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:text-black">
              <span className="inline-block size-2 animate-pulse rounded-full bg-background dark:bg-black" />
              Preventas y venta oficial
            </span>
          </div>

          <h1
            className="mt-5 max-w-[14ch] text-[clamp(2.4rem,6vw,5rem)] font-black uppercase leading-[0.95] tracking-tighter text-text transition-all duration-700 delay-75"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(20px)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Tus entradas para los mejores eventos
          </h1>

          <p
            className="mt-5 max-w-[52ch] text-base text-text-soft transition-all duration-700 delay-150 md:text-lg"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(16px)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Comprá boletos para recitales, partidos y shows en vivo. Elegí tu zona y recibí tu QR al instante.
          </p>

          <div
            className="mt-8 flex flex-wrap gap-3 transition-all duration-700 delay-200"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(12px)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Link
              href="/eventos"
              className="inline-flex h-12 items-center border-4 border-border bg-primary px-7 text-sm font-black uppercase tracking-wider text-background shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] active:translate-y-0.5 active:shadow-none dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              Ver cartelera
            </Link>
            <Link
              href="/registro"
              className="inline-flex h-12 items-center border-4 border-border bg-surface px-7 text-sm font-black uppercase tracking-wider text-text shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] active:translate-y-0.5 active:shadow-none dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              Crear cuenta gratis
            </Link>
          </div>

          <div
            className="mt-12 flex flex-wrap gap-8 transition-all duration-700 delay-300 md:gap-12"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(8px)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {[
              { value: 'QR digital', label: 'Acceso instantáneo' },
              { value: '100%', label: 'Compra segura' },
              { value: '24/7', label: 'Siempre disponible' },
            ].map((s) => (
              <div key={s.label}>
                <strong className="block text-xl font-black text-text">{s.value}</strong>
                <span className="text-xs font-bold uppercase tracking-widest text-text-soft">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTACADOS DE LA SEMANA ───────────────────────────── */}
      <section
        ref={eventsReveal.ref as React.RefObject<HTMLElement>}
        className="border-b-4 border-border px-4 py-12 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div
            className="mb-8 flex flex-col gap-2 transition-all duration-600 sm:flex-row sm:items-end sm:justify-between"
            style={{
              opacity: eventsReveal.visible ? 1 : 0,
              transform: eventsReveal.visible ? 'translateY(0)' : 'translateY(16px)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div>
              <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-accent">
                ↗ Esta semana en cartelera
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-text md:text-3xl">
                Eventos que no te podés perder
              </h2>
            </div>
            <Link
              href="/eventos"
              className="shrink-0 text-sm font-black uppercase tracking-wider text-primary underline-offset-4 hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {/* Loading skeleton */}
          {loadingEvents && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse border-4 border-border bg-surface-2"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          )}

          {/* Event cards */}
          {!loadingEvents && featured.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {featured.map((event, i) => (
                <div
                  key={event.id}
                  className="transition-all duration-500"
                  style={{
                    opacity: eventsReveal.visible ? 1 : 0,
                    transform: eventsReveal.visible ? 'translateY(0)' : 'translateY(24px)',
                    transitionDelay: eventsReveal.visible ? `${i * 80}ms` : '0ms',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <EventCard event={event} featured />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingEvents && featured.length === 0 && (
            <div
              className="flex flex-col items-center justify-center border-4 border-dashed border-border py-14 text-center transition-all duration-500"
              style={{
                opacity: eventsReveal.visible ? 1 : 0,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <p className="text-sm font-black uppercase tracking-wider text-text-soft">
                Próximamente nuevos eventos
              </p>
              <Link href="/eventos" className="mt-4 text-sm font-black uppercase tracking-wider text-primary hover:underline">
                Ver cartelera completa →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CÓMO COMPRAR ─────────────────────────────────────── */}
      <section
        ref={stepsReveal.ref as React.RefObject<HTMLElement>}
        className="border-b-4 border-border px-4 py-12 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div
            className="mb-10 transition-all duration-600"
            style={{
              opacity: stepsReveal.visible ? 1 : 0,
              transform: stepsReveal.visible ? 'translateY(0)' : 'translateY(16px)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-accent">
              ↗ Simple y rápido
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-text md:text-3xl">
              ¿Cómo comprar?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['01', 'Registrate', 'Creá tu cuenta con correo y contraseña en segundos.'],
              ['02', 'Elegí tu evento', 'Filtrá por categoría o buscá directamente por nombre.'],
              ['03', 'Seleccioná zona', 'Elegí tribuna, cantidad y aplicá códigos de descuento.'],
              ['04', 'Recibí tu QR', 'Tus entradas quedan en Mi Cuenta listas para usar.'],
            ].map(([step, title, text], i) => (
              <article
                key={step}
                className="border-4 border-border bg-surface p-5 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] transition-all duration-500 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                style={{
                  opacity: stepsReveal.visible ? 1 : 0,
                  transform: stepsReveal.visible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: stepsReveal.visible ? `${i * 70}ms` : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span className="mb-4 block text-3xl font-black leading-none tracking-tighter text-primary opacity-50">
                  {step}
                </span>
                <h3 className="mb-2 text-base font-black uppercase tracking-tight text-text">{title}</h3>
                <p className="text-sm leading-relaxed text-text-soft">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section
        ref={ctaReveal.ref as React.RefObject<HTMLElement>}
        className="px-4 py-16 md:py-20"
      >
        <div
          className="mx-auto max-w-6xl border-4 border-border bg-text p-8 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] transition-all duration-700 dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] md:p-12"
          style={{
            opacity: ctaReveal.visible ? 1 : 0,
            transform: ctaReveal.visible ? 'translateY(0)' : 'translateY(20px)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-primary">
                ↗ No te quedés afuera
              </p>
              <h2 className="text-2xl font-black uppercase leading-tight tracking-tighter text-background md:text-4xl">
                ¿Listo para conseguir tus entradas?
              </h2>
              <p className="mt-2 max-w-md text-sm text-background/60">
                Explorá la cartelera completa y comprá en minutos.
              </p>
            </div>
            <Link
              href="/eventos"
              className="inline-flex h-12 shrink-0 items-center border-4 border-background bg-primary px-8 text-sm font-black uppercase tracking-wider text-background shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-0.5 active:shadow-none"
            >
              Ver cartelera completa
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
