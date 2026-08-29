import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type FormSectionProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  children: ReactNode;
};

/** Quiet section chrome for checkout forms — clarity over decoration. */
export function FormSection({
  title,
  description,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
        {description ? (
          <p className="typo-caption text-text-muted">{description}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
