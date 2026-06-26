"use client";

import { supabase } from "@/lib/supabaseClient";
import {
  clearTabSession,
  getTabAccessToken,
  getTabRefreshToken,
  saveTabSession,
} from "@/lib/tabSession";

let refreshInFlight: Promise<string | null> | null = null;

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(
  token: string,
  bufferSeconds = 60,
): boolean {
  const exp = decodeJwtExp(token);
  if (!exp) return false;
  return Date.now() >= (exp - bufferSeconds) * 1000;
}

async function syncBackendSession(accessToken: string): Promise<void> {
  try {
    await fetch("/api/backend/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ access_token: accessToken }),
    });
  } catch {
    // La cookie es respaldo; el Bearer sigue siendo la fuente principal.
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getTabRefreshToken();

    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (!error && data.session?.access_token) {
        saveTabSession({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        });
        await syncBackendSession(data.session.access_token);
        return data.session.access_token;
      }
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      saveTabSession({
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
      });
      await syncBackendSession(sessionData.session.access_token);
      return sessionData.session.access_token;
    }

    return null;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const current = getTabAccessToken();
  if (current && !isAccessTokenExpired(current)) {
    return current;
  }
  return refreshAccessToken();
}

export function clearSessionAndRedirectToLogin(): void {
  clearTabSession();
  void supabase.auth.signOut();
  if (typeof window !== "undefined") {
    const returnTo = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/login?from=${returnTo}&expired=1`;
  }
}
