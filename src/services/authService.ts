import { api } from '@/lib/apiClient';
import { saveTabSession } from '@/lib/tabSession';
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
  documentNumber?: string;
  allowNewsletter: boolean;
  role?: UserRole;
  profileImageUrl?: string;
  businessName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  user_role?: UserRole;
  profileImageUrl?: string | null;
  allowNewsletter?: boolean;
}

function fromSupabaseUser(supabaseUser: SupabaseUser): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: supabaseUser.name ?? undefined,
  };
}

function fromUserProfile(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    profileImageUrl: profile.profileImageUrl,
    allowNewsletter: profile.allowNewsletter,
  };
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
  async login(
    credentials: LoginDto,
  ): Promise<{ user: AuthUser; accessToken?: string; refreshToken?: string }> {
    const data = await api.post<LoginApiResponse>('/auth/login', credentials);

    if (data.accessToken) {
      saveTabSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }

    const profile = await fetchProfile(data.user.id);
    return {
      user: profile ?? fromSupabaseUser(data.user),
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  async register(
    dto: RegisterDto,
  ): Promise<{ user: AuthUser; accessToken?: string; refreshToken?: string }> {
    const data = await api.post<RegisterApiResponse>('/auth/register', dto);
    const loginData = await api.post<LoginApiResponse>('/auth/login', {
      email: dto.email,
      password: dto.password,
    });

    if (loginData.accessToken) {
      saveTabSession({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
      });
    }

    return {
      user: fromUserProfile(data.userProfile),
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
    };
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async getMe(): Promise<AuthUser | null> {
    const supabaseUser = await api.get<SupabaseUser>('/auth/me');
    if (!supabaseUser?.id) return null;
    return (await fetchProfile(supabaseUser.id)) ?? fromSupabaseUser(supabaseUser);
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout', {});
  },
};
