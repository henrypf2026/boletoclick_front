export type NavItem = {
  href: string
  label: string
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Eventos' },
  { href: '/categorias', label: 'Categorías' },
  { href: '/mis-tickets', label: 'Mis Tickets' },
  { href: '/favoritos', label: 'Favoritos' },
]

export const legalLinks: NavItem[] = [
  { href: '/terminos', label: 'Términos y condiciones' },
  { href: '/privacidad', label: 'Política de privacidad' },
  { href: '/contacto', label: 'Contacto' },
]
