"use client";

import { usePathname } from "next/navigation";
import { CustomerFooter } from "@/components/layout/customer-footer";

export function CustomerFooterClient() {
  const pathname = usePathname() ?? "/";
  return <CustomerFooter pathname={pathname} />;
}
