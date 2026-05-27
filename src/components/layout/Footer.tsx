import Link from 'next/link'
import { navItems, legalLinks } from '@/config/navigation'

export default function Footer() {
  return (
    <footer className="mt-auto bg-surface border-t border-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">

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

          <nav aria-label="Navegación del footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none m-0 p-0">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-soft hover:text-text transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="h-px bg-surface-2" />

        <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-text-soft">
            © {new Date().getFullYear()} BoletoClick. Todos los derechos reservados.
          </p>

          <nav aria-label="Links legales">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 list-none m-0 p-0">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-soft hover:text-text transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

      </div>
    </footer>
  )
}
