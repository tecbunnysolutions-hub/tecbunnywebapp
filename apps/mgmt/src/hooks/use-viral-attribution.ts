'use client';

import { useCallback } from 'react';
import { logger } from '@tecbunny/core';

const VIRAL_ATTRIBUTION_KEY = 'tecbunny_viral_parent';
const ATTRIBUTION_EXPIRY_DAYS = 30;

/**
 * User Attribution Persistence Matrix Hook
 */
export function useViralAttribution() {
  const trackLanding = useCallback((blueprintId: string) => {
    try {
      // Check if cookie already exists
      const hasCookie = document.cookie.split('; ').find(row => row.startsWith(`${VIRAL_ATTRIBUTION_KEY}=`));
      
      if (!hasCookie) {
        // Securely set the cookie so the server can read it during checkout
        const date = new Date();
        date.setTime(date.getTime() + (ATTRIBUTION_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        
        // Use path=/ to make it accessible across the app
        // Secure flag should be true in production, but we keep it simple here
        document.cookie = `${VIRAL_ATTRIBUTION_KEY}=${blueprintId}; ${expires}; path=/; SameSite=Lax`;
        
        logger.info('viral_attribution_marker_dropped', { blueprintId });
      }
    } catch (err) {
      console.error('Failed to drop viral attribution marker', err);
    }
  }, []);

  const getParentAttribution = useCallback(() => {
    try {
      const cookieRow = document.cookie.split('; ').find(row => row.startsWith(`${VIRAL_ATTRIBUTION_KEY}=`));
      if (!cookieRow) return null;
      
      const parentBlueprintId = cookieRow.split('=')[1];
      return { parentBlueprintId, converted: false }; // converted state is managed server-side now
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return null;
    }
  }, []);

  const markConversion = useCallback(async (orderId: string) => {
    // SECURITY REMEDIATION:
    // Client-side conversion attribution is a critical fraud vector.
    // Conversions are now automatically handled server-side during the secure 
    // payment webhook callback (e.g., PayU/UPI success) by reading the `tecbunny_viral_parent` cookie.
    logger.info('client_side_conversion_deprecated', { 
      message: 'Conversion attribution is now handled server-side.',
      orderId 
    });
  }, []);

  return { trackLanding, getParentAttribution, markConversion };
}
