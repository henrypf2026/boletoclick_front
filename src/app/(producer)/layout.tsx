import RoleRouteGuard from "@/components/auth/RoleRouteGuard";

export default function ProducerGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard allowedRoles={["producer"]}>
      {children}
    </RoleRouteGuard>
  );
}
