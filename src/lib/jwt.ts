'use client';

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET || 'boletoclick-dev-secret',
);

const TOKEN_EXPIRATION = '7d';

export async function createToken(user: { id: string; name: string; email: string }) {
  return new SignJWT({ name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    id: payload.sub as string,
    name: payload.name as string,
    email: payload.email as string,
  };
}
