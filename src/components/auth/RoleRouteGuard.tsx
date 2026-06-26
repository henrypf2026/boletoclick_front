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
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-surface-2 border-2 border-border" />
        <div className="h-4 w-full bg-surface-2 border-2 border-border" />
        <div className="h-4 w-3/4 bg-surface-2 border-2 border-border" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="h-40 bg-surface-2 border-2 border-border" />
          <div className="h-40 bg-surface-2 border-2 border-border" />
          <div className="h-40 bg-surface-2 border-2 border-border" />
        </div>
        <div className="h-64 w-full bg-surface-2 border-2 border-border" />
      </div>
    );
  }

  if (!authenticated || (user?.role && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
