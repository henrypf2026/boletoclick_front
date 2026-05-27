import Link from 'next/link'
import { navItems } from '@/config/navigation'
import NavLinks from './NavLinks'
import NavSearchButton from './NavSearchButton'
import UserMenuButton from './UserMenuButton'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-surface-2">
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">

        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="BoletoClick — ir al inicio"
        >
          <span className="flex items-center justify-center size-7 rounded-lg bg-primary text-white text-xs font-black select-none">
            B
          </span>
          <span className="font-semibold text-[15px] tracking-tight text-text">
            Boleto<span className="text-primary">Click</span>
          </span>
        </Link>

        {/* Nav links — centrado real sobre el viewport */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <NavLinks links={navItems} />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <NavSearchButton />
          <UserMenuButton />
          <div className="md:hidden ml-1">
            <MobileMenu navLinks={navItems} />
          </div>
        </div>

      </nav>
    </header>
  )
}
