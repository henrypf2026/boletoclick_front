"use client";

import { useState, useEffect } from "react";

const BASE_OFFSET = 24; // equivalente a bottom-6

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(BASE_OFFSET);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

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
