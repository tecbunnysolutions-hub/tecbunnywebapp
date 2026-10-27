import { ThemeControls } from '../../../../packages/ui/src/components/ThemeControls';
import type { Metadata } from "next";
import { EnterpriseAnalyticsAutoTracker } from "@tecbunny/core/components/EnterpriseAnalyticsAutoTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Operations | TecBunny",
  description: "Monitor TecBunny API activity and service operations.",
  robots: { index: false, follow: false },
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeControls floating />
        <EnterpriseAnalyticsAutoTracker application="api" defaultModule="api-dashboard" dashboardPaths={['/dashboard', '/health']} />
        {children}
      </body>
    </html>
  );
}
