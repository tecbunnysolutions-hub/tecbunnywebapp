export interface CatalogueItem {
    id: string;
    name: string;
    title?: string;
    description?: string;
    price: number;
    mrp?: number;
    category: string;
    brand?: string;
}
export declare function generateCataloguePdf(options: {
    products: CatalogueItem[];
    services: CatalogueItem[];
    includePricing: boolean;
}): Promise<Buffer>;
//# sourceMappingURL=catalogue-pdf-generator.d.ts.map