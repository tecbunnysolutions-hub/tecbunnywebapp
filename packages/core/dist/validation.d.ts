import { z } from "zod";
export declare const checkoutSchema: z.ZodObject<{
    email: z.ZodString;
    serviceId: z.ZodString;
    date: z.ZodString;
    address: z.ZodString;
    cardNumber: z.ZodString;
}, z.core.$strip>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
//# sourceMappingURL=validation.d.ts.map