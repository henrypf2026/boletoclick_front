'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { authService } from '@/services/authService';
import { saveToken } from '@/lib/auth';
import { saveTabSession } from '@/lib/tabSession';
import { FormAlert } from '@/components/ui/FormField';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let handled = false;

    const processSession = async (session: { access_token: string; refresh_token?: string }) => {
      if (!mounted || handled) return;
      handled = true;
      try {
        const setRes = await fetch('/api/backend/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token: session.access_token }),
        });
        if (!setRes.ok) throw new Error('set-session failed');
        saveTabSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });
        const user = await authService.getMe();
        if (!mounted) return;
        if (!user || !user.role) {
          await supabase.auth.signOut();
          if (mounted) setError('No encontramos una cuenta registrada con ese correo. Registrate primero desde el formulario.');
          return;
        }
        saveToken(user.role);
        const destination = localStorage.getItem('oauth_redirect') || '/';
        localStorage.removeItem('oauth_redirect');
        window.location.href = destination;
      } catch {
        if (mounted) setError('No se pudo conectar con el servidor.');
      }
    };

    const run = async () => {
      // Paso 1: si createBrowserClient ya intercambió el code, la sesión existe
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (existing) {
        processSession(existing);
        return;
      }

      // Paso 2: intercambio explícito del code (más confiable en producción)
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (mounted) setError('No se pudo completar el inicio de sesión. Intentá de nuevo.');
          return;
        }
        if (data.session) {
          processSession(data.session);
          return;
        }
      }
    };

    run();

    // Respaldo: captura el SIGNED_IN si el exchange ocurre de forma asíncrona
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) processSession(session);
    });

    const timeout = setTimeout(() => {
      if (mounted && !handled) setError('No se pudo completar el inicio de sesión. Intentá de nuevo.');
    }, 10000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
        <div className="flex w-full max-w-md flex-col gap-4 text-center">
          <FormAlert message={error} />
          <Link href="/login" className="text-sm text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
      <p className="text-text-soft">Iniciando sesión...</p>
    </div>
  );
}
