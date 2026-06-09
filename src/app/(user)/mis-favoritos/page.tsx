'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/lib/auth';
import { favoritesService, type FavoriteEvent } from '@/services/favoritesService';

export default function MisFavoritosPage() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!authenticated) {
      router.push('/login?from=/mis-favoritos');
      return;
    }

    const token = getToken();
    if (!token) return;

    favoritesService.getAll(token)
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setLoadingFavorites(false));
  }, [authenticated, loading, router]);

  if (loading || loadingFavorites) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-soft">Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 border-b-4 border-text pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-text">
          Mis Favoritos
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Eventos que guardaste para no perderte.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!error && favorites.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-4xl">♡</p>
          <p className="font-bold text-text">No tenés eventos guardados todavía.</p>
          <Link
            href="/eventos"
            className="border-2 border-border bg-primary px-4 py-2 text-sm font-black uppercase text-background hover:opacity-90 transition-opacity"
          >
            Ver eventos
          </Link>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={`/eventos/${fav.eventId}`}
              className="flex flex-col gap-2 border-4 border-border bg-surface p-4 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              <span className="text-[11px] font-black uppercase tracking-widest text-text-soft">
                {fav.event.category?.name ?? 'Evento'}
              </span>
              <h2 className="font-black uppercase tracking-tight text-text line-clamp-2">
                {fav.event.title}
              </h2>
              {fav.event.venue && (
                <p className="text-sm text-text-soft truncate">
                  {fav.event.venue.name}{fav.event.venue.city ? ` · ${fav.event.venue.city}` : ''}
                </p>
              )}
              <p className="text-xs text-text-soft">
                {new Date(fav.event.eventDate).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
