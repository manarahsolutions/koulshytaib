type ClassValue = string | false | null | undefined;

/** Minimal className joiner — no external dependency. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
