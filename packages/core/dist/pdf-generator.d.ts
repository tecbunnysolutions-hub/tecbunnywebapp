export declare function loadCompanyInfo(): Promise<{
    companyName: string;
    registeredAddress: string;
    supportEmail: string;
    supportPhone: string;
    gstin: string;
    cin: string;
    pan: string;
    tan: string;
    logoUrl: string;
}>;
export declare function buildPdf(options: {
    company: Record<string, any>;
    customerName: string;
    customerEmail: string;
    gstIncluded: boolean;
    summary?: string;
    selections?: any;
    quoteNumber?: string;
}): Promise<Buffer<ArrayBuffer>>;
//# sourceMappingURL=pdf-generator.d.ts.map