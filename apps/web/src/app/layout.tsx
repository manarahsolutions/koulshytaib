import type { Metadata } from "next";
import { Aref_Ruqaa, Readex_Pro } from "next/font/google";
import "./globals.css";

/** Display / headings — classical Ruqaa (Google: Aref Ruqaa). */
const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

/** Body / UI — modern Arabic-friendly sans. */
const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-readex-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "كلشي طيب",
    template: "%s | كلشي طيب",
  },
  description: "أكل بيتي دافئ — توصيل لباب البيت فقط. طلب كضيف بدون تسجيل.",
  openGraph: {
    title: "كلشي طيب",
    description: "أكل بيتي — توصيل فقط",
    locale: "ar_IQ",
    type: "website",
  },
};

/**
 * Brand typefaces (trial):
 * - Aref Ruqaa → display / headings (--font-aref-ruqaa → --font-display)
 * - Readex Pro → body / UI (--font-readex-pro → --font-family)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`h-full antialiased ${arefRuqaa.variable} ${readexPro.variable}`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
