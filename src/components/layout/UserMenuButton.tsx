'use client'

import Link from 'next/link'

// Auth no implementada aún — siempre muestra el botón de login.
// Cuando esté lista, recibir user como prop desde Navbar (Server Component).
export default function UserMenuButton() {
  return (
    <Link
      href="/login"
      className="flex items-center h-9 px-4 bg-primary hover:bg-primary-deep text-white text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap"
    >
      Ingresar
    </Link>
  )
}
