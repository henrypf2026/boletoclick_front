import { api } from '@/lib/apiClient';
import type {
  LoginApiResponse,
  RegisterApiResponse,
  SupabaseUser,
  UserProfile,
  UserRole,
} from '@/types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  documentNumber: string;
  allowNewsletter: boolean;
  profileImageUrl?: string;
  businessName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
}

function fromSupabaseUser(supabaseUser: SupabaseUser): AuthUser {
  return { id: supabaseUser.id, email: supabaseUser.email ?? '' };
}

function fromUserProfile(profile: UserProfile): AuthUser {
  return { id: profile.id, email: profile.email, name: profile.name, role: profile.role };
}

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  try {
    const profile = await api.get<UserProfile>(`/users/${userId}`);
    return fromUserProfile(profile);
  } catch {
    return null;
  }
}

export const authService = {
  async login(credentials: LoginDto): Promise<{ token: string; user: AuthUser }> {
    const data = await api.post<LoginApiResponse>('/auth/login', credentials);
    const profile = await fetchProfile(data.user.id);
    return { token: data.access_token, user: profile ?? fromSupabaseUser(data.user) };
  },

  async register(dto: RegisterDto): Promise<{ token: string; user: AuthUser }> {
    const data = await api.post<RegisterApiResponse>('/auth/register', dto);
    return { token: data.session.access_token, user: fromUserProfile(data.userProfile) };
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async getMe(token: string): Promise<AuthUser | null> {
    const supabaseUser = await api.get<SupabaseUser>('/auth/me', token);
    if (!supabaseUser?.id) return null;
    return (await fetchProfile(supabaseUser.id)) ?? fromSupabaseUser(supabaseUser);
  },
};
