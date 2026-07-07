import type { CustomSetupBlueprintSummary } from "@tecbunny/core/custom-setup-service";
import { type AnalogPricing, type IpPricing, type PriceEntry } from './custom-setup-pricing';
export declare function buildPricingCatalog(blueprint: CustomSetupBlueprintSummary | null): Promise<{
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
}>;
//# sourceMappingURL=custom-setup-pricing-server.d.ts.map