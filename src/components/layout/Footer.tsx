import Link from "next/link";
import { navItems, legalLinks } from "@/config/navigation";

export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-surface border-t-4 border-border select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group transition-transform active:translate-x-0.5 active:translate-y-0.5"
            aria-label="BoletoClick — ir al inicio"
          >
            <span className="flex items-center justify-center size-8 border-2 border-border bg-primary text-background text-sm font-black shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              B
            </span>
            <span className="font-black text-lg tracking-tighter text-text uppercase">
              Boleto<span className="text-accent">Click</span>
            </span>
          </Link>

          <nav aria-label="Navegación del footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none m-0 p-0">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-bold text-text uppercase tracking-wide hover:text-primary hover:underline hover:decoration-2 hover:decoration-border transition-all duration-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="h-1 bg-border w-full" />

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-text-soft uppercase tracking-wider">
            © {new Date().getFullYear()} BoletoClick. Todos los derechos
            reservados.
          </p>

          <nav aria-label="Links legales">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 list-none m-0 p-0">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs font-bold text-text-soft uppercase tracking-wider hover:text-accent hover:underline hover:decoration-2 hover:decoration-border transition-all duration-100"
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
  );
}
