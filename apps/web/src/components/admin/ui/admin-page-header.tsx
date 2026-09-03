"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export type AdminPanelProps = {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
};

export function AdminPanel({
  children,
  className,
  padded = true,
}: AdminPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-soft bg-surface-elevated shadow-xs",
        padded && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type AdminNavLinkProps = {
  href: string;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
  nested?: boolean;
};

export function AdminNavLink({
  href,
  label,
  active,
  onNavigate,
  nested,
}: AdminNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex h-10 items-center rounded-xl text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        nested ? "px-3 ps-4" : "px-3",
        active
          ? "bg-brand-navy text-on-primary"
          : "text-text hover:bg-surface-warm",
      )}
    >
      {label}
    </Link>
  );
}
