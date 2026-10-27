import './globals.css';
import { ThemeControls } from '../../../../packages/ui/src/components/ThemeControls';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EnterpriseAnalyticsAutoTracker } from '@tecbunny/core/components/EnterpriseAnalyticsAutoTracker';

export const metadata: Metadata = {
  title: 'Webmail — TecBunny',
  description: 'TecBunny internal webmail interface',
  robots: { index: false, follow: false },
};

export default function WebmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted font-sans antialiased">
        <ThemeControls floating />
        <EnterpriseAnalyticsAutoTracker application="webmail" defaultModule="mail" dashboardPaths={['/inbox']} />
        <div className="flex h-dvh min-h-0 flex-col overflow-hidden md:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 border-b border-border bg-card text-muted-foreground flex flex-col md:w-56 md:border-b-0 md:border-r">
            <div className="px-5 py-4 border-b border-border">
              <span className="font-bold text-sm tracking-wide text-foreground">TecBunny Mail</span>
            </div>
            <nav className="flex gap-1 overflow-x-auto p-3 md:block md:flex-1 md:space-y-1 md:overflow-y-auto">
              {[
                { href: '/inbox', label: 'Inbox', badge: null },
                { href: '/compose', label: 'Compose', badge: null },
                { href: '/sent', label: 'Sent', badge: null },
                { href: '/drafts', label: 'Drafts', badge: null },
                { href: '/trash', label: 'Trash', badge: null },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          {/* Main */}
          <main className="min-h-0 min-w-0 flex-1 overflow-auto bg-background" id="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
