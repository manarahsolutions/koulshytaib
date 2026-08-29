import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { DbHydrateClient } from "@/components/system/db-hydrate-client";
import { getCurrentAdmin } from "@/features/admin-auth/authorization";

/**
 * Protected Admin console — requires authenticated Admin session.
 */
export default async function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <>
      <DbHydrateClient scope="admin" />
      <AdminShell
        admin={{
          identifier: admin.identifier,
          role: admin.role,
        }}
      >
        {children}
      </AdminShell>
    </>
  );
}
