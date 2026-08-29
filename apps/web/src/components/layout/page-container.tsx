import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * `default` — padded max-width content column.
   * `narrow` — reading / form width.
   * `wide` — larger desktop max.
   * `full` — edge-to-edge (section manages its own inner padding).
   */
  width?: "default" | "narrow" | "wide" | "full";
  /** Extra vertical rhythm for page stacks */
  paddedY?: boolean;
};

const widthClass = {
  narrow: "mx-auto w-full max-w-xl px-4 sm:px-6",
  default: "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8",
  wide: "mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8",
  full: "w-full px-0",
} as const;

/**
 * Shared content container — pages should not invent their own gutters.
 */
export function PageContainer({
  width = "default",
  paddedY = true,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        widthClass[width],
        paddedY && "py-6 sm:py-8 lg:py-10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
