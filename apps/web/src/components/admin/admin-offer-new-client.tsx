"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOfferAction } from "@/app/actions/backend";
import { OfferForm } from "@/components/admin/offer-form";
import { upsertOfferInCache } from "@/features/offers/offer-repository";
import { createOffer } from "@/features/offers/offer-service";
import { useProducts } from "@/features/products/use-catalog";
import { runAdminMutation } from "@/lib/db/run-admin-mutation";

export function AdminOfferNewClient() {
  const router = useRouter();
  const products = useProducts();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/offers"
          className="inline-flex h-11 items-center gap-2 text-sm font-medium text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <ArrowRight className="size-4" aria-hidden />
          رجوع للعروض
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">إضافة عرض</h1>
        <p className="mt-1 text-sm text-text-muted">
          العرض يظهر للزبون حسب التفعيل والظهور وارتباط المنتجات
        </p>
      </div>

      <OfferForm
        products={products}
        submitLabel="حفظ العرض"
        onSubmit={async (values) => {
          const result = await runAdminMutation({
            db: () => createOfferAction(values),
            memory: () => createOffer(values),
            onDbSuccess: (offer) => upsertOfferInCache(offer),
          });
          if (!result.ok) return result.message;
          router.push(`/admin/offers/${result.data.id}`);
          return null;
        }}
      />
    </div>
  );
}
