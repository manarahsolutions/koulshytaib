import { cn } from "@/lib/utils/cn";

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface-elevated p-4",
        className,
      )}
    >
      <p className="typo-caption text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-brand-navy">
        {value}
      </p>
      {hint ? (
        <p className="typo-caption mt-1 text-text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
