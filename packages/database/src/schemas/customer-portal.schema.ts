import { z } from 'zod';

export const CustomerAccountSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  email: z.string().email(),
  mobile: z.string(),
  password_hash: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'UNVERIFIED']).default('ACTIVE'),
  last_login_at: z.string().optional(),
});

export const CustomerDocumentSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  title: z.string(),
  folder: z.enum(['ORDERS', 'PROJECTS', 'WARRANTY', 'AMC', 'INVOICES', 'REPORTS']),
  file_url: z.string().url(),
  file_size_bytes: z.number().optional(),
  file_type: z.string(),
  uploaded_at: z.string().optional(),
});

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  type: z.enum(['INSTALLATION', 'DEMO', 'SITE_SURVEY', 'SERVICE_VISIT', 'CONSULTATION']),
  appointment_date: z.string(),
  time_slot: z.string(),
  assigned_engineer_id: z.string().uuid().optional(),
  status: z.enum(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).default('BOOKED'),
});

export const ProductRegistrationSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  serial_number: z.string(),
  product_id: z.string().uuid().optional(),
  registration_date: z.string(),
  warranty_activated: z.boolean().default(true),
  warranty_expiry_date: z.string(),
});

export type CustomerAccount = z.infer<typeof CustomerAccountSchema>;
export type CustomerDocument = z.infer<typeof CustomerDocumentSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type ProductRegistration = z.infer<typeof ProductRegistrationSchema>;
