"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  detectCountryFromCoordinates,
  getUserCoordinates,
  type UserCountry,
} from "@/lib/geo/country";

interface CountryFilterContextValue {
  userCountry: UserCountry;
  isDetecting: boolean;
  showAllEvents: boolean;
  setShowAllEvents: (value: boolean) => void;
}

const CountryFilterContext = createContext<CountryFilterContextValue | null>(
  null,
);

export function CountryFilterProvider({ children }: { children: ReactNode }) {
  const [userCountry, setUserCountry] = useState<UserCountry>("ALL");
  const [isDetecting, setIsDetecting] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    let active = true;

    void getUserCoordinates().then((coords) => {
      if (!active) return;

      if (coords) {
        setUserCountry(
          detectCountryFromCoordinates(coords.lat, coords.lng),
        );
      } else {
        setUserCountry("ALL");
      }

      setIsDetecting(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      userCountry,
      isDetecting,
      showAllEvents,
      setShowAllEvents,
    }),
    [userCountry, isDetecting, showAllEvents],
  );

  return (
    <CountryFilterContext.Provider value={value}>
      {children}
    </CountryFilterContext.Provider>
  );
}

export function useCountryFilter() {
  const context = useContext(CountryFilterContext);

  if (!context) {
    throw new Error("useCountryFilter debe usarse dentro de CountryFilterProvider");
  }

  return context;
}
