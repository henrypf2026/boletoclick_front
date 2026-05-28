import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.VITE_JWT_SECRET || 'boletoclick-dev-secret',
);

const TOKEN_EXPIRATION = '7d';

export async function createToken(user) {
  return new SignJWT({
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, JWT_SECRET);

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
  };
}
