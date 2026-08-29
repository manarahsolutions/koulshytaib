import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { OfferCard } from "@/components/marketing/offer-card";
import {
  getCustomerOffers,
  getFeaturedOffer,
  getSecondaryOffers,
} from "@/features/offers/selectors";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "العروض",
  description: "عروض كلشي طيب — للعرض فقط، الخصم ما ينطبق تلقائياً على السلة.",
};

/**
 * Customer offers listing — same OfferRepository as Homepage.
 */
export default function OffersPage() {
  const featured = getFeaturedOffer();
  const secondary = getSecondaryOffers();
  const all = getCustomerOffers();

  if (all.length === 0) {
    return (
      <PageContainer width="narrow" className="py-10">
        <h1 className="text-2xl font-bold text-brand-navy">العروض</h1>
        <p className="typo-body-s mt-2 text-text-muted">ماكو عروض حالياً</p>
      </PageContainer>
    );
  }

  const primary = featured ?? secondary[0]!;
  const rest = all.filter((v) => v.offer.id !== primary.offer.id);

  return (
    <div className="pb-6">
      <PageContainer width="wide" paddedY={false} className="pt-6 sm:pt-8">
        <DecorativeMotif
          variant="floral-divider"
          tone="navy"
          className="mb-5 max-w-xs opacity-90"
        />
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
          العروض
        </h1>
        <p className="typo-caption mt-1 text-text-muted">
          العروض للعرض فقط — الخصم ما ينطبق تلقائياً على السلة أو الدفع بعد
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <OfferCard view={primary} featured className="w-full" />
          {rest.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {rest.map((view) => (
                <li key={view.offer.id}>
                  <OfferCard view={view} className="h-full" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </PageContainer>
    </div>
  );
}
