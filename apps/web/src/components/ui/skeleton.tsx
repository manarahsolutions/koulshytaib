import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Radius token key */
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
};

const roundedClass = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

export function Skeleton({
  className,
  rounded = "md",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-border-soft",
        roundedClass[rounded],
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
