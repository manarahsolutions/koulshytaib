import { listReelsAction } from "@/app/actions/backend";
import { AdminReelsClient } from "@/components/admin/admin-reels-client";
import { getCurrentAdmin } from "@/features/admin-auth/authorization";
import { canDeleteSensitive } from "@/features/admin-auth/permissions";

export const metadata = { title: "الريلز" };

export default async function AdminReelsPage() {
  const admin = await getCurrentAdmin();
  const result = await listReelsAction();
  const initial = result.ok ? result.data : [];

  return (
    <AdminReelsClient
      initial={initial}
      canDelete={admin ? canDeleteSensitive(admin.role) : false}
    />
  );
}
