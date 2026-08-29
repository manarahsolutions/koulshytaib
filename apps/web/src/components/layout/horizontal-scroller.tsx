import { cn } from "@/lib/utils/cn";

export type HorizontalScrollerProps = {
  children: React.ReactNode;
  className?: string;
  /** Accessible name for the scroll region */
  "aria-label": string;
};

/**
 * Touch-friendly horizontal rail with snap, padded peek of next item,
 * and visually hidden scrollbar (content remains keyboard-scrollable).
 */
export function HorizontalScroller({
  children,
  className,
  "aria-label": ariaLabel,
}: HorizontalScrollerProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        "flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth",
        "snap-x snap-mandatory",
        "pb-1 pe-4 sm:pe-6 lg:pe-8",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        className,
      )}
    >
      {children}
    </div>
  );
}
