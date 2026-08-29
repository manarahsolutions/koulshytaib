import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

/** Label + control + error wiring for checkout fields. */
export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="typo-label text-text">
        {label}
        {required ? (
          <span className="text-brand-primary" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-text-subtle"> (اختياري)</span>
        )}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="typo-caption text-text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="typo-caption text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldDescribedBy(
  id: string,
  error?: string,
  hint?: string,
): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
