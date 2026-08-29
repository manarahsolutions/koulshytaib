import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type BrandLogoProps = {
  className?: string;
  /** Compact mark for dense mobile headers */
  compact?: boolean;
};

/**
 * Brand lockup: Arabic wordmark (clear on cream) + existing logo.webp plate.
 * Transparent SVG wordmarks (`logo-ar.svg`) will replace this when available.
 */
export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-md",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        className,
      )}
      aria-label="كلشي طيب — الصفحة الرئيسية"
    >
      <Image
        src="/brand/logo.webp"
        alt=""
        width={compact ? 36 : 44}
        height={compact ? 36 : 44}
        className={cn(
          "size-9 shrink-0 rounded-md object-cover object-center sm:size-10",
          compact && "size-8 sm:size-9",
        )}
        priority
      />
      <span
        className={cn(
          "truncate font-bold text-brand-navy",
          compact ? "text-base" : "text-lg",
        )}
      >
        كلشي طيب
      </span>
    </Link>
  );
}
