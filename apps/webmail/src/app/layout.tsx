import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Webmail — TecBunny',
  description: 'TecBunny internal webmail interface',
};

export default function WebmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-700">
              <span className="font-bold text-sm tracking-wide text-white">TecBunny Mail</span>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          {/* Main */}
          <main className="flex-1 overflow-auto bg-white" id="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
