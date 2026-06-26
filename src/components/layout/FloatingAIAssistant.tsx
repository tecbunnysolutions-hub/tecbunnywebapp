'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, X, Sparkles, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

const EXCLUDED_PREFIXES = ['/auth', '/mgmt', '/checkout'];

export function FloatingAIAssistant() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = React.useState(false);

  const isExcluded = EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isExcluded) return null;

  const aiHref = '/ai-research';

  return (
    <div className="floating-ai-anchor fixed bottom-6 right-4 z-50 sm:right-6 flex flex-col gap-4 items-end">
      {open && (
        <div className="mb-1 w-[290px] rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                <p className="text-xs text-muted-foreground">Ask anything about products.</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close AI assistant"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <Link
              href={aiHref}
              className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/20"
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Start AI Research
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[11px] text-muted-foreground">
              Need pricing? Share your requirements and get recommendations.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* WhatsApp Button */}
        <Link
          href="https://wa.me/919604136010?text=I%20need%20more%20information"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_0_25px_rgba(37,211,102,0.45)] transition hover:shadow-[0_0_35px_rgba(37,211,102,0.65)] hover:scale-105"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 transition-transform group-hover:scale-110" aria-hidden="true">
            <path d="M12.031 0C5.4 0 .025 5.376.023 12.012c0 2.115.552 4.184 1.597 5.993L.014 24l6.155-1.615c1.745.952 3.708 1.455 5.86 1.456h.005c6.629 0 12.005-5.378 12.007-12.016C24.037 5.19 21.61 2.21 17.514 0h-5.483zM12.03 21.84h-.004c-1.782 0-3.533-.478-5.06-1.385l-.364-.214-3.766.987.998-3.668-.235-.373c-1-1.587-1.528-3.418-1.527-5.305.002-5.541 4.512-10.05 10.057-10.05 2.684.001 5.207 1.047 7.104 2.946 1.895 1.898 2.94 4.417 2.94 7.102 0 5.543-4.51 10.051-10.051 10.051zm5.518-7.534c-.302-.15-1.788-.881-2.064-.982-.276-.1-.476-.151-.676.151-.202.302-.779.982-.953 1.183-.175.202-.351.226-.653.076-1.579-.785-2.73-1.674-3.805-3.5-.175-.298-.018-.46.133-.611.135-.136.302-.352.453-.528.151-.176.201-.302.302-.503.1-.201.05-.377-.025-.528-.075-.15-1.025-2.476-1.403-3.391-.368-.888-.745-.768-1.026-.782-.25-.013-.537-.015-.838-.015-.302 0-.791.113-1.205.565-.414.453-1.583 1.547-1.583 3.774 0 2.227 1.621 4.381 1.847 4.683.226.302 3.197 4.882 7.747 6.842 1.082.468 1.927.747 2.585.956 1.086.345 2.073.296 2.853.18.868-.131 2.673-1.092 3.05-2.147.376-1.055.376-1.959.263-2.148-.112-.189-.413-.302-.716-.453z"/>
          </svg>
        </Link>

        {/* AI Bot Button */}
        <button
          type="button"
          aria-label="Open AI assistant"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'group flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/60 to-primary text-white shadow-[0_0_25px_rgba(37,99,235,0.45)] transition hover:shadow-[0_0_35px_rgba(37,99,235,0.65)]',
            open && 'ring-2 ring-primary/60'
          )}
        >
          <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}
