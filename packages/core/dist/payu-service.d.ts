export type PayuEnvironment = 'test' | 'production';
type PayuUdfKey = 'udf1' | 'udf2' | 'udf3' | 'udf4' | 'udf5' | 'udf6' | 'udf7' | 'udf8' | 'udf9' | 'udf10';
export interface PayuConfig {
    merchantKey: string;
    merchantSalt: string;
    environment: PayuEnvironment;
}
export interface PayuRequestPayload extends Partial<Record<PayuUdfKey, string>> {
    txnId: string;
    amount: string;
    productInfo: string;
    firstName: string;
    email: string;
    phone?: string;
}
export declare const sanitizeHashValue: (val: string | number | undefined | null) => string;
export declare function getPayuPaymentUrl(environment: PayuEnvironment): string;
export declare function normalisePayuEnvironment(value: string | null | undefined): PayuEnvironment;
export declare function generatePayuHash(config: PayuConfig, payload: PayuRequestPayload): string;
export declare function verifyPayuHash(config: PayuConfig, response: Record<string, string | undefined>): boolean;
export {};
//# sourceMappingURL=payu-service.d.ts.map