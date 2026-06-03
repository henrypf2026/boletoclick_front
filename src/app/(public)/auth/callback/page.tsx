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
    const handleCallback = async () => {
      // Supabase puede haber procesado el redirect automáticamente — intentamos getSession primero
      let session = (await supabase.auth.getSession()).data.session;

      // Si no hay sesión todavía, intentamos el intercambio manual con el code de la URL
      if (!session) {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
          setError('El enlace no es válido o ya fue utilizado.');
          return;
        }
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError || !data.session) {
          setError('No se pudo completar el inicio de sesión. Intentá de nuevo.');
          return;
        }
        session = data.session;
      }

      const user = await authService.getMe(session.access_token);

      // Si el usuario no tiene perfil en el back (no se registró por el formulario),
      // getMe devuelve solo email sin name ni role — bloqueamos el acceso.
      if (!user || !user.name) {
        await supabase.auth.signOut();
        setError('No encontramos una cuenta registrada con ese correo. Registrate primero desde el formulario.');
        return;
      }

      saveToken(session.access_token, user.role);
      // Recarga completa para que AuthContext lea el token nuevo desde cero
      window.location.href = '/';
    };

    handleCallback();
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
