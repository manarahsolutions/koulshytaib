import { redirect } from "next/navigation";

/** Legacy path — dashboard lives at `/admin`. */
export default function AdminDashboardRedirectPage() {
  redirect("/admin");
}
