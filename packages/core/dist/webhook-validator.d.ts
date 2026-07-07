/**
 * Validates custom webhook signature using HMAC-SHA256.
 * In development mode, skips validation unless signature and secret are provided.
 */
export declare function validateWebhookSignature(signature: string | null | undefined, bodyString: string, secret: string | null | undefined): boolean;
/**
 * Validates the timestamp of incoming webhooks to prevent Replay Attacks.
 * Ensures the timestamp is within the allowed 5-minute tolerance window.
 * @param incomingTimestamp The timestamp sent with the webhook (in seconds).
 */
export declare function validateWebhookTimestamp(incomingTimestamp: number): boolean;
//# sourceMappingURL=webhook-validator.d.ts.map