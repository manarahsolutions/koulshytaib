import { Suspense } from "react";
import { fetchLeadsAction } from "@/app/actions/backend";
import { AdminCustomersClient } from "@/components/admin/admin-customers-client";

export const metadata = {
  title: "الزبائن",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params.tab === "leads" ? "leads" : "list";
  const leadsResult = await fetchLeadsAction({ kind: "all" });
  const initialLeads = leadsResult.ok ? leadsResult.data : [];

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-brand-navy">الزبائن</h1>
          <p className="text-sm text-text-muted">جارٍ التحميل…</p>
        </div>
      }
    >
      <AdminCustomersClient
        initialLeads={initialLeads}
        initialTab={initialTab}
      />
    </Suspense>
  );
}
