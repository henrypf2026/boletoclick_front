export type GeoCoordinates = {
  lat: number;
  lng: number;
};

export function getMapboxToken() {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
}

export function getDirectionsUrl(coordinates: GeoCoordinates, label?: string) {
  const { lat, lng } = coordinates;
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
