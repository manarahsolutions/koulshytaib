import { BrandStorySection } from "@/components/home/brand-story-section";
import { CategoryScroller } from "@/components/home/category-scroller";
import { DeliveryCtaSection } from "@/components/home/delivery-cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { OffersSection } from "@/components/home/offers-section";
import { PopularProductsSection } from "@/components/home/popular-products-section";
import { ReelsSection } from "@/components/home/reels-section";
import { toMarketingReel, dbListReels } from "@/features/reels/db-reel-repository";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { MOCK_REELS } from "@/features/marketing/mock-reels";
import {
  getFeaturedOffer,
  getSecondaryOffers,
} from "@/features/offers/selectors";
import {
  getHomeCategories,
  getHomePopularProducts,
} from "@/features/products/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "كلشي طيب — أكل بيتي يوصل لبابك",
  description:
    "أكل بيتي دافئ للّمّة — توصيل لباب البيت فقط. تصفّح المنيو واطلب كضيف بدون تسجيل.",
  openGraph: {
    title: "كلشي طيب",
    description: "أكل بيتي — توصيل فقط",
    locale: "ar_IQ",
    type: "website",
  },
};

export default async function HomePage() {
  const categories = getHomeCategories();
  const popular = getHomePopularProducts();
  const featured = getFeaturedOffer();
  const secondary = getSecondaryOffers();

  let reels = MOCK_REELS;
  if (isDatabaseConfigured()) {
    try {
      const rows = await dbListReels({ activeOnly: true });
      if (rows.length > 0) {
        reels = rows.map(toMarketingReel);
      }
    } catch {
      // keep mocks if DB reel table not ready
    }
  }

  return (
    <>
      <HeroSection />
      <CategoryScroller categories={categories} />
      <PopularProductsSection products={popular} />
      <ReelsSection reels={reels} />
      <OffersSection featured={featured} secondary={secondary} />
      <BrandStorySection />
      <DeliveryCtaSection />
    </>
  );
}
