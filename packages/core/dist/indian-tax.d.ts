export type IndianStateTaxInfo = {
    code: string;
    name: string;
};
export declare function resolveIndianStateInfo(value: unknown): IndianStateTaxInfo | null;
export declare function resolveIndianStateFromText(value: unknown): IndianStateTaxInfo | null;
export declare function formatPlaceOfSupply(stateInfo: IndianStateTaxInfo | null, fallbackState?: string | null): string;
export declare const TECBUNNY_REGISTERED_STATE: IndianStateTaxInfo;
//# sourceMappingURL=indian-tax.d.ts.map