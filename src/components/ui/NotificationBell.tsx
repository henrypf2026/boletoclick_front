'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type NotifType = 'cancelled' | 'recommendation' | 'suspended' | 'reactivated';

interface Notification {
  id: string;
  date: string;
  title: string;
  message: string;
  type: NotifType;
  href?: string;
}

const SEEN_KEY = 'bc_seen_notifs';

// ─── Notificaciones para el usuario comprador ────────────────────────────────

async function fetchUserNotifications(): Promise<Notification[]> {
  const orders: any[] = await fetch('/api/backend/orders/me', { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

  const cancelledOrders = orders.filter(
    (o) =>
      (o.status === 'PAID' &&
        o.tickets?.length > 0 &&
        o.tickets.every((t: any) => !t.allowEntrance)) ||
      o.status === 'CANCELLED'
  );

  const cancelledNotifs: Notification[] = await Promise.all(
    cancelledOrders.map(async (order: any) => {
      const eventId = order.tickets?.[0]?.ticketType?.eventId;
      let title = 'Evento cancelado';
      if (eventId) {
        try {
          const ev = await fetch(`/api/backend/events/${eventId}`).then((r) =>
            r.ok ? r.json() : null
          );
          if (ev?.title) title = ev.title;
        } catch {}
      }
      return {
        id: `cancelled_${order.id}`,
        date: order.updatedAt ?? order.createdAt,
        title,
        message: 'Tu entrada fue dada de baja.',
        type: 'cancelled' as NotifType,
        href: '/mis-compras',
      };
    })
  );

  const purchasedEventIds = [
    ...new Set(
      orders.flatMap((o: any) =>
        (o.tickets ?? []).map((t: any) => t.ticketType?.eventId).filter(Boolean)
      )
    ),
  ] as string[];

  if (purchasedEventIds.length === 0) return cancelledNotifs;

  const purchasedEvents: any[] = await Promise.all(
    purchasedEventIds.map((id) =>
      fetch(`/api/backend/events/${id}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  ).then((evs) => evs.filter(Boolean));

  const purchasedCategoryIds = new Set(
    purchasedEvents.map((e) => e.categoryId).filter(Boolean)
  );
  const categoryName: Record<string, string> = {};
  purchasedEvents.forEach((e) => {
    if (e.categoryId && e.category?.name) categoryName[e.categoryId] = e.category.name;
  });

  const allEvents: any[] = await fetch('/api/backend/events')
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

  const seenIds: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  const now = new Date();

  const recommendationNotifs: Notification[] = allEvents
    .filter(
      (e) =>
        purchasedCategoryIds.has(e.categoryId) &&
        !purchasedEventIds.includes(e.id) &&
        !seenIds.includes(`rec_${e.id}`) &&
        new Date(e.eventDate) >= now
    )
    .map((e) => ({
      id: `rec_${e.id}`,
      date: e.createdAt,
      title: e.title,
      message: `Nuevo evento de ${categoryName[e.categoryId] ?? 'una categoría que te interesa'}.`,
      type: 'recommendation' as NotifType,
      href: `/eventos/${e.id}`,
    }));

  return [...cancelledNotifs, ...recommendationNotifs];
}

// ─── Notificaciones para el productor ────────────────────────────────────────

async function fetchProducerNotifications(seenIds: Set<string>): Promise<Notification[]> {
  const events: any[] = await fetch('/api/backend/events/producer', { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

  const notifications: Notification[] = [];

  for (const ev of events) {
    if (ev.status === 'REJECTED') {
      notifications.push({
        id: `suspended_${ev.id}`,
        date: ev.updatedAt ?? ev.createdAt,
        title: ev.title,
        message:
          'Tu evento fue suspendido temporalmente. Comunicate con el administrador para resolverlo.',
        type: 'suspended',
        href: 'mailto:adminhenry31@gmail.com',
      });
    } else if (
      ev.status === 'APPROVED' &&
      seenIds.has(`suspended_${ev.id}`) &&
      !seenIds.has(`reactivated_${ev.id}`)
    ) {
      notifications.push({
        id: `reactivated_${ev.id}`,
        date: ev.updatedAt ?? ev.createdAt,
        title: ev.title,
        message: 'Tu evento fue reactivado y ya está visible en la cartelera.',
        type: 'reactivated',
        href: '/producer/dashboard',
      });
    }
  }

  return notifications;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const { authenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const wasAuthenticated = useRef(false);

  const role = user?.role;
  const isUser = authenticated && role === 'user';
  const isProducer = authenticated && role === 'producer';

  // Limpiar localStorage solo al hacer logout explícito (no en carga inicial)
  useEffect(() => {
    if (wasAuthenticated.current && !authenticated) {
      localStorage.removeItem(SEEN_KEY);
      setSeenIds(new Set());
      setNotifications([]);
    }
    wasAuthenticated.current = !!authenticated;
  }, [authenticated]);

  // Cargar notificaciones al autenticarse
  useEffect(() => {
    if (!isUser && !isProducer) return;

    const stored: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    const storedSet = new Set(stored);
    setSeenIds(storedSet);

    const fetcher = isUser
      ? fetchUserNotifications
      : () => fetchProducerNotifications(storedSet);
    fetcher().then(setNotifications).catch(() => {});
  }, [isUser, isProducer]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!isUser && !isProducer) return null;

  const unread = notifications.filter((n) => !seenIds.has(n.id));

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread.length > 0) {
      const newSeen = new Set([...seenIds, ...notifications.map((n) => n.id)]);
      setSeenIds(newSeen);
      localStorage.setItem(SEEN_KEY, JSON.stringify([...newSeen]));
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        aria-label="Notificaciones"
        className="relative flex size-8 items-center justify-center border-2 border-border bg-surface text-text transition-colors hover:bg-surface-2"
      >
        <Bell size={15} />
        {unread.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center border border-border bg-red-600 text-[9px] font-black text-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 border-4 border-border bg-surface shadow-[4px_4px_0px_0px_var(--border)]">
          <div className="border-b-2 border-border px-4 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-soft">
              Notificaciones
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="font-mono text-[11px] font-bold uppercase text-text-soft">
                Sin notificaciones
              </p>
            </div>
          ) : (
            <ul className="max-h-72 divide-y-2 divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.href ?? '/'}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${
                        n.type === 'cancelled' || n.type === 'suspended'
                          ? 'bg-red-500'
                          : n.type === 'reactivated'
                            ? 'bg-green-500'
                            : 'bg-primary'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-black uppercase leading-tight text-text">
                        {n.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] leading-snug text-text-soft">
                        {n.message}
                      </p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-text-soft/50">
                        {new Date(n.date).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t-2 border-border px-4 py-2.5">
            <Link
              href={isProducer ? '/producer/dashboard' : '/mis-compras'}
              onClick={() => setOpen(false)}
              className="font-mono text-[10px] font-black uppercase tracking-wider text-primary hover:opacity-80"
            >
              {isProducer ? 'Ver mis eventos →' : 'Ver mis compras →'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
