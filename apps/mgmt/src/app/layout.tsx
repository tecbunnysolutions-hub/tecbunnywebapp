import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AppProvider } from "@tecbunny/core/context/AppProvider";
import { EnterpriseAnalyticsAutoTracker } from "@tecbunny/core/components/EnterpriseAnalyticsAutoTracker";
import { TRPCProvider } from "../components/providers/TRPCProvider";

export const metadata: Metadata = {
  title: {
    default: "Management Portal | TecBunny Solutions",
    template: "%s | Mgmt — TecBunny",
  },
  description: "TecBunny internal management portal for CRM, orders, operations, and admin tasks.",
  robots: "noindex, nofollow",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Render per request so Next.js applies the CSP nonce from the gateway to
  // its inline scripts; the portal's policy does not allow unsafe-inline.
  await headers();

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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppProvider>
          <TRPCProvider>
            <EnterpriseAnalyticsAutoTracker application="mgmt" defaultModule="management" dashboardPaths={['/mgmt', '/admin', '/analytics']} />
            {children}
          </TRPCProvider>
        </AppProvider>
      </body>
    </html>
  );
}
