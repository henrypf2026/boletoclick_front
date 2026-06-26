"use client";

import React from "react";
import { AdminProvider } from "@/context/AdminContext";
import RoleRouteGuard from "@/components/auth/RoleRouteGuard";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard allowedRoles={["admin"]}>
      <AdminProvider>{children}</AdminProvider>
    </RoleRouteGuard>
  );
}
