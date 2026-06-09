import { getToken } from '@/lib/auth';
import { normalizeCoordinates } from '@/lib/geo/mapbox';
import { createTicketQrUrl, normalizeQrUrl, type TicketQrData } from '@/lib/ticketQr';
import type { Event, Zone } from '@/mocks/events';

const LOCAL_TICKETS_KEY = 'boletoclick_purchased_tickets';

export interface ApiTicket {
  id: string;
  qrCode: string;
  allowEntrance: boolean;
  usedAt: string | null;
  createdAt: string;
  eventTitle?: string;
  ticketType: {
    id: string;
    name: string;
    price: number;
    zone: string | null;
  };
  order: {
    id: string;
    total: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    createdAt: string;
  };
}

interface StoredTicket extends TicketQrData {
  userId: string;
  qrCode: string;
  price: number;
}

function readLocalTickets(): StoredTicket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_KEY);
    return raw ? (JSON.parse(raw) as StoredTicket[]) : [];
  } catch {
    return [];
  }
}

function writeLocalTickets(tickets: StoredTicket[]): void {
  localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(tickets));
}

function upsertLocalTickets(newTickets: StoredTicket[]): void {
  const existing = readLocalTickets();
  const map = new Map(existing.map((ticket) => [ticket.id, ticket]));

  for (const ticket of newTickets) {
    map.set(ticket.id, ticket);
  }

  writeLocalTickets(Array.from(map.values()));
}

export interface StoredTicketView extends TicketQrData {
  qrCode: string;
}

export function getStoredTicketById(ticketId: string): StoredTicketView | null {
  const stored = readLocalTickets().find((ticket) => ticket.id === ticketId);
  if (!stored) return null;
  return {
    id: stored.id,
    eventId: stored.eventId,
    eventTitle: stored.eventTitle,
    venue: stored.venue,
    city: stored.city,
    address: stored.address,
    coordinates: stored.coordinates,
    date: stored.date,
    time: stored.time,
    zone: stored.zone,
    ticketTypeId: stored.ticketTypeId,
    ticketTypeName: stored.ticketTypeName,
    quantity: stored.quantity,
    total: stored.total,
    purchasedAt: stored.purchasedAt,
    qrCode: stored.qrCode,
  };
}

function toApiTicket(stored: StoredTicket): ApiTicket {
  const qrCode = normalizeQrUrl(stored.qrCode);
  return {
    id: stored.id,
    qrCode,
    allowEntrance: true,
    usedAt: null,
    createdAt: stored.purchasedAt,
    eventTitle: stored.eventTitle,
    ticketType: {
      id: stored.ticketTypeId,
      name: stored.ticketTypeName,
      price: stored.price,
      zone: stored.zone,
    },
    order: {
      id: stored.id,
      total: stored.total,
      status: 'PAID',
      createdAt: stored.purchasedAt,
    },
  };
}

function buildStoredTicket(
  userId: string,
  ticketId: string,
  event: Event,
  zone: Zone,
  unitPrice: number,
  ticketTotal: number,
  purchasedAt: string,
  origin: string,
): StoredTicket {
  const qrData: TicketQrData = {
    id: ticketId,
    eventId: event.id,
    eventTitle: event.title,
    venue: event.venue,
    city: event.city,
    address: event.address,
    coordinates: normalizeCoordinates(event.coordinates),
    date: event.date,
    time: event.time,
    zone: zone.zone,
    ticketTypeId: zone.ticketTypeId,
    ticketTypeName: zone.name,
    quantity: 1,
    total: ticketTotal,
    purchasedAt,
  };

  return {
    ...qrData,
    userId,
    price: unitPrice,
    qrCode: createTicketQrUrl(origin, qrData),
  };
}

function mergeTicketWithLocal(
  apiTicket: ApiTicket,
  userId: string,
): ApiTicket {
  const stored = readLocalTickets().find(
    (ticket) => ticket.id === apiTicket.id && ticket.userId === userId,
  );

  if (stored) {
    return {
      ...apiTicket,
      qrCode: normalizeQrUrl(stored.qrCode),
      eventTitle: stored.eventTitle,
      ticketType: {
        ...apiTicket.ticketType,
        zone: stored.zone ?? apiTicket.ticketType.zone,
        name: stored.ticketTypeName ?? apiTicket.ticketType.name,
      },
    };
  }

  return apiTicket;
}

function enrichApiTicketsFromPurchase(
  apiTickets: ApiTicket[],
  userId: string,
  event: Event,
  zone: Zone,
  orderId: string,
  total: number,
): ApiTicket[] {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const purchasedAt = new Date().toISOString();
  const unitPrice = zone.price;
  const orderTickets = apiTickets.filter((ticket) => ticket.order?.id === orderId);

  if (orderTickets.length === 0) return apiTickets;

  const storedBatch: StoredTicket[] = orderTickets.map((ticket) => {
    const ticketTotal =
      orderTickets.length === 1 ? total : unitPrice;

    return buildStoredTicket(
      userId,
      ticket.id,
      event,
      zone,
      unitPrice,
      ticketTotal,
      ticket.createdAt ?? purchasedAt,
      origin,
    );
  });

  upsertLocalTickets(storedBatch);

  return apiTickets.map((ticket) => {
    const enriched = storedBatch.find((stored) => stored.id === ticket.id);
    if (!enriched) return ticket;

    return {
      ...ticket,
      qrCode: enriched.qrCode,
      eventTitle: enriched.eventTitle,
      ticketType: {
        ...ticket.ticketType,
        zone: enriched.zone,
        name: enriched.ticketTypeName,
      },
    };
  });
}

export interface PurchaseInput {
  userId: string;
  event: Event;
  zone: Zone;
  quantity: number;
  total: number;
}

export const ticketService = {
  async getMyTickets(userId: string): Promise<ApiTicket[]> {
    const token = getToken();
    let apiTickets: ApiTicket[] = [];

    if (token) {
      try {
        const res = await fetch('/api/backend/tickets/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          apiTickets = (await res.json()) as ApiTicket[];
          apiTickets = apiTickets.map((ticket) => mergeTicketWithLocal(ticket, userId));
        }
      } catch {
        // Fallback a tickets locales
      }
    }

    const localTickets = readLocalTickets()
      .filter((ticket) => ticket.userId === userId)
      .map(toApiTicket);

    const apiIds = new Set(apiTickets.map((ticket) => ticket.id));
    const merged = [
      ...apiTickets,
      ...localTickets.filter((ticket) => !apiIds.has(ticket.id)),
    ];

    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async purchaseTickets(input: PurchaseInput): Promise<ApiTicket[]> {
    const token = getToken();
    const { userId, event, zone, quantity, total } = input;

    if (token) {
      try {
        const res = await fetch('/api/backend/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticketTypeId: zone.ticketTypeId,
            quantity,
          }),
        });

        if (res.ok) {
          const order = (await res.json()) as { id: string };
          const allTickets = await this.getMyTickets(userId);
          const enriched = enrichApiTicketsFromPurchase(
            allTickets,
            userId,
            event,
            zone,
            order.id,
            total,
          );

          return enriched
            .filter((ticket) => ticket.order?.id === order.id)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
        }
      } catch {
        // Continúa con persistencia local
      }
    }

    const unitPrice = zone.price;
    const purchasedAt = new Date().toISOString();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const created: StoredTicket[] = [];

    for (let i = 0; i < quantity; i += 1) {
      const ticketId = crypto.randomUUID();
      const ticketTotal = quantity === 1 ? total : unitPrice;

      created.push(
        buildStoredTicket(
          userId,
          ticketId,
          event,
          zone,
          unitPrice,
          ticketTotal,
          purchasedAt,
          origin,
        ),
      );
    }

    upsertLocalTickets(created);

    return created.map(toApiTicket);
  },
};
