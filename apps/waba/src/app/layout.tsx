import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EnterpriseAnalyticsAutoTracker } from "@tecbunny/core/components/EnterpriseAnalyticsAutoTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WABA Management — TecBunny Solutions",
  description: "WhatsApp Business Account management portal for TecBunny Solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <EnterpriseAnalyticsAutoTracker application="waba" defaultModule="whatsapp" dashboardPaths={['/', '/analytics', '/campaigns', '/contacts', '/templates']} />
        {children}
      </body>
    </html>
  );
}
