"use client";

import { useState, useEffect } from "react";

const BASE_OFFSET = 24;

export function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(BASE_OFFSET);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode, mounted]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const updateOffset = () => {
      const footerTop = footer.getBoundingClientRect().top;
      const overlap = window.innerHeight - footerTop;
      setBottomOffset(overlap > 0 ? overlap + BASE_OFFSET : BASE_OFFSET);
    };

    window.addEventListener("scroll", updateOffset, { passive: true });
    window.addEventListener("resize", updateOffset, { passive: true });
    updateOffset();

    return () => {
      window.removeEventListener("scroll", updateOffset);
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{ bottom: `${bottomOffset}px` }}
      className="fixed right-4 z-50 cursor-pointer border-4 border-black bg-accent px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-[bottom,box-shadow,transform] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] sm:right-6 sm:px-4 sm:py-3 sm:text-xs"
    >
      <span className="sm:hidden">{darkMode ? '☀️' : '🌙'}</span>
      <span className="hidden sm:inline">{darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}</span>
    </button>
  );
}

export function NavDarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode, mounted]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
      className="flex items-center justify-center size-9 border-2 border-border text-text-soft hover:text-text hover:bg-surface-2 transition-colors duration-100"
    >
      {darkMode ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}

export default DarkModeToggle;
