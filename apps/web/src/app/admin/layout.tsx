/**
 * Admin root layout — no chrome.
 * Login is public; console lives under (app) with auth gate.
 */
export const metadata = {
  title: "لوحة التحكم",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
