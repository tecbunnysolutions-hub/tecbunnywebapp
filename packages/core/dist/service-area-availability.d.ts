export type ServiceAreaAvailability = {
    available: boolean;
    pincode: string | null;
    areaId: string | null;
    areaName: string | null;
    reason: string;
};
export declare function checkServiceAreaAvailability(value: unknown): Promise<ServiceAreaAvailability>;
//# sourceMappingURL=service-area-availability.d.ts.map