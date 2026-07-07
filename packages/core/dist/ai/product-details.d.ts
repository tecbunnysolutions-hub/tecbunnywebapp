export interface AiProductDetails {
    title?: string;
    vendor?: string;
    brand?: string;
    category?: string;
    productType?: string;
    tags?: string[];
    description?: string;
    price?: number | null;
    mrp?: number | null;
    hsnCode?: string;
    gstRate?: string;
    warranty?: string;
    modelNumber?: string;
    barcode?: string;
    specifications?: Record<string, string>;
    installationApplicable?: boolean;
    installationCharge?: number | null;
    handleSuggestion?: string;
    imageUrl?: string;
    productUrl?: string;
}
export interface AiProductDetailsRequest {
    productUrl: string;
    existingData?: Partial<AiProductDetails>;
}
export declare function fetchAiProductDetails(input: AiProductDetailsRequest): Promise<AiProductDetails>;
export declare function formatAiSpecifications(specifications?: Record<string, string> | null): string;
//# sourceMappingURL=product-details.d.ts.map