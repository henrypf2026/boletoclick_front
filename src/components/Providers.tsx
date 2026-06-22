'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CountryFilterProvider } from '@/context/CountryFilterContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CountryFilterProvider>{children}</CountryFilterProvider>
    </AuthProvider>
  );
}
