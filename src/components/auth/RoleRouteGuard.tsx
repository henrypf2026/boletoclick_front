"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

interface RoleRouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleRouteGuard({
  allowedRoles,
  children,
}: RoleRouteGuardProps) {
  const { user, loading, authenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!authenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user?.role && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [allowedRoles, authenticated, loading, pathname, router, user?.role]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs uppercase text-text-soft">
        Cargando sesión...
      </div>
    );
  }

  if (!authenticated || (user?.role && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
