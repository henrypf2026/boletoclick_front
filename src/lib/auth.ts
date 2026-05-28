'use client';

import { createToken, verifyToken } from './jwt';

const TOKEN_KEY = 'auth_token';
const USERS_KEY = 'boletoclick_users';
const TICKETS_KEY = 'boletoclick_tickets';

export interface User {
  id: string;
  name: string;
  email: string;
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
  return localStorage.getItem(TOKEN_KEY);
}

export async function getUserFromToken(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    clearToken();
    return null;
  }
}

export async function setSession(user: User): Promise<string> {
  const token = await createToken(user);
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getUsers(): (User & { password: string; verified: boolean; createdAt: string })[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: (User & { password: string; verified: boolean; createdAt: string })[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser({ name, email, password }: { name: string; email: string; password: string }): User {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error('Ya existe una cuenta con este correo.');
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    verified: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

export function loginUser({ email, password }: { email: string; password: string }): User {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail && u.password === password);

  if (!user) throw new Error('Correo o contraseña incorrectos.');

  return { id: user.id, name: user.name, email: user.email };
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
