import { redirect } from "next/navigation";

/** Prefer nested route under products. */
export default function AdminCategoriesRedirectPage() {
  redirect("/admin/products/categories");
}
