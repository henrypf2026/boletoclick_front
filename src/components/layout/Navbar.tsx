import Link from "next/link";
import { navItems } from "@/config/navigation";
import NavLinks from "./NavLinks";
import NavSearchButton from "./NavSearchButton";
import UserMenuButton from "./UserMenuButton";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <header className="sticky top-4 z-50 max-w-7xl w-full mx-auto px-4 mb-4 select-none">
      <nav className="relative h-16 flex items-center px-6 bg-surface border-4 border-border shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
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

        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <NavLinks links={navItems} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <NavSearchButton />
          <UserMenuButton />
          <div className="md:hidden">
            <MobileMenu navLinks={navItems} />
          </div>
        </div>
      </nav>
    </header>
  );
}
