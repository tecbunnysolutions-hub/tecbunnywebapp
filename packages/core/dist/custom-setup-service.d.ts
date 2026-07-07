export type JsonRecord = Record<string, unknown>;
export interface CustomSetupComponentOptionRow {
    id: string;
    label: string;
    value: string | null;
    description: string | null;
    is_default: boolean | null;
    unit_price: number | null;
    metadata: JsonRecord | null;
}
export interface CustomSetupComponentRow {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
    is_required: boolean | null;
    min_quantity: number | null;
    max_quantity: number | null;
    default_quantity: number | null;
    quantity_variable: string | null;
    pricing_mode: string;
    base_price: number | null;
    unit_price: number | null;
    price_formula: string | null;
    metadata: JsonRecord | null;
    sort_order: number | null;
    options?: CustomSetupComponentOptionRow[] | null;
}
export interface CustomSetupSystemRow {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    sort_order: number | null;
    base_fee: number | null;
    pricing_formula: string | null;
    metadata: JsonRecord | null;
    is_default: boolean | null;
    components?: CustomSetupComponentRow[] | null;
}
export interface CustomSetupVariableRow {
    id: string;
    key: string;
    label: string;
    input_type: string;
    description: string | null;
    min_value: number | null;
    max_value: number | null;
    step_value: number | null;
    default_value: unknown;
    metadata: JsonRecord | null;
}
export interface CustomSetupTemplateRow {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
    hero_copy: string | null;
    base_price: number | null;
    currency: string | null;
    metadata: JsonRecord | null;
    systems?: CustomSetupSystemRow[] | null;
    variables?: CustomSetupVariableRow[] | null;
}
export interface CustomSetupBlueprintOptionSummary {
    id: string;
    label: string;
    value: string | null;
    unitPrice: number | null;
    metadata: JsonRecord | null;
    isDefault: boolean;
}
export interface CustomSetupBlueprintComponentSummary {
    slug: string;
    id: string;
    name: string;
    description: string | null;
    isRequired: boolean;
    optionCount: number;
    pricingMode: string;
    pricingFormula: string | null;
    quantityVariable: string | null;
    metadata: JsonRecord | null;
    defaultQuantity: number | null;
    defaultOption: CustomSetupBlueprintOptionSummary | null;
    options: CustomSetupBlueprintOptionSummary[];
    basePrice: number | null;
    unitPrice: number | null;
}
export interface CustomSetupBlueprintSystemSummary {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    isDefault: boolean;
    baseFee: number | null;
    pricingFormula: string | null;
    metadata: JsonRecord | null;
    components: CustomSetupBlueprintComponentSummary[];
}
export interface CustomSetupBlueprintVariableSummary {
    key: string;
    label: string;
    description: string | null;
    inputType: string;
    minValue: number | null;
    maxValue: number | null;
    stepValue: number | null;
    defaultValue: unknown;
    defaultDisplay: string | null;
    metadata: JsonRecord | null;
}
export interface CustomSetupBlueprintSummary {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    heroCopy: string | null;
    category: string | null;
    basePrice: number | null;
    currency: string | null;
    metadata: JsonRecord | null;
    variables: CustomSetupBlueprintVariableSummary[];
    systems: CustomSetupBlueprintSystemSummary[];
}
export declare function fetchCustomSetupTemplateBySlug(slug: string): Promise<CustomSetupTemplateRow | null>;
export declare function buildCustomSetupBlueprintSummary(template: CustomSetupTemplateRow | null): CustomSetupBlueprintSummary | null;
export declare function getCustomSetupBlueprintSummary(slug: string): Promise<CustomSetupBlueprintSummary | null>;
//# sourceMappingURL=custom-setup-service.d.ts.map