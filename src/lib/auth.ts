"use client";

import { authService } from "@/services/authService";
import {
  clearTabSession,
  getTabAccessToken,
  getTabRole,
  saveTabSession,
} from "@/lib/tabSession";
import type { UserRole } from "@/types";

const TICKETS_KEY = "boletoclick_tickets";

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
    saveTabSession({ role });
  }
}

export function clearToken(): void {
  clearTabSession();
}

export async function getUserFromToken(): Promise<User | null> {
  if (!getTabAccessToken()) {
    return null;
  }

  try {
    const user = await authService.getMe();
    if (!user) {
      clearToken();
      return null;
    }

    const role = user.role ?? getTabRole() ?? undefined;
    if (role) {
      saveTabSession({
        accessToken: getTabAccessToken() ?? "",
        role,
      });
    }

    if ((user as { user_role?: UserRole }).user_role && !user.role) {
      user.role = (user as { user_role?: UserRole }).user_role;
    }

    return user;
  } catch {
    clearToken();
    return null;
  }
}

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
