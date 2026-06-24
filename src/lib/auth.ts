'use client';

import { authService } from '@/services/authService';
import type { UserRole } from '@/types';

const ROLE_KEY = 'user_role';
const TICKETS_KEY = 'boletoclick_tickets';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;


  profileImageUrl?: string | null;
  allowNewsletter?: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  date: string;
  time: string;
  zone: string;
  quantity: number;
  total: number;
  qrCode: string;
  purchasedAt: string;
}

export function saveToken(role?: UserRole): void {
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
    document.cookie = `${ROLE_KEY}=${role}; path=/; SameSite=Strict; max-age=${COOKIE_MAX_AGE}`;
  }
}

export function clearToken(): void {
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(TICKETS_KEY);
  localStorage.removeItem('boletoclick_purchased_tickets');
  localStorage.removeItem('oauth_redirect');
  Object.keys(localStorage)
    .filter((key) => key.startsWith('checkoutSession_') || key.startsWith('mapbox.'))
    .forEach((key) => localStorage.removeItem(key));
  document.cookie = `${ROLE_KEY}=; path=/; max-age=0`;
}

export async function getUserFromToken(): Promise<User | null> {
  try {
    const user = await authService.getMe();
    if (!user) {
      clearToken();
      return null;
    }
    return user;
  } catch {
    clearToken();
    return null;
  }
}

// --- Tickets (mock hasta Sprint 2) ---

export function getTicketsByUser(userId: string): Ticket[] {
  const raw = localStorage.getItem(TICKETS_KEY);
  const tickets: Ticket[] = raw ? JSON.parse(raw) : [];
  return tickets.filter((t) => t.userId === userId);
}

export function saveTicket(ticket: Ticket): Ticket {
  const raw = localStorage.getItem(TICKETS_KEY);
  const tickets: Ticket[] = raw ? JSON.parse(raw) : [];
  tickets.push(ticket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  return ticket;
}
