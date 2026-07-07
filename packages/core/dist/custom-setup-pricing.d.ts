import type { CustomSetupBlueprintSummary, CustomSetupBlueprintComponentSummary } from "@tecbunny/core/custom-setup-service";
export type SetupSystem = 'analog' | 'ip';
export interface PriceEntry {
    id: string;
    label: string;
    mrp: number | null;
    sale: number;
}
export type CapacityPriceEntry = PriceEntry & {
    capacity: number;
    variant?: string;
};
export type CameraPriceMatrix = {
    standard: PriceEntry;
    dualLight: PriceEntry;
};
export interface CablePriceEntry {
    id: string;
    label: string;
    coverageMeters: number;
    mrpPerUnit: number;
    salePerUnit: number;
}
export interface AnalogPricing {
    dvr: CapacityPriceEntry[];
    smps: CapacityPriceEntry[];
    camera: {
        '2.4mp': CameraPriceMatrix;
        '5mp': CameraPriceMatrix;
    };
    cable: CablePriceEntry[];
}
export interface IpPricing {
    nvr: CapacityPriceEntry[];
    poe: CapacityPriceEntry[];
    camera: {
        '2mp': CameraPriceMatrix;
        '5mp': CameraPriceMatrix;
    };
    cable: CablePriceEntry[];
}
export declare const FALLBACK_ANALOG_PRICING: AnalogPricing;
export declare const FALLBACK_IP_PRICING: IpPricing;
export declare const FALLBACK_HDD_OPTIONS: PriceEntry[];
export declare const FALLBACK_MONITOR_OPTION: PriceEntry;
export declare const FALLBACK_MONITOR_OPTIONS: PriceEntry[];
export declare const FALLBACK_WALL_MOUNT_ADDON: PriceEntry;
export declare const FALLBACK_SPIKE_GUARD_OPTION: PriceEntry;
export declare const FALLBACK_RACK_OPTIONS: PriceEntry[];
export declare const FALLBACK_CONDUIT_PIPE_OPTIONS: PriceEntry[];
export declare const FALLBACK_INSTALLATION_OPTION: PriceEntry;
export declare function findComponentBySlug(system: CustomSetupBlueprintSummary['systems'][number] | undefined, slugs: string[]): CustomSetupBlueprintComponentSummary | undefined;
export declare function readNumericMetadata(meta: Record<string, unknown> | null | undefined, key: string): number | null;
export declare function readBooleanMetadata(meta: Record<string, unknown> | null | undefined, key: string): boolean | null;
export declare function resolvePricePair(option: CustomSetupBlueprintComponentSummary['options'][number] | undefined, component: CustomSetupBlueprintComponentSummary | undefined, fallbackMrp: number, fallbackSale: number): {
    mrp: number;
    sale: number;
};
export declare function parseChannelCapacity(label: string): number | null;
export declare function normalizeCapacity(option: CustomSetupBlueprintComponentSummary['options'][number] | undefined, fallbackCapacity: number): number;
export declare function normalizeMegapixels(option: CustomSetupBlueprintComponentSummary['options'][number] | undefined, fallback: number): number;
export declare function buildCapacityEntries(component: CustomSetupBlueprintComponentSummary | undefined, fallback: CapacityPriceEntry[]): CapacityPriceEntry[];
export declare function buildCableEntries(component: CustomSetupBlueprintComponentSummary | undefined, fallback: CablePriceEntry[]): CablePriceEntry[];
export declare function buildCameraMatrix(component: CustomSetupBlueprintComponentSummary | undefined, resolutionKey: '2.4mp' | '5mp' | '2mp', fallback: CameraPriceMatrix): CameraPriceMatrix;
export declare function buildHddOptionsFromComponents(components: Array<CustomSetupBlueprintComponentSummary | undefined>, fallback: PriceEntry[]): PriceEntry[];
export declare function pickFirstOption(component: CustomSetupBlueprintComponentSummary | undefined): PriceEntry | null;
export declare function pickCapacityOption(options: CapacityPriceEntry[], cameraCount: number): CapacityPriceEntry;
export declare function calculateQuantity(cameraCount: number, capacity: number): number;
export declare function calculateCableQuantity(cameraCount: number, cable: CablePriceEntry, cableUnits?: number, constants?: Record<string, number>): number;
export declare function calculateCableMetersFromUnits(cableUnits: number): number;
export declare function roundUpToThousandMinusOne(value: number): number;
export declare function calculateInstallationCharges(system: SetupSystem, cameraCount: number, cableUnits: number, monitorStand?: 'none' | 'static' | 'movable', rackIncluded?: boolean, constants?: Record<string, number>): {
    sale: number;
    breakdown: string[];
};
export declare function recommendedAnalogDvrCapacity(cameraCount: number): number;
export declare function recommendedAnalogSmpsCapacity(cameraCount: number): number;
export declare function recommendedIpCapacity(cameraCount: number): number;
export declare function recommendedPoePortCapacity(cameraCount: number): number;
export declare function formatCurrency(value: number): string;
export interface AnalogSelections {
    dvrId: string;
    smpsId: string;
    cableId: string;
    resolution: '2.4mp' | '5mp';
    dualLight: boolean;
}
export interface IpSelections {
    nvrId: string;
    poeId: string;
    cableId: string;
    resolution: '2mp' | '5mp';
    dualLight: boolean;
}
export interface ActiveOffer {
    id: string;
    title: string;
    description: string;
    offerType: 'PERCENTAGE_DISCOUNT' | 'FREE_INSTALLATION' | 'FREE_ACCESSORY';
    offerValue: string;
    endDate: string;
}
export interface Totals {
    system: {
        mrp: number;
        sale: number;
        breakdown: string[];
    };
    hdd: {
        mrp: number;
        sale: number;
        label: string;
    };
    monitor: {
        mrp: number;
        sale: number;
        included: boolean;
        label: string;
    };
    wallMount: {
        mrp: number;
        sale: number;
        included: boolean;
    };
    spikeGuard: {
        mrp: number;
        sale: number;
        included: boolean;
    };
    rack: {
        mrp: number;
        sale: number;
        selected: boolean;
        label: string;
    };
    conduit: {
        mrp: number;
        sale: number;
        selected: boolean;
        label: string;
        meters: number;
    };
    installation: {
        mrp: number;
        sale: number;
        included: boolean;
    };
    installationLabor: {
        sale: number;
        breakdown: string[];
    };
    overall: {
        mrp: number;
        sale: number;
        discountAmount: number;
        discountPercent: number;
    };
    appliedOffer?: {
        title: string;
        originalSale: number;
        discountedSale: number;
        savings: number;
    } | null;
}
export declare function buildAnalogSystemSummary(cameraCount: number, selections: AnalogSelections, pricing: AnalogPricing, cableUnits?: number, constants?: Record<string, number>): {
    mrp: number;
    sale: number;
    breakdown: string[];
};
export declare function buildIpSystemSummary(cameraCount: number, selections: IpSelections, pricing: IpPricing, cableUnits?: number, constants?: Record<string, number>): {
    mrp: number;
    sale: number;
    breakdown: string[];
};
export interface PricingCatalog {
    analog: AnalogPricing;
    ip: IpPricing;
    hddOptions: PriceEntry[];
    monitorOptions: PriceEntry[];
    rackOptions: PriceEntry[];
    conduitOptions: PriceEntry[];
    wallMountAddon: PriceEntry;
    spikeGuardOption: PriceEntry;
    monitorOption: PriceEntry;
    installationOption: PriceEntry;
    constants: Record<string, number>;
}
export interface CalculateTotalsInput {
    system: SetupSystem;
    cameraCount: number;
    cableUnits?: number;
    analogSelections: AnalogSelections;
    ipSelections: IpSelections;
    hddId: string;
    monitorIncluded: boolean;
    monitorId?: string;
    monitorStand?: 'none' | 'static' | 'movable';
    wallMountIncluded?: boolean;
    spikeGuardIncluded?: boolean;
    rackId?: string | null;
    conduitPipeId?: string | null;
    conduitMeters?: number;
    installationIncluded: boolean;
    automationEnabled?: boolean;
    pricingCatalog: PricingCatalog;
    accessoryPricingOverrides?: Record<string, {
        mrp: number;
        sale: number;
    }> | null;
    activeOffer?: ActiveOffer | null;
}
export declare function resolveAccessoryPrice(id: string, defaultMrp: number, defaultSale: number, overrides?: Record<string, {
    mrp: number;
    sale: number;
}> | null): {
    mrp: number;
    sale: number;
};
export declare function calculateTotals({ system, cameraCount, cableUnits, analogSelections, ipSelections, hddId, monitorIncluded, monitorId, monitorStand, wallMountIncluded, spikeGuardIncluded, rackId, conduitPipeId, conduitMeters, installationIncluded, automationEnabled, pricingCatalog, accessoryPricingOverrides, activeOffer, }: CalculateTotalsInput): Totals;
//# sourceMappingURL=custom-setup-pricing.d.ts.map