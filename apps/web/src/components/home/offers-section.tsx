import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { FeaturedOfferBanner } from "@/components/marketing/featured-offer-banner";
import { OfferCard } from "@/components/marketing/offer-card";
import type { CustomerOfferView } from "@/features/offers/selectors";
import { cn } from "@/lib/utils/cn";

export type OffersSectionProps = {
  featured: CustomerOfferView | null;
  secondary: CustomerOfferView[];
  className?: string;
};

/**
 * Closing promotional beat: featured banner (assets/3rd) + secondary stories.
 */
export function OffersSection({
  featured,
  secondary,
  className,
}: OffersSectionProps) {
  if (!featured && secondary.length === 0) return null;

  const primary = featured ?? secondary[0]!;
  const rest =
    featured != null
      ? secondary
      : secondary.filter((v) => v.offer.id !== primary.offer.id);

  return (
    <section
      aria-labelledby="home-offers-heading"
      className={cn("pb-8 sm:pb-10", className)}
    >
      <PageContainer width="wide" paddedY={false} className="pt-8 sm:pt-10">
        <DecorativeMotif
          variant="floral-divider"
          tone="navy"
          className="mb-6"
        />

        <div className="mb-5 sm:mb-6">
          <h2
            id="home-offers-heading"
            className="text-xl font-semibold tracking-tight text-brand-navy sm:text-[1.35rem]"
          >
            عروض اليوم
          </h2>
          <p className="typo-caption mt-1 text-text-muted">
            شنو عدنا إلك اليوم — العرض للعرض؛ الخصم ما ينطبق على السلة تلقائياً
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:gap-5">
          <FeaturedOfferBanner view={primary} className="w-full" />

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
    </section>
  );
}
