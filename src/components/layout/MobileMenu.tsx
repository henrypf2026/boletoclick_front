'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface NavLinkItem {
  href: string
  label: string
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" x2="20" y1="7" y2="7" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="17" y2="17" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export default function MobileMenu({ navLinks }: { navLinks: NavLinkItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { authenticated, user, logout } = useAuth()

  useEffect(() => { setIsOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    router.push('/')
  }

  const dashboardHref = user?.role === 'producer' ? '/producer/dashboard' : '/dashboard-user'
  const dashboardLabel = user?.role === 'producer' ? 'Mi Dashboard' : 'Mi Cuenta'

  const userLinks: NavLinkItem[] = authenticated && user
    ? [
        { href: '/mis-tickets', label: 'Mis Tickets' },
        { href: dashboardHref, label: dashboardLabel },
        { href: '/perfil', label: 'Perfil' },
      ]
    : []

  const allLinks = [...navLinks, ...userLinks]

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
        {/* Header */}
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

        {/* Nav links */}
        <nav className="flex flex-col px-3 pt-4 pb-2 gap-0.5">
          {allLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
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

        {/* Greeting when authenticated */}
        {authenticated && user && (
          <div className="px-6 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-text-soft">
              {(user.name ?? user.email.split('@')[0]).split(' ')[0]}
            </p>
            <p className="text-xs text-text-soft truncate">{user.email}</p>
          </div>
        )}

        {/* Bottom actions */}
        <div className="mt-auto px-4 pb-8 pt-4 flex flex-col gap-2">
          {authenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-11 w-full border-2 border-border text-text text-sm font-bold transition-colors hover:bg-surface-2"
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link
                href="/registro"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-11 w-full bg-primary text-background text-sm font-black uppercase tracking-wider border-2 border-border shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] transition-all hover:-translate-y-px"
              >
                Registrarme
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-11 w-full border-2 border-border text-text text-sm font-bold transition-colors hover:bg-surface-2"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
