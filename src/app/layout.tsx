import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { StructuredData } from "@/components/seo/StructuredData";
import { SkipLink } from "@/components/accessibility/SkipLink";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1062eb",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Ambition Valley - Belasting Check",
  description: "Doe de gratis 2-minuten check: Deelnemers besparen gemiddeld €3.000 tot €15.000 belasting per jaar",
  metadataBase: new URL("https://check.ambitionvalley.nl"),
  icons: {
    icon: [
      { url: "/av-favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/av-webclip.ico", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Ambition Valley - Belasting Check",
    description: "Doe de gratis 2-minuten check: Deelnemers besparen gemiddeld €3.000 tot €15.000 belasting per jaar",
    type: "website",
    locale: "nl_NL",
    siteName: "Ambition Valley",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ambition Valley - Belasting Check",
    description: "Doe de gratis 2-minuten check: Deelnemers besparen gemiddeld €3.000 tot €15.000 belasting per jaar",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="bg-[#1062eb]">
      <body className={`${inter.variable} font-sans antialiased bg-[#1062eb] min-h-screen`}>
        <SkipLink targetId="main-content" />
        <GoogleAnalytics />
        <StructuredData type="WebApplication" />
        <StructuredData type="Organization" />
        {children}
      </body>
    </html>
  );
}
