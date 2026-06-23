'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getDirectionsUrl, getMapboxToken, normalizeCoordinates, type GeoCoordinates } from '@/lib/geo/mapbox';

interface EventMapProps {
  coordinates: GeoCoordinates;
  venue: string;
  city: string;
  address?: string;
}

export default function EventMap({ coordinates, venue, city, address }: EventMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const token = getMapboxToken();
  const coords = normalizeCoordinates(coordinates);
  const directionsUrl = getDirectionsUrl(coords, `${venue}, ${city}`);

  useEffect(() => {
    if (!token || !containerRef.current || !coords) {
      return undefined;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [coords.lng, coords.lat],
      zoom: 14,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    const marker = new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([coords.lng, coords.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 24 }).setHTML(
          `<strong>${venue}</strong><br/>${address ? `${address}<br/>` : ''}${city}`,
        ),
      )
      .addTo(map);

    marker.togglePopup();

    map.resize();

    return () => {
      map.remove();
    };
  }, [coords?.lat, coords?.lng, venue, city, address, token]);

  if (!coords) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-soft">{address ? `${address}, ${city}` : city}</p>
        <a
          href={getDirectionsUrl(null, `${venue}, ${city}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-primary hover:underline"
        >
          Cómo llegar al recinto →
        </a>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-400">
        Agrega <code className="text-white">NEXT_PUBLIC_MAPBOX_TOKEN</code> en{' '}
        <code className="text-white">.env.local</code> para ver el mapa del recinto.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <style>{`
        .bc-map .mapboxgl-popup-content {
          color: #171717 !important;
          background: #ffffff !important;
        }
        .bc-map .mapboxgl-popup-tip {
          border-top-color: #ffffff !important;
          border-bottom-color: #ffffff !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="bc-map h-64 w-full min-h-[16rem] overflow-hidden rounded-xl border border-border md:h-80"
        aria-label={`Mapa de ${venue}, ${city}`}
      />
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-primary hover:underline"
      >
        Cómo llegar al recinto →
      </a>
    </div>
  );
}
