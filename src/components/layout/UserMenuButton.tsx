'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserMenuButton() {
  const { authenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-bold text-text-soft lg:inline">
          Hola, {(user.name ?? user.email.split('@')[0]).split(' ')[0]}
        </span>
        <Link
          href="/mis-tickets"
          className="hidden sm:flex items-center h-9 px-3 text-sm font-bold text-text border-2 border-border hover:bg-surface-2 transition-colors duration-100 whitespace-nowrap"
        >
          Mis entradas
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center h-9 px-3 text-sm font-bold text-text border-2 border-border hover:bg-surface-2 transition-colors duration-100 whitespace-nowrap"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="hidden sm:flex items-center h-9 px-3 text-sm font-bold text-text border-2 border-border hover:bg-surface-2 transition-colors duration-100 whitespace-nowrap"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/registro"
        className="flex items-center h-9 px-4 bg-primary text-background text-sm font-black border-2 border-border shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] transition-all duration-100 whitespace-nowrap"
      >
        Registrarme
      </Link>
    </div>
  );
}
