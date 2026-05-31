'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkItem {
  href: string
  label: string
}

function HamburgerIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" x2="20" y1="7" y2="7" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="17" y2="17" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export default function MobileMenu({ navLinks }: { navLinks: NavLinkItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Cierra al navegar
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Bloquea scroll del body mientras está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
        className="flex items-center justify-center size-9 rounded-md text-text-soft hover:text-text hover:bg-surface-2 transition-colors duration-150"
      >
        <HamburgerIcon />
      </button>

      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-40 bg-text/25 backdrop-blur-sm"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-surface flex flex-col shadow-2xl"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-2 shrink-0">
          <span className="font-semibold text-[15px] tracking-tight text-text">
            Boleto<span className="text-primary">Click</span>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
            className="flex items-center justify-center size-9 rounded-md text-text-soft hover:text-text hover:bg-surface-2 transition-colors duration-150"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col px-3 pt-4 pb-2 gap-0.5">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center h-11 px-3 text-sm font-medium rounded-md transition-colors duration-150',
                  isActive
                    ? 'text-primary bg-surface-2'
                    : 'text-text-soft hover:text-primary hover:bg-primary/10',
                ].join(' ')}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="h-px bg-surface-2 mx-4 my-1" />

        <div className="px-4 py-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft pointer-events-none">
              <svg
                width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar eventos, artistas..."
              className="w-full h-10 pl-9 pr-3 text-sm bg-surface-2 text-text placeholder:text-text-soft rounded-md border border-transparent focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="mt-auto px-4 pb-8 pt-4">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center h-11 w-full bg-primary hover:bg-primary-deep text-white text-sm font-semibold rounded-md transition-colors duration-150"
          >
            Ingresar a tu cuenta
          </Link>
        </div>
      </div>
    </>
  )
}
