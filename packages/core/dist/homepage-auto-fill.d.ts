import type { Product } from '@tecbunny/core';
export type AutoFillResult = {
    featured: Product[];
    newArrivals: Product[];
    trending: Product[];
    deals: Product[];
};
export declare function computeAutoFill(productsList: Product[], salesCounts: Map<string, number>, options?: {
    limit?: number;
    analyticsData?: Map<string, any>;
}): AutoFillResult;
//# sourceMappingURL=homepage-auto-fill.d.ts.map