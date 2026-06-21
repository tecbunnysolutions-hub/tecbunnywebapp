import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string()
    .min(1, { message: "We just need this quick detail before we move on." })
    .email({ message: "Hmm, that email doesn't look quite right. Check for typos!" }),
  
  serviceId: z.string()
    .min(1, { message: "What do you need help with? Please select an option above." }),

  date: z.string()
    .min(1, { message: "Let's pick a date so we can be there for you!" })
    .refine((val) => new Date(val) > new Date(), {
    message: "Let's pick a time in the future so we can be there for you!",
  }),

  address: z.string()
    .min(5, { message: "Could you add a bit more detail so we know exactly where to go?" }),

  cardNumber: z.string()
    .min(16, { message: "Something’s off with the card details. Can we try again?" })
    .regex(/^\d+$/, { message: "Just numbers here, please! No dashes needed." }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
