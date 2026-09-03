import { fetchLeadsAction } from "@/app/actions/backend";
import { AdminLeadsClient } from "@/components/admin/admin-leads-client";

export const metadata = { title: "Leads" };

export default async function AdminLeadsPage() {
  const result = await fetchLeadsAction({ kind: "all" });
  if (!result.ok) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">Leads</h1>
        <p className="text-sm text-danger">{result.message}</p>
      </div>
    );
  }
  return <AdminLeadsClient initial={result.data} />;
}
