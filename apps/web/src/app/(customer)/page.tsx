import { BrandStorySection } from "@/components/home/brand-story-section";
import { CategoryScroller } from "@/components/home/category-scroller";
import { DeliveryCtaSection } from "@/components/home/delivery-cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { OffersSection } from "@/components/home/offers-section";
import { PopularProductsSection } from "@/components/home/popular-products-section";
import { ReelsSection } from "@/components/home/reels-section";
import { toMarketingReel, dbListReels, dbEnsureReelThumbnails } from "@/features/reels/db-reel-repository";
import {
  dbListCategories,
  dbListProducts,
} from "@/features/products/db-catalog-repository";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  getFeaturedOffer,
  getSecondaryOffers,
} from "@/features/offers/selectors";
import {
  getHomeCategories,
  getHomePopularProducts,
} from "@/features/products/mock-data";
import type { Category, Product } from "@/types/catalog";
import type { Reel } from "@/types/marketing";
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

const HOME_POPULAR_LIMIT = 4;

/**
 * Popular slice from the dashboard catalog: products flagged "popular" first,
 * then the rest in dashboard sort order.
 */
function pickPopularProducts(
  categories: Category[],
  products: Product[],
): Product[] {
  const visibleCategoryIds = new Set(categories.map((c) => c.id));
  const browsable = products.filter(
    (p) =>
      p.visible !== false &&
      p.available !== false &&
      visibleCategoryIds.has(p.categoryId),
  );
  const flagged = browsable.filter((p) =>
    p.badges?.some((b) => b.kind === "popular"),
  );
  const rest = browsable.filter((p) => !flagged.includes(p));
  return [...flagged, ...rest].slice(0, HOME_POPULAR_LIMIT);
}

export default async function HomePage() {
  let categories = getHomeCategories();
  let popular = getHomePopularProducts();
  if (isDatabaseConfigured()) {
    try {
      const [dbCategories, dbProducts] = await Promise.all([
        dbListCategories(),
        dbListProducts(),
      ]);
      categories = dbCategories.filter((c) => c.visible !== false);
      popular = pickPopularProducts(categories, dbProducts);
    } catch {
      // Keep the seed catalog if the database is unreachable.
    }
  }
  const featured = getFeaturedOffer();
  const secondary = getSecondaryOffers();

  let reels: Reel[] = [];
  if (isDatabaseConfigured()) {
    try {
      await dbEnsureReelThumbnails();
      const rows = await dbListReels({ activeOnly: true });
      reels = rows.map(toMarketingReel);
    } catch {
      reels = [];
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
