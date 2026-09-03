import { fetchAnalyticsAction } from "@/app/actions/backend";
import { AdminAnalyticsClient } from "@/components/admin/admin-analytics-client";
import type { ExtendedAnalytics } from "@/features/analytics/db-analytics-extended";

export const metadata = { title: "التحليلات" };

export default async function AdminAnalyticsPage() {
  const result = await fetchAnalyticsAction({ preset: "week" });
  if (!result.ok) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">التحليلات</h1>
        <p className="text-sm text-danger">{result.message}</p>
      </div>
    );
  }
  return (
    <AdminAnalyticsClient initial={result.data as ExtendedAnalytics} />
  );
}
