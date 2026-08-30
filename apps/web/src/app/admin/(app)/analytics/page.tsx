import { fetchAnalyticsAction } from "@/app/actions/backend";
import { AdminAnalyticsClient } from "@/components/admin/admin-analytics-client";

export const metadata = {
  title: "التحليلات",
};

export default async function AdminAnalyticsPage() {
  const result = await fetchAnalyticsAction();
  if (!result.ok) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">التحليلات</h1>
        <p className="text-sm text-danger" role="alert">
          {result.message}
        </p>
      </div>
    );
  }

  return <AdminAnalyticsClient data={result.data} />;
}
