import { AdminLoyaltyClient } from "@/components/admin/admin-loyalty-client";
import { AdminLoyaltyRewardsClient } from "@/components/admin/admin-loyalty-rewards-client";
import { listLoyaltyRewardsAction } from "@/app/actions/backend";
import { getCurrentAdmin } from "@/features/admin-auth/authorization";
import { canDeleteSensitive } from "@/features/admin-auth/permissions";

export const metadata = {
  title: "الولاء",
};

export default async function AdminLoyaltyPage() {
  const admin = await getCurrentAdmin();
  const rewardsResult = await listLoyaltyRewardsAction();

  return (
    <div className="space-y-10">
      <AdminLoyaltyClient />
      <AdminLoyaltyRewardsClient
        initial={rewardsResult.ok ? rewardsResult.data : []}
        canDelete={admin ? canDeleteSensitive(admin.role) : false}
      />
    </div>
  );
}
