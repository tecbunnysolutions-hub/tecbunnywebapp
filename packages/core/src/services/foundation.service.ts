import { prisma } from '../db/prisma';
import type { FoundationActivityLog, FoundationGlobalSettings, FoundationNotification, FoundationUser } from '@tecbunny/database';

export class FoundationService {
  /**
   * Audit Logging Engine (1.12)
   */
  static async logActivity(params: {
    userId: string;
    module: string;
    action: string;
    oldData?: Record<string, any>;
    newData?: Record<string, any>;
    ipAddress: string;
    browser: string;
  }) {
    return (prisma as any).activity_logs.create({
      data: {
        user_id: params.userId,
        module: params.module,
        action: params.action,
        old_data: params.oldData ? JSON.stringify(params.oldData) : null,
        new_data: params.newData ? JSON.stringify(params.newData) : null,
        ip_address: params.ipAddress,
        browser: params.browser,
      },
    });
  }

  /**
   * Multi-Channel Notification Engine (1.10)
   */
  static async sendNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'IN_APP' | 'PUSH';
  }) {
    return (prisma as any).notifications.create({
      data: {
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        status: 'UNREAD',
      },
    });
  }

  /**
   * Dynamic Sidebar & Dashboard Menu Builder (1.7)
   */
  static generateDynamicSidebar(userPermissions: string[]) {
    const fullMenu = [
      { key: 'dashboard', label: 'Dashboard', href: '/mgmt/dashboard', requiredPermission: 'dashboard.view' },
      { key: 'crm_leads', label: 'Leads', href: '/mgmt/crm/leads', requiredPermission: 'leads.view' },
      { key: 'crm_pipeline', label: 'Sales Pipeline', href: '/mgmt/crm/pipeline', requiredPermission: 'pipeline.view' },
      { key: 'crm_customers', label: 'Customers', href: '/mgmt/crm/customers', requiredPermission: 'customers.view' },
      { key: 'crm_quotations', label: 'Quotations', href: '/mgmt/crm/quotations', requiredPermission: 'quotations.view' },
      { key: 'inventory', label: 'Inventory', href: '/mgmt/inventory', requiredPermission: 'inventory.view' },
      { key: 'fsm_tickets', label: 'Service Tickets', href: '/mgmt/fsm/tickets', requiredPermission: 'tickets.view' },
      { key: 'analytics', label: 'BI Analytics', href: '/mgmt/analytics', requiredPermission: 'analytics.view' },
      { key: 'settings', label: 'Global Settings', href: '/mgmt/settings', requiredPermission: 'settings.view' },
    ];

    if (userPermissions.includes('*') || userPermissions.includes('all')) {
      return fullMenu;
    }

    return fullMenu.filter(item => userPermissions.includes(item.requiredPermission));
  }

  /**
   * Global Search Engine across entities (1.11)
   */
  static async globalSearch(query: string) {
    const q = `%${query.trim()}%`;
    const p = prisma as any;

    const [customers, leads, products, tickets] = await Promise.all([
      p.customers ? p.customers.findMany({
        where: { OR: [{ company_name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }) : Promise.resolve([]),
      p.lead ? p.lead.findMany({
        where: { OR: [{ company_name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }) : Promise.resolve([]),
      p.product ? p.product.findMany({
        where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }) : Promise.resolve([]),
      p.ticket ? p.ticket.findMany({
        where: { ticket_number: { contains: q, mode: 'insensitive' } },
        take: 5,
      }) : Promise.resolve([]),
    ]);

    return { customers, leads, products, tickets };
  }
}
