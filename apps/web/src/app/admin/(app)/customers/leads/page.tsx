import { redirect } from "next/navigation";

export const metadata = { title: "الزبائن · المتابعة" };

/** Legacy path — leads live under /admin/customers?tab=leads */
export default function AdminLeadsRedirectPage() {
  redirect("/admin/customers?tab=leads");
}
