"use client";

import { COUNTRY_LABELS, type SupportedCountry } from "@/lib/geo/country";
import { useCountryFilter } from "@/context/CountryFilterContext";

export default function CountryEventsBanner() {
  const { userCountry, isDetecting, showAllEvents, setShowAllEvents } =
    useCountryFilter();

  if (isDetecting || userCountry === "ALL") {
    return null;
  }

  const countryLabel = COUNTRY_LABELS[userCountry as SupportedCountry];

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border-2 border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-text">
        {showAllEvents ? (
          <>Estás viendo eventos de todos los países.</>
        ) : (
          <>
            Mostrando eventos en{" "}
            <strong className="font-black text-text">{countryLabel}</strong> según
            tu ubicación.
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => setShowAllEvents(!showAllEvents)}
        className="shrink-0 rounded-lg border-2 border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-wider text-primary transition hover:bg-primary hover:text-background"
      >
        {showAllEvents
          ? `Ver solo eventos de ${countryLabel}`
          : "Ver todos los eventos"}
      </button>
    </div>
  );
}
