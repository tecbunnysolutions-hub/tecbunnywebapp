declare const GST_TIERS: readonly [0, 5, 12, 18, 28];
export type GstTier = typeof GST_TIERS[number];
export interface ProductTaxClassificationInput {
    title?: unknown;
    description?: unknown;
    category?: unknown;
    productType?: unknown;
    targetIndustry?: unknown;
    brand?: unknown;
    modelNumber?: unknown;
    specifications?: unknown;
}
export interface ProductTaxClassification {
    hsn_code: string;
    gst_rate: GstTier;
    confidence_score: number;
    justification: string;
}
export declare class TaxClassificationError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare function parseTaxClassification(raw: string): ProductTaxClassification;
export declare function classifyProductTax(input: ProductTaxClassificationInput, correlationId?: string): Promise<ProductTaxClassification>;
export {};
//# sourceMappingURL=tax-classification.d.ts.map