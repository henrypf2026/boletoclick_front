export type UserRole = 'user' | 'producer' | 'admin';

// Perfil del usuario en nuestra DB (id es el UUID de Supabase)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  birthDate: string;
  documentNumber: string | null;
  allowNewsletter: boolean;
  profileImageUrl: string | null;
  businessName: string | null;
  createdAt: string;
  updatedAt: string;
}

// Objeto que devuelve GET /auth/me — incluye metadatos de Google cuando el provider es OAuth
export interface SupabaseUser {
  id: string;
  email: string;
  provider?: string;
  name?: string | null;
  avatarUrl?: string | null;
  aud?: string;
  role?: string;
}

export interface LoginApiResponse {
  message: string;
  user: SupabaseUser;
  session: { access_token: string };
  access_token: string;
}

export interface RegisterApiResponse {
  message: string;
  user: SupabaseUser;
  userProfile: UserProfile;
  session: { access_token: string };
}
