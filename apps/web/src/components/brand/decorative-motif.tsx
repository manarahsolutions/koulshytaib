import type { HTMLAttributes } from "react";
import {
  FloralBorderSvg,
  FloralCardAccentSvg,
  FloralCornerSvg,
  FloralDividerSvg,
  FloralFieldSvg,
  FloralSideSvg,
} from "@/components/brand/floral-motifs";
import { cn } from "@/lib/utils/cn";

/**
 * Decorative language for كلشي طيب.
 *
 * Two complementary grammars (Iraqi / regional–inspired interpretation):
 * 1) Textile — diamonds · stepped units · bars (kilim-adjacent digital)
 * 2) Floral — botanical linework · blooms · leaves (hand-drawn feel)
 *
 * NOT scanned rug/floral artwork · NOT clip-art · NOT literal heritage claims.
 */

export type DecorativeMotifVariant =
  | "divider"
  | "border"
  | "corner"
  | "hero"
  | "card"
  | "strip"
  | "floral-divider"
  | "floral-border"
  | "floral-corner"
  | "floral-side"
  | "floral-field"
  | "floral-card";

export type DecorativeMotifDensity = "subtle" | "medium";
export type DecorativeMotifTone =
  | "navy"
  | "raspberry"
  | "yellow"
  | "green"
  | "muted";

export type DecorativeMotifProps = HTMLAttributes<HTMLDivElement> & {
  variant: DecorativeMotifVariant;
  density?: DecorativeMotifDensity;
  tone?: DecorativeMotifTone;
};

const toneClass: Record<DecorativeMotifTone, string> = {
  navy: "text-brand-navy",
  raspberry: "text-brand-primary",
  yellow: "text-brand-secondary",
  green: "text-brand-green",
  muted: "text-text-muted",
};

const densityOpacity: Record<DecorativeMotifDensity, string> = {
  subtle: "opacity-[var(--pattern-opacity-subtle)]",
  medium: "opacity-[var(--pattern-opacity-medium)]",
};

function Diamond({
  cx,
  cy,
  r = 4,
  fill = false,
}: {
  cx: number;
  cy: number;
  r?: number;
  fill?: boolean;
}) {
  const d = `M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z`;
  return fill ? (
    <path d={d} fill="currentColor" />
  ) : (
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.15" />
  );
}

/** Stepped diamond — kilim / southern textile grammar unit */
function SteppedDiamond({
  cx,
  cy,
  scale = 1,
}: {
  cx: number;
  cy: number;
  scale?: number;
}) {
  const s = scale;
  // Octagon-like stepped diamond (simplified kilim step)
  const pts = [
    [0, -6],
    [2, -6],
    [2, -4],
    [4, -4],
    [4, -2],
    [6, 0],
    [4, 2],
    [4, 4],
    [2, 4],
    [2, 6],
    [0, 6],
    [-2, 6],
    [-2, 4],
    [-4, 4],
    [-4, 2],
    [-6, 0],
    [-4, -2],
    [-4, -4],
    [-2, -4],
    [-2, -6],
  ]
    .map(([x, y]) => `${cx + x * s},${cy + y * s}`)
    .join(" ");
  return (
    <polygon
      points={pts}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="miter"
    />
  );
}

function DividerSvg() {
  // Handmade rhythm: alternating diamond / stepped / filled, uneven gaps
  return (
    <svg
      viewBox="0 0 240 18"
      className="h-4 w-full max-w-xs"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <line
        x1="8"
        y1="9"
        x2="48"
        y2="9"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
      <Diamond cx={56} cy={9} r={3.2} />
      <line
        x1="62"
        y1="9"
        x2="78"
        y2="9"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <SteppedDiamond cx={90} cy={9} scale={0.55} />
      {/* Yellow highlight bar — intentional small accent via nested use of tone on parent; drawn as thicker gap */}
      <rect
        x="102"
        y="8"
        width="14"
        height="2"
        fill="var(--color-brand-secondary)"
        opacity="0.85"
      />
      <Diamond cx={128} cy={9} r={2.6} fill />
      <line
        x1="134"
        y1="9"
        x2="152"
        y2="9"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <SteppedDiamond cx={164} cy={9} scale={0.48} />
      <Diamond cx={180} cy={9} r={3} />
      <line
        x1="188"
        y1="9"
        x2="232"
        y2="9"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  );
}

function BorderSvg() {
  // Continuous textile border: ◇──◆──◇──◆ with stepped interruptions
  const units = [16, 40, 64, 88, 112, 136, 160, 184, 208, 232];
  return (
    <svg
      viewBox="0 0 248 12"
      className="h-3 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="0"
        y1="6"
        x2="248"
        y2="6"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.35"
      />
      {units.map((x, i) =>
        i % 3 === 1 ? (
          <SteppedDiamond key={x} cx={x} cy={6} scale={0.38} />
        ) : (
          <Diamond key={x} cx={x} cy={6} r={i % 2 === 0 ? 2.4 : 2} fill={i % 4 === 0} />
        ),
      )}
    </svg>
  );
}

function CornerSvg() {
  return (
    <svg viewBox="0 0 40 40" className="size-full" aria-hidden>
      {/* Kilim corner bracket */}
      <path
        d="M3 22V3h19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path
        d="M3 10h8M10 3v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.7"
      />
      <SteppedDiamond cx={18} cy={18} scale={0.72} />
      <Diamond cx={30} cy={10} r={2.2} />
      <Diamond cx={10} cy={30} r={2} fill />
    </svg>
  );
}

function HeroFieldSvg() {
  // Oversized field — diamonds + stepped units with imperfect rhythm (not wallpaper grid)
  const diamonds: Array<{ x: number; y: number; r: number; fill?: boolean }> = [
    { x: 28, y: 36, r: 7 },
    { x: 72, y: 52, r: 5, fill: true },
    { x: 118, y: 28, r: 6 },
    { x: 168, y: 64, r: 8 },
    { x: 48, y: 98, r: 5 },
    { x: 98, y: 112, r: 7, fill: true },
    { x: 148, y: 96, r: 4 },
    { x: 38, y: 158, r: 6 },
    { x: 88, y: 172, r: 5 },
    { x: 142, y: 148, r: 7 },
    { x: 178, y: 188, r: 5, fill: true },
    { x: 62, y: 208, r: 4 },
    { x: 122, y: 218, r: 6 },
  ];
  const stepped = [
    { x: 52, y: 68, s: 1.1 },
    { x: 132, y: 78, s: 0.9 },
    { x: 78, y: 138, s: 1 },
    { x: 158, y: 168, s: 1.15 },
    { x: 42, y: 188, s: 0.85 },
  ];

  return (
    <svg
      viewBox="0 0 200 240"
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* Soft guiding stripes — textile weft suggestion */}
      {[44, 92, 140, 188].map((y) => (
        <line
          key={y}
          x1="8"
          y1={y}
          x2="192"
          y2={y}
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.22"
        />
      ))}
      {diamonds.map((d) => (
        <Diamond key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r={d.r} fill={d.fill} />
      ))}
      {stepped.map((s) => (
        <SteppedDiamond key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} scale={s.s} />
      ))}
      {/* Raspberry interruption — rare accent unit */}
      <path
        d="M168 114.5 L171.5 118 L168 121.5 L164.5 118 Z"
        fill="var(--color-brand-primary)"
        opacity="0.55"
      />
    </svg>
  );
}

function StripSvg() {
  return (
    <svg
      viewBox="0 0 200 8"
      className="h-2 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="0"
        y1="4"
        x2="200"
        y2="4"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.3"
      />
      {[12, 32, 52, 72, 92, 112, 132, 152, 172, 192].map((x, i) =>
        i % 5 === 2 ? (
          <rect
            key={x}
            x={x - 4}
            y="3"
            width="8"
            height="2"
            fill="var(--color-brand-secondary)"
            opacity="0.9"
          />
        ) : (
          <Diamond
            key={x}
            cx={x}
            cy={4}
            r={i % 3 === 0 ? 2.2 : 1.7}
            fill={i % 4 === 1}
          />
        ),
      )}
    </svg>
  );
}

/**
 * Reusable Iraqi textile motif.
 * Always decorative — not focusable, not content.
 */
export function DecorativeMotif({
  variant,
  density = "subtle",
  tone = "navy",
  className,
  ...props
}: DecorativeMotifProps) {
  const common = cn(
    "pointer-events-none select-none",
    toneClass[tone],
    className,
  );

  if (variant === "divider") {
    return (
      <div
        className={cn(
          common,
          "flex items-center justify-center opacity-[var(--pattern-opacity-strong)]",
        )}
        role="presentation"
        data-motif="divider"
        aria-hidden
        {...props}
      >
        <DividerSvg />
      </div>
    );
  }

  if (variant === "border") {
    return (
      <div
        className={cn(
          common,
          "w-full opacity-[var(--pattern-opacity-strong)]",
        )}
        role="presentation"
        data-motif="border"
        aria-hidden
        {...props}
      >
        <BorderSvg />
      </div>
    );
  }

  if (variant === "corner" || variant === "card") {
    return (
      <div
        className={cn(
          common,
          densityOpacity[density],
          variant === "card"
            ? "size-[var(--pattern-size-sm)]"
            : "size-[var(--pattern-size-md)]",
        )}
        role="presentation"
        data-motif={variant}
        aria-hidden
        {...props}
      >
        <CornerSvg />
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div
        className={cn(common, densityOpacity[density], "w-full")}
        role="presentation"
        data-motif="strip"
        aria-hidden
        {...props}
      >
        <StripSvg />
      </div>
    );
  }

  if (variant === "floral-divider") {
    return (
      <div
        className={cn(
          common,
          "flex items-center justify-center opacity-[var(--pattern-opacity-strong)]",
        )}
        role="presentation"
        data-motif="floral-divider"
        aria-hidden
        {...props}
      >
        <FloralDividerSvg />
      </div>
    );
  }

  if (variant === "floral-border") {
    return (
      <div
        className={cn(
          common,
          "w-full opacity-[var(--pattern-opacity-strong)]",
        )}
        role="presentation"
        data-motif="floral-border"
        aria-hidden
        {...props}
      >
        <FloralBorderSvg />
      </div>
    );
  }

  if (variant === "floral-corner") {
    return (
      <div
        className={cn(
          common,
          densityOpacity[density],
          "size-[var(--pattern-size-md)]",
        )}
        role="presentation"
        data-motif="floral-corner"
        aria-hidden
        {...props}
      >
        <FloralCornerSvg />
      </div>
    );
  }

  if (variant === "floral-card") {
    return (
      <div
        className={cn(
          common,
          densityOpacity[density],
          "size-[var(--pattern-size-sm)]",
        )}
        role="presentation"
        data-motif="floral-card"
        aria-hidden
        {...props}
      >
        <FloralCardAccentSvg />
      </div>
    );
  }

  if (variant === "floral-side") {
    return (
      <div
        className={cn(
          common,
          densityOpacity[density],
          "absolute inset-y-0 w-[min(28%,7.5rem)] max-sm:w-[22%]",
        )}
        role="presentation"
        data-motif="floral-side"
        aria-hidden
        {...props}
      >
        <FloralSideSvg />
      </div>
    );
  }

  if (variant === "floral-field") {
    return (
      <div
        className={cn(
          common,
          densityOpacity[density],
          "absolute inset-0 overflow-hidden",
        )}
        role="presentation"
        data-motif="floral-field"
        aria-hidden
        {...props}
      >
        <FloralFieldSvg />
      </div>
    );
  }

  // hero — field motif, typically cropped to the visual side
  return (
    <div
      className={cn(
        common,
        densityOpacity[density],
        "absolute inset-y-0 end-0 w-[72%] max-w-md lg:w-[46%]",
      )}
      role="presentation"
      data-motif="hero"
      aria-hidden
      {...props}
    >
      <HeroFieldSvg />
    </div>
  );
}
