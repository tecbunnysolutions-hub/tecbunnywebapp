'use client';

import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useAnalytics } from '@tecbunny/core';

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.25 0 4.56-3.69 8.25-8.25 8.25-1.53 0-3-.42-4.29-1.19l-.3-.18-3.18.83.85-3.11-.2-.32a8.182 8.182 0 0 1-1.25-4.38c0-4.56 3.69-8.25 8.25-8.25M9.42 7.72l-.12.02c-.15.03-.3.06-.44.09-.15.03-.28.06-.41.1-.39.12-.76.3-1.09.56-.33.27-.63.6-.88.97-.27.41-.43.85-.43 1.32 0 .5.16.98.48 1.41.32.43.72.84 1.2 1.24.48.4 1 1.03 1.63 1.28.63.25 1.22.4 1.84.4.45 0 .86-.08 1.23-.25.37-.17.63-.38.83-.63.2-.25.32-.54.4-.85.08-.31.13-.64.13-1s-.05-.72-.13-1.03c-.08-.31-.2-.59-.4-.84-.2-.25-.46-.46-.83-.63-.37-.17-.78-.25-1.23-.25-.62 0-1.21.15-1.84.4-.05.02-.1.04-.15.07-.1.03-.18.07-.27.1-.1.03-.18.05-.28.07l-.17.04c-.06.01-.1.02-.12.02-.02 0-.04.01-.06.01-.02 0-.03 0-.03-.01s0-.01 0-.01l-.01-.01c0-.01.01-.02.01-.04 0-.02 0-.04.01-.06.01-.02.01-.04.02-.06a.7.7 0 0 1 .05-.12c.04-.08.08-.15.14-.23.06-.08.12-.15.2-.22.07-.07.15-.14.23-.2.08-.06.16-.12.25-.17.09-.05.18-.09.28-.13.05-.02.1-.04.13-.05.28-.11.53-.17.75-.17.22 0 .43.03.62.09.19.06.37.14.53.25.16.11.3.25.41.41s.19.34.24.54c.05.2.07.4.07.61 0 .02 0 .03 0 .03s0 .02 0 .02l-.01.03c0 .01-.01.02-.01.03 0 .01-.01.02-.02.03-.01.01-.02.02-.04.03l-.05.03-.06.03c-.02.01-.05.02-.08.03-.03.01-.06.02-.1.04-.04.01-.07.02-.11.04-.04.01-.07.03-.11.04-.04.02-.07.03-.1.05s-.07.04-.1.06-.06.04-.1.07c-.03.02-.06.04-.1.07l-.07.05c-.01 0-.01.01-.01.01s0 .01 0 .01l.01.01c.22-.12.44-.24.67-.35.23-.11.45-.24.67-.35.22-.11.44-.22.65-.33.21-.11.42-.22.62-.33l.2-.1c.14-.07.26-.15.39-.22.13-.07.25-.15.36-.24.11-.09.22-.18.31-.29s.18-.23.25-.36a2.64 2.64 0 0 0 .28-1.38c0-.52-.13-1-.39-1.44a3.17 3.17 0 0 0-1.08-1.21c-.4-.33-.86-.57-1.36-.72s-1.02-.22-1.56-.22c-.54 0-1.06.07-1.56.22s-.96.39-1.36.72c-.4.34-.72.75-.97 1.21-.25.46-.38.96-.38 1.51 0 .42.09.82.26 1.17.17.35.4.66.68.92.28.26.59.47.92.62.33.15.68.25 1.04.28h.1c.02 0 .03 0 .03-.01s0-.01 0-.01l-.01-.01c0-.01 0-.01.01-.02l.01-.02c0-.01.01-.02.01-.03l.01-.03c.01-.02.01-.03.01-.05 0-.02 0-.04.01-.06 0-.02.01-.04.01-.06a.71.71 0 0 0 0-.1c0-.04 0-.08-.02-.13s-.04-.1-.07-.15a.43.43 0 0 0-.1-.13c-.04-.04-.08-.08-.13-.11-.05-.03-.1-.06-.17-.08-.07-.02-.13-.04-.2-.06-.07-.02-.15-.03-.22-.04-.04-.01-.07-.01-.11-.02l-.11-.02h-.04z" />
    </svg>
  );
}

export function getWhatsAppConsultationUrl(context?: string, service?: string): string {
  const phone = '919604136010';
  let message = 'Hi TecBunny, I would like to discuss a technology requirement for my business.';

  if (service) {
    message = `Hi TecBunny, I would like to request an assessment for ${service} for my business.`;
  } else if (context) {
    message = `Hi TecBunny, I am contacting you regarding ${context} for my organization.`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppFloatingButton({
  defaultService,
  defaultContext,
}: {
  defaultService?: string;
  defaultContext?: string;
}) {
  const { trackEvent } = useAnalytics();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleClick = () => {
    try {
      trackEvent('whatsapp_clicked', {
        context: defaultContext || 'floating_button',
        service: defaultService || 'general',
      });
    } catch {
      // safe fallback
    }
  };

  const whatsappUrl = getWhatsAppConsultationUrl(defaultContext, defaultService);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group">
      {/* Subtle floating prompt */}
      {!isDismissed && !isOpen && (
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs text-zinc-200 animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Need quick tech advice? <strong>Chat with our team</strong></span>
          <button 
            type="button" 
            onClick={() => setIsDismissed(true)} 
            className="ml-1 text-zinc-500 hover:text-zinc-300"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-950/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/25 active:scale-95"
        aria-label="Chat on WhatsApp with TecBunny Solutions"
      >
        <WhatsAppIcon className="h-7 w-7 fill-white" />
      </a>
    </div>
  );
}
