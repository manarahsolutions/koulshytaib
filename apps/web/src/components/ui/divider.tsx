import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  label?: string;
};

export function Divider({ label, className, ...props }: DividerProps) {
  if (!label) {
    return (
      <hr
        className={cn("border-0 border-t border-border-soft", className)}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="separator"
      aria-label={label}
    >
      <span className="h-px flex-1 bg-border-soft" />
      <span className="typo-caption shrink-0 text-text-subtle">{label}</span>
      <span className="h-px flex-1 bg-border-soft" />
    </div>
  );
}
