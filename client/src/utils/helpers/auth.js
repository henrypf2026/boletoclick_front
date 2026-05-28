import { createToken, verifyToken } from './jwt';

const TOKEN_KEY = 'auth_token';
const USERS_KEY = 'boletoclick_users';
const TICKETS_KEY = 'boletoclick_tickets';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function getUserFromToken() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    return await verifyToken(token);
  } catch {
    clearToken();
    return null;
  }
}

export async function setSession(user) {
  const token = await createToken(user);
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function isAuthenticated() {
  const user = await getUserFromToken();
  return Boolean(user);
}

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser({ name, email, password }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
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

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
}

export function loginUser({ email, password }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === password,
  );

  if (!user) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function getTicketsByUser(userId) {
  const raw = localStorage.getItem(TICKETS_KEY);
  const tickets = raw ? JSON.parse(raw) : [];
  return tickets.filter((ticket) => ticket.userId === userId);
}

export function saveTicket(ticket) {
  const raw = localStorage.getItem(TICKETS_KEY);
  const tickets = raw ? JSON.parse(raw) : [];
  tickets.push(ticket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  return ticket;
}
