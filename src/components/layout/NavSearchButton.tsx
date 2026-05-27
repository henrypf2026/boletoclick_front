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
    <div ref={containerRef} className="flex items-center flex-row-reverse">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Cerrar búsqueda' : 'Buscar eventos'}
        aria-expanded={isOpen}
        className="flex items-center justify-center size-9 rounded-md text-text-soft hover:text-text hover:bg-surface-2 transition-colors duration-150"
      >
        {isOpen ? <CloseIcon /> : <SearchIcon />}
      </button>

      {/* Input que se expande hacia la izquierda */}
      <div
        aria-hidden={!isOpen}
        style={{
          width: isOpen ? '220px' : '0',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'width 300ms cubic-bezier(0.25, 1, 0.5, 1), opacity 150ms ease',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar eventos, artistas..."
          tabIndex={isOpen ? 0 : -1}
          className="block w-full h-9 pl-3 pr-2 text-sm bg-surface-2 text-text placeholder:text-text-soft rounded-md border border-transparent focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
  )
}
