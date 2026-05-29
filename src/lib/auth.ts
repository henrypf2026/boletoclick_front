'use client';

import { authService } from '@/services/authService';
import type { UserRole } from '@/types';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'user_role';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
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

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string, role?: UserRole): void {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict; max-age=${COOKIE_MAX_AGE}`;
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
    document.cookie = `${ROLE_KEY}=${role}; path=/; SameSite=Strict; max-age=${COOKIE_MAX_AGE}`;
  }
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${ROLE_KEY}=; path=/; max-age=0`;
}

export async function getUserFromToken(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  const user = await authService.getMe(token);
  if (!user) {
    clearToken();
    return null;
  }
  return user;
}

// --- Tickets (mock hasta Sprint 2) ---

const TICKETS_KEY = 'boletoclick_tickets';

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
