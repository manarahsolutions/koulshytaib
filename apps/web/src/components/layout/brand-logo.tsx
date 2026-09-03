import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type BrandLogoProps = {
  className?: string;
  /** Compact mark for dense mobile headers */
  compact?: boolean;
};

/**
 * Brand lockup from assets/logo2 — navy-on-transparent webp for cream headers.
 */
export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  const height = compact ? 36 : 44;
  const width = Math.round(height * (321 / 206));

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-w-0 items-center rounded-md",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        className,
      )}
      aria-label="كلشي طيب — الصفحة الرئيسية"
    >
      <Image
        src="/brand/logo2.webp"
        alt="كلشي طيب"
        width={width}
        height={height}
        className={cn(
          "h-9 w-auto object-contain object-center sm:h-11",
          compact && "h-8 sm:h-9",
        )}
        priority
      />
    </Link>
  );
}
