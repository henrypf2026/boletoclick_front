export type SupportedCountry = "MX" | "CO" | "AR";

export type UserCountry = SupportedCountry | "ALL";

export const COUNTRY_LABELS: Record<SupportedCountry, string> = {
  MX: "México",
  CO: "Colombia",
  AR: "Argentina",
};

type Bounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

const COUNTRY_BOUNDS: Record<SupportedCountry, Bounds> = {
  MX: { minLat: 14.5, maxLat: 32.8, minLng: -118.5, maxLng: -86.7 },
  CO: { minLat: -4.5, maxLat: 13.5, minLng: -79.5, maxLng: -66.5 },
  AR: { minLat: -55.2, maxLat: -21.8, minLng: -73.6, maxLng: -53.6 },
};

function isInsideBounds(lat: number, lng: number, bounds: Bounds): boolean {
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}

export function detectCountryFromCoordinates(
  lat: number,
  lng: number,
): UserCountry {
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return "ALL";
  }

  const matches: SupportedCountry[] = [];

  (Object.keys(COUNTRY_BOUNDS) as SupportedCountry[]).forEach((country) => {
    if (isInsideBounds(lat, lng, COUNTRY_BOUNDS[country])) {
      matches.push(country);
    }
  });

  if (matches.length === 1) {
    return matches[0];
  }

  return "ALL";
}

export function inferEventCountry(
  lat: number,
  lng: number,
): SupportedCountry | null {
  const detected = detectCountryFromCoordinates(lat, lng);
  return detected === "ALL" ? null : detected;
}

export function filterEventsByCountry<T extends { country: SupportedCountry | null }>(
  events: T[],
  userCountry: UserCountry,
  showAllEvents: boolean,
): T[] {
  if (showAllEvents || userCountry === "ALL") {
    return events;
  }

  return events.filter((event) => event.country === userCountry);
}

export function getUserCoordinates(): Promise<{
  lat: number;
  lng: number;
} | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  });
}
