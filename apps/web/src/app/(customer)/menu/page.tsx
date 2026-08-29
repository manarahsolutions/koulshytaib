import { Suspense } from "react";
import { MenuPageClient } from "@/components/menu/menu-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export const metadata = {
  title: "المنيو",
};

function MenuFallback() {
  return (
    <PageContainer width="wide" className="space-y-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-11 w-full max-w-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </PageContainer>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuFallback />}>
      <MenuPageClient />
    </Suspense>
  );
}
