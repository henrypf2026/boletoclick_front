'use client'

import { useState, useRef, useEffect } from 'react'

function SearchIcon() {
  return (
    <svg
      width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export default function NavSearchButton() {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Cerrar búsqueda' : 'Buscar eventos'}
        aria-expanded={isOpen}
        className="flex items-center justify-center size-9 border-2 border-border text-text-soft hover:text-text hover:bg-surface-2 transition-colors duration-100"
      >
        {isOpen ? <CloseIcon /> : <SearchIcon />}
      </button>

      <div
        role="search"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 150ms ease, transform 150ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        className="absolute right-0 top-full mt-3 w-[min(18rem,calc(100vw-1.5rem))] border-4 border-border bg-surface p-3 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar eventos, artistas..."
          tabIndex={isOpen ? 0 : -1}
          className="w-full h-9 px-3 text-sm bg-surface-2 text-text placeholder:text-text-soft border-2 border-border focus:outline-none focus:border-primary transition-colors duration-100"
        />
        <p className="mt-2 text-xs text-text-soft font-bold uppercase tracking-wider">
          Esc para cerrar
        </p>
      </div>
    </div>
  )
}
