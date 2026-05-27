'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkItem {
  href: string
  label: string
}

export default function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname()

  return (
    <ul className="flex items-center gap-0.5 list-none m-0 p-0" role="list">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'relative flex items-center h-8 px-3.5 text-sm font-medium rounded-md transition-colors duration-150',
                isActive
                  ? 'text-primary'
                  : 'text-text-soft hover:text-primary hover:bg-primary/10',
              ].join(' ')}
            >
              {link.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-px left-3 right-3 h-[2px] bg-primary rounded-full"
                />
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
