import { CustomerShell } from "@/components/layout/customer-shell";
import { DbHydrateClient } from "@/components/system/db-hydrate-client";

/**
 * Customer app shell — guest-only.
 * Do not add login / profile / account here.
 */
export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DbHydrateClient scope="customer" />
      <CustomerShell>{children}</CustomerShell>
    </>
  );
}
