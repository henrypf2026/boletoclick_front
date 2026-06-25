'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserMenuButton() {
  const { authenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authenticated && user) {
    const dashboardHref = user.role === 'producer' ? '/producer/dashboard' : '/dashboard-user';
    const dashboardLabel = user.role === 'producer' ? 'Mi Dashboard' : 'Mi Cuenta';
    const firstName = (user.name ?? user.email.split('@')[0]).split(' ')[0];

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/perfil"
          className="hidden text-sm font-bold text-text-soft transition-colors hover:text-text lg:inline"
        >
          Hola, {firstName}
        </Link>
        <Link
          href={dashboardHref}
          className="hidden sm:flex items-center h-9 px-3 text-sm font-bold text-text border-2 border-border hover:bg-surface-2 transition-colors duration-100 whitespace-nowrap"
        >
          {dashboardLabel}
        </Link>
        {user.role?.toLowerCase() !== 'producer' && user.role?.toLowerCase() !== 'admin' && (
          <Link
            href="/mis-favoritos"
            className="hidden sm:flex items-center h-9 px-3 text-sm font-bold text-red-500 border-2 border-border hover:bg-surface-2 transition-colors duration-100 whitespace-nowrap"
            aria-label="Mis favoritos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center h-9 px-3 text-sm font-black whitespace-nowrap border-2 border-border bg-primary text-background shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] transition-all duration-100 hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
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
        className="flex h-9 items-center border-2 border-border bg-primary px-3 text-sm font-black whitespace-nowrap text-background shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] transition-all duration-100 hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] sm:px-4"
      >
        <span className="sm:hidden">Registro</span>
        <span className="hidden sm:inline">Registrarme</span>
      </Link>
    </div>
  );
}
