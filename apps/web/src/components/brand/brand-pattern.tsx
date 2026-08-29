/**
 * Brand board motifs:
 * - /brand/pattern-floral.svg
 * - /brand/pattern-geometric.svg
 * - /brand/pattern-header.png (menu / page header floral strip)
 *
 * Expected Iraqi-inspired cultural accents (when designed):
 * - /brand/patterns/iraqi-geometric.svg
 * - /brand/patterns/iraqi-floral.svg
 * - /brand/patterns/iraqi-border.svg
 */
import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type BrandPatternName =
  | "floral"
  | "geometric"
  | "header"
  | "iraqi-geometric"
  | "iraqi-floral"
  | "iraqi-border";

export type BrandPatternProps = HTMLAttributes<HTMLDivElement> & {
  name: BrandPatternName;
  /** When true, skip patterns that are not shipped yet */
  hideIfMissing?: boolean;
  opacity?: number;
  /** Override default background-size for this pattern */
  backgroundSize?: string;
};

const PATTERN_SRC: Record<BrandPatternName, string> = {
  floral: "/brand/pattern-floral.svg",
  geometric: "/brand/pattern-geometric.svg",
  header: "/brand/pattern-header.png",
  "iraqi-geometric": "/brand/patterns/iraqi-geometric.svg",
  "iraqi-floral": "/brand/patterns/iraqi-floral.svg",
  "iraqi-border": "/brand/patterns/iraqi-border.svg",
};

const READY_PATTERNS = new Set<BrandPatternName>([
  "floral",
  "geometric",
  "header",
]);

const DEFAULT_SIZE: Record<BrandPatternName, string> = {
  floral: "120px 120px",
  geometric: "120px 120px",
  header: "cover",
  "iraqi-geometric": "120px 120px",
  "iraqi-floral": "120px 120px",
  "iraqi-border": "120px 120px",
};

export function BrandPattern({
  name,
  hideIfMissing = true,
  opacity = 0.12,
  backgroundSize,
  className,
  style,
  ...props
}: BrandPatternProps) {
  const src = PATTERN_SRC[name];
  const ready = READY_PATTERNS.has(name);

  if (hideIfMissing && !ready) {
    return (
      <div
        className={cn("pointer-events-none select-none", className)}
        data-brand-pattern={name}
        data-brand-pattern-status="pending-asset"
        aria-hidden
        {...props}
      />
    );
  }

  const mergedStyle: CSSProperties = {
    opacity,
    backgroundImage: `url(${src})`,
    backgroundRepeat: name === "header" ? "no-repeat" : "repeat",
    backgroundPosition: name === "header" ? "center center" : "center",
    backgroundSize: backgroundSize ?? DEFAULT_SIZE[name],
    ...(name === "header" ? { mixBlendMode: "multiply" as const } : null),
    ...style,
  };

  return (
    <div
      className={cn("pointer-events-none select-none", className)}
      data-brand-pattern={name}
      data-brand-pattern-status={ready ? "ready" : "pending-asset"}
      style={mergedStyle}
      aria-hidden
      {...props}
    />
  );
}
