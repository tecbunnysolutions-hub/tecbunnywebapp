type QuoteActionScope = 'quote_customer' | 'advance_payment';
export declare function createQuoteActionToken(quoteId: string, scope: QuoteActionScope, ttlSeconds?: number): string;
export declare function verifyQuoteActionToken(token: unknown, quoteId: string, allowedScopes: QuoteActionScope[]): boolean;
export {};
//# sourceMappingURL=action-token.d.ts.map