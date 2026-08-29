import { ProductDetailClient } from "@/components/product/product-detail-client";
import { listProducts } from "@/features/products/product-repository";

export const dynamicParams = true;

export function generateStaticParams() {
  return listProducts().map((product) => ({ id: product.id }));
}

export default function ProductPage() {
  return <ProductDetailClient />;
}
