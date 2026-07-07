export declare function logWebhookEvent(supabase: any, eventType: string, payload: any, source: string, processed: boolean, errorMessage?: string, startTime?: Date, eventId?: string): Promise<void>;
export declare function updateWebhookEventStatus(supabase: any, eventId: string, processed: boolean, errorMessage?: string): Promise<void>;
export type WebhookEventStatus = 'pending' | 'processed' | 'failed' | 'processed_with_warnings' | 'unknown';
export declare function getProcessingTimeSeconds(createdAt: string, processedAt: string | null): number | null;
//# sourceMappingURL=webhook-logger.d.ts.map