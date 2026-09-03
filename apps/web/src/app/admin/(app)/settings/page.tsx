import { redirect } from "next/navigation";
import {
  getRestaurantSettingsAction,
  listAdminsAction,
} from "@/app/actions/backend";
import { AdminSettingsClient } from "@/components/admin/admin-settings-client";
import { getCurrentAdmin } from "@/features/admin-auth/authorization";
import { canManageSettings } from "@/features/admin-auth/permissions";
import { DEFAULT_SETTINGS } from "@/features/settings/db-settings-repository";

export const metadata = { title: "الإعدادات" };

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !canManageSettings(admin.role)) {
    redirect("/admin");
  }

  const [settingsResult, adminsResult] = await Promise.all([
    getRestaurantSettingsAction(),
    listAdminsAction(),
  ]);

  return (
    <AdminSettingsClient
      initialSettings={
        settingsResult.ok ? settingsResult.data : DEFAULT_SETTINGS
      }
      initialAdmins={adminsResult.ok ? adminsResult.data : []}
    />
  );
}
