import {
  listCouponsAction,
} from "@/app/actions/backend";
import { AdminCouponsClient } from "@/components/admin/admin-coupons-client";

export const metadata = {
  title: "الكوبونات",
};

export default async function AdminCouponsPage() {
  const result = await listCouponsAction();
  const initial = result.ok ? result.data : [];
  const loadError = result.ok ? null : result.message;

  return (
    <AdminCouponsClient initialCoupons={initial} loadError={loadError} />
  );
}
