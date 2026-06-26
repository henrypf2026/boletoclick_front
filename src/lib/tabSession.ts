import type { UserRole } from "@/types";

const ACCESS_TOKEN_KEY = "bc_tab_access_token";
const REFRESH_TOKEN_KEY = "bc_tab_refresh_token";
const ROLE_KEY = "bc_tab_user_role";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined";
}

export interface TabSessionData {
  accessToken: string;
  refreshToken?: string;
  role?: UserRole;
}

export function saveTabSession(data: Partial<TabSessionData> & { accessToken?: string }): void {
  if (!canUseSessionStorage()) return;
  if (data.accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  }
  if (data.refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  }
  if (data.role) {
    sessionStorage.setItem(ROLE_KEY, data.role);
  }
}

export function getTabAccessToken(): string | null {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getTabRefreshToken(): string | null {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getTabRole(): UserRole | null {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(ROLE_KEY) as UserRole | null;
}

export function clearTabSession(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
}
