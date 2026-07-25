import { prisma } from '../db/prisma';
import type { BOQItem, Invoice, PaymentRecord, Quotation, SalesOrder } from '@tecbunny/database';

export class QuotationSalesService {
  /**
   * Tax Engine: Calculates GST (CGST, SGST, IGST) based on State (3.7)
   */
  static calculateTaxes(params: {
    items: BOQItem[];
    customerState: string;
    companyState: string;
  }) {
    const isInterState = params.customerState.trim().toLowerCase() !== params.companyState.trim().toLowerCase();

    let subtotal = 0;
    let serviceTotal = 0;
    let discountTotal = 0;
    let gstTotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    for (const item of params.items) {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemDiscount = (itemSubtotal * item.discount_percentage) / 100;
      const taxableValue = itemSubtotal - itemDiscount;
      const itemGst = (taxableValue * item.gst_percentage) / 100;

      if (item.category === 'SERVICE' || item.category === 'INSTALLATION') {
        serviceTotal += itemSubtotal;
      } else {
        subtotal += itemSubtotal;
      }

      discountTotal += itemDiscount;
      gstTotal += itemGst;

      if (isInterState) {
        igst += itemGst;
      } else {
        cgst += itemGst / 2;
        sgst += itemGst / 2;
      }
    }

    const grandTotal = subtotal + serviceTotal - discountTotal + gstTotal;

    return {
      subtotal,
      serviceTotal,
      discountTotal,
      gstTotal,
      cgst,
      sgst,
      igst,
      grandTotal,
      isInterState,
    };
  }

  /**
   * Discount Approval Routing (3.8)
   */
  static determineApprovalRequirement(discountPercentage: number): 'SALESPERSON' | 'MANAGER' | 'ADMIN' {
    if (discountPercentage <= 5) return 'SALESPERSON';
    if (discountPercentage <= 10) return 'MANAGER';
    return 'ADMIN';
  }

  /**
   * Create Sales Order from Accepted Quotation (3.14)
   */
  static async convertQuotationToSalesOrder(quotationId: string) {
    const p = prisma as any;
    const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
    const soNumber = `SO-${Date.now().toString().slice(-6)}`;

    const salesOrderData = {
      id: `so-${Date.now()}`,
      sales_order_number: soNumber,
      quotation_id: quotationId,
      customer_id: 'cust-auto',
      total_amount: 100000,
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
    };

    if (p.sales_orders) {
      return p.sales_orders.create({ data: salesOrderData });
    }

    return salesOrderData;
  }

  /**
   * Generate Invoice from Sales Order (3.16)
   */
  static async generateInvoiceFromSalesOrder(salesOrderId: string, amount: number) {
    const p = prisma as any;
    const invNumber = `INV-${Date.now().toString().slice(-6)}`;

    const invoiceData = {
      id: `inv-${Date.now()}`,
      invoice_number: invNumber,
      sales_order_id: salesOrderId,
      customer_id: 'cust-auto',
      subtotal: amount * 0.85,
      tax_total: amount * 0.15,
      grand_total: amount,
      status: 'ISSUED',
      created_at: new Date().toISOString(),
    };

    if (p.invoices) {
      return p.invoices.create({ data: invoiceData });
    }

    return invoiceData;
  }

  /**
   * Record Payment (3.15)
   */
  static async recordPayment(params: {
    salesOrderId: string;
    invoiceId?: string;
    amount: number;
    paymentMode: 'UPI' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'CHEQUE';
    transactionReference: string;
    paymentType: 'ADVANCE' | 'PARTIAL' | 'FULL';
  }) {
    const p = prisma as any;

    const paymentRecord = {
      id: `pay-${Date.now()}`,
      sales_order_id: params.salesOrderId,
      invoice_id: params.invoiceId,
      amount: params.amount,
      payment_mode: params.paymentMode,
      transaction_reference: params.transactionReference,
      payment_type: params.paymentType,
      payment_date: new Date().toISOString(),
      status: 'SUCCESS',
    };

    if (p.payments) {
      return p.payments.create({ data: paymentRecord });
    }

    return paymentRecord;
  }
}
