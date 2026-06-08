'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert } from 'flowbite-react';
import { supabase } from '@/lib/supabaseClient';
import { authService } from '@/services/authService';
import { saveToken } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      setError('El enlace no es válido o ya fue utilizado.');
      return;
    }

    let handled = false;

    const processSession = async (session: { access_token: string }) => {
      if (handled) return;
      handled = true;

      const user = await authService.getMe(session.access_token);
      if (!user || !user.name) {
        await supabase.auth.signOut();
        setError('No encontramos una cuenta registrada con ese correo. Registrate primero desde el formulario.');
        return;
      }

      saveToken(session.access_token, user.role);
      window.location.href = '/';
    };

    // Caso 1: Supabase ya procesó el code antes de que el listener se suscriba
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) processSession(session);
    });

    // Caso 2: el exchange ocurre después de montar el componente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) processSession(session);
    });

    const timeout = setTimeout(() => {
      if (!handled) setError('No se pudo completar el inicio de sesión. Intentá de nuevo.');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
        <div className="flex w-full max-w-md flex-col gap-4 text-center">
          <Alert color="failure">{error}</Alert>
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
