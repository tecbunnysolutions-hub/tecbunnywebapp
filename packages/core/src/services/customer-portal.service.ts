import { prisma } from '../db/prisma';
import type { Appointment, CustomerAccount, CustomerDocument, ProductRegistration } from '@tecbunny/database';

export class CustomerPortalService {
  /**
   * Customer 360 Dashboard Metrics (7.2)
   */
  static async getCustomerDashboard360(customerId: string) {
    const p = prisma as any;

    const [orders, projects, tickets, documents] = await Promise.all([
      p.sales_orders ? p.sales_orders.findMany({ where: { customer_id: customerId }, take: 5 }) : Promise.resolve([]),
      p.projects ? p.projects.findMany({ where: { customer_id: customerId }, take: 5 }) : Promise.resolve([]),
      p.service_tickets ? p.service_tickets.findMany({ where: { customer_id: customerId }, take: 5 }) : Promise.resolve([]),
      p.customer_documents ? p.customer_documents.findMany({ where: { customer_id: customerId }, take: 5 }) : Promise.resolve([]),
    ]);

    return {
      activeOrdersCount: orders.length,
      activeProjectsCount: projects.length,
      openTicketsCount: tickets.length,
      documentsCount: documents.length,
      recentOrders: orders,
      recentProjects: projects,
      recentTickets: tickets,
    };
  }

  /**
   * Product QR Registration & Instant Warranty Activation (7.12)
   */
  static async registerProductAndActivateWarranty(params: {
    customerId: string;
    serialNumber: string;
    productId?: string;
  }) {
    const p = prisma as any;
    const registrationDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1-year warranty default

    const registrationData = {
      id: `reg-${Date.now()}`,
      customer_id: params.customerId,
      serial_number: params.serialNumber,
      product_id: params.productId,
      registration_date: registrationDate.toISOString(),
      warranty_activated: true,
      warranty_expiry_date: expiryDate.toISOString(),
    };

    if (p.product_registrations) {
      await p.product_registrations.create({ data: registrationData });
    }

    if (p.serial_numbers) {
      await p.serial_numbers.update({
        where: { serial_number: params.serialNumber },
        data: {
          customer_id: params.customerId,
          status: 'WARRANTY',
          installation_date: registrationDate,
          warranty_expiry_date: expiryDate,
        },
      });
    }

    return registrationData;
  }

  /**
   * Slot-based Appointment Booking (7.13)
   */
  static async bookAppointment(params: {
    customerId: string;
    type: 'INSTALLATION' | 'DEMO' | 'SITE_SURVEY' | 'SERVICE_VISIT' | 'CONSULTATION';
    appointmentDate: string;
    timeSlot: string;
  }) {
    const p = prisma as any;

    const appointmentData = {
      id: `apt-${Date.now()}`,
      customer_id: params.customerId,
      type: params.type,
      appointment_date: params.appointmentDate,
      time_slot: params.timeSlot,
      status: 'BOOKED',
    };

    if (p.appointments) {
      return p.appointments.create({ data: appointmentData });
    }

    return appointmentData;
  }

  /**
   * AMC Contract 1-Click Renewal (7.8)
   */
  static async renewAMCContract(contractId: string, durationMonths: number = 12) {
    const p = prisma as any;
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

    if (p.amc_contracts) {
      return p.amc_contracts.update({
        where: { id: contractId },
        data: {
          status: 'ACTIVE',
          end_date: newEndDate.toISOString(),
        },
      });
    }

    return {
      contractId,
      status: 'ACTIVE',
      extendedUntil: newEndDate.toISOString(),
    };
  }
}
