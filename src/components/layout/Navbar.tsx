import Link from "next/link";
import { navItems } from "@/config/navigation";
import CenterNav from "./CenterNav";
import { NavDarkModeToggle } from "./DarkModeToggle";
import UserMenuButton from "./UserMenuButton";
import MobileMenu from "./MobileMenu";
import NotificationBell from "@/components/ui/NotificationBell";

export default function Navbar() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-2 bg-background sm:h-4" />
    <header className="sticky top-2 z-50 mx-auto mb-4 w-full max-w-7xl select-none px-3 sm:top-4 sm:px-4">
      <nav className="relative flex h-14 items-center border-4 border-border bg-surface px-3 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] sm:h-16 sm:px-6 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 sm:gap-3"
          aria-label="BoletoClick — ir al inicio"
        >
          <span className="flex size-8 items-center justify-center border-2 border-border bg-primary text-sm font-black text-background shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            B
          </span>
          <span className="hidden text-lg font-black uppercase tracking-tighter text-text min-[420px]:inline">
            Boleto<span className="text-accent">Click</span>
          </span>
        </Link>

        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <CenterNav />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <NavDarkModeToggle />
          <NotificationBell />
          <UserMenuButton />
          <div className="md:hidden">
            <MobileMenu navLinks={navItems} />
          </div>
        </div>
      </nav>
    </header>
    </>
  );
}
