'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const baseLinks = [
  { href: '/eventos', label: 'Eventos' },
];

export default function CenterNav() {
  const pathname = usePathname();
  const { authenticated, user } = useAuth();

  const contextLink = authenticated
    ? user?.role === 'producer'
      ? { href: '/producer/mis-eventos', label: 'Mis Eventos' }
      : { href: '/mis-tickets', label: 'Mis Tickets' }
    : null;

  const links = contextLink ? [...baseLinks, contextLink] : baseLinks;

  return (
    <ul className="flex items-center gap-0.5 list-none m-0 p-0" role="list">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
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
        );
      })}
    </ul>
  );
}
