import type { Metadata } from "next";
import { EnterpriseAnalyticsAutoTracker } from "@tecbunny/core/components/EnterpriseAnalyticsAutoTracker";
import "./globals.css";

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
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        ['--font-geist-sans' as string]: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        ['--font-geist-mono' as string]: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <EnterpriseAnalyticsAutoTracker application="waba" defaultModule="whatsapp" dashboardPaths={['/', '/analytics', '/campaigns', '/contacts', '/templates']} />
        {children}
      </body>
    </html>
  );
}
