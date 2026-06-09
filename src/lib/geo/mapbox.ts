export type GeoCoordinates = {
  lat: number;
  lng: number;
};

export function normalizeCoordinates(
  coords?: { lat: number | string; lng: number | string } | null,
): GeoCoordinates | undefined {
  if (!coords) return undefined;
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return undefined;
  return { lat, lng };
}

export function getMapboxToken() {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
}

export function getDirectionsUrl(
  coordinates?: GeoCoordinates | null,
  label?: string,
) {
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
  }
  if (!coordinates) return 'https://www.google.com/maps';
  const { lat, lng } = coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
