import RoleRouteGuard from "@/components/auth/RoleRouteGuard";

export default function UserGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard allowedRoles={["user", "producer", "admin"]}>
      {children}
    </RoleRouteGuard>
  );
}
