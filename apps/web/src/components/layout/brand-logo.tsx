import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type BrandLogoProps = {
  className?: string;
  /** Compact mark for dense mobile headers */
  compact?: boolean;
};

/**
 * Brand lockup: crisp SVG mark + HTML Arabic wordmark.
 * Avoids scaling the full raster lockup (logo.webp) down to ~36px.
 */
export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-w-0 items-center gap-2.5 rounded-md",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        className,
      )}
      aria-label="كلشي طيب — الصفحة الرئيسية"
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center text-brand-navy",
          compact ? "h-8 w-10" : "h-9 w-11 sm:h-10 sm:w-12",
        )}
        aria-hidden
      >
        {/* Inline SVG stays sharp at any DPR; file also at /brand/logo-mark.svg */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 72 56"
          fill="none"
          className="size-full"
        >
          <path
            d="M22 22c-1.2-8.5 4.2-14.5 11-14.5 3.8 0 6.6 2.2 8 5.2 1.5-3.2 4.4-5.4 8.3-5.4 7 0 12.2 6.2 11 14.7"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 34c5.5 10.5 14.8 16.5 20 16.5s14.5-6 20-16.5"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="34" r="2.4" fill="currentColor" />
          <circle cx="56" cy="34" r="2.4" fill="currentColor" />
        </svg>
      </span>
      <span
        className={cn(
          "truncate font-bold tracking-tight text-brand-navy",
          compact ? "text-base" : "text-lg sm:text-xl",
        )}
      >
        كلشي طيب
      </span>
    </Link>
  );
}
