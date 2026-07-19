export const productTelemetryEvents = [
  'command_palette_action_selected',
  'order_table_view_saved',
  'waba_canned_reply_inserted',
  'webmail_reply_staged',
  'launch_health_blocker_viewed',
] as const;

export type ProductTelemetryEvent = typeof productTelemetryEvents[number];

type ProductTelemetryPayload = Record<string, string | number | boolean | null | undefined>;

export function trackProductEvent(event: ProductTelemetryEvent, payload: ProductTelemetryPayload = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('tecbunny:product-telemetry', {
    detail: {
      event,
      payload,
      timestamp: new Date().toISOString(),
    },
  }));
}