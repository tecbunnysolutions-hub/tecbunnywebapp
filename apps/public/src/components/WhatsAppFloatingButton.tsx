'use client';

import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useAnalytics, logger } from '@tecbunny/core';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

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

/**
 * Module 4 — product-context click-to-chat. Builds a wa.me deep link carrying
 * the product name and SKU so sales staff see the inquiry context immediately.
 */
export function getWhatsAppProductInquiryUrl(productName: string, sku?: string): string {
  const phone = '919604136010';
  const safeName = (productName || 'a product').trim().slice(0, 120);
  const safeSku = (sku || '').trim().slice(0, 64);
  const message = `Hi TecBunny, I'm inquiring about ${safeName}${safeSku ? ` - SKU: ${safeSku}` : ''}. Please share pricing and availability.`;
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
    } catch (err) {
      // Analytics must never block navigation to WhatsApp
      logger.error('WhatsApp click tracking failed', { error: err instanceof Error ? err.message : String(err) });
    }
  };

  const whatsappUrl = getWhatsAppConsultationUrl(defaultContext, defaultService);

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 group">
      {/* Subtle floating prompt */}
      {!isDismissed && !isOpen && (
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-success/30 bg-background/90 px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs text-muted-foreground animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse text-success-foreground" />
          <span>Need quick tech advice? <strong>Chat with our team</strong></span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="ml-1 text-muted-foreground hover:text-muted-foreground"
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-xl shadow-success/30 transition-all duration-300 hover:scale-110 hover:shadow-success/25 active:scale-95"
        aria-label="Chat on WhatsApp with TecBunny Solutions"
      >
        <WhatsAppIcon className="h-7 w-7 fill-white" />
      </a>
    </div>
  );
}
