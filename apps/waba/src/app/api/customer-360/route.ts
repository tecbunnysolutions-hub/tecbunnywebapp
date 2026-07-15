import { NextResponse } from 'next/server';
import { PrismaClient } from '@tecbunny/types';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

const prisma = new PrismaClient();

// GET /api/customer-360?phone=1234567890
export async function GET(req: Request) {
  try {
    const { session, error } = await requireApiRole();
    if (error) return error;

    const url = new URL(req.url);
    const phone = url.searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Missing phone parameter' }, { status: 400 });
    }

    // Lazy load CRM Leads
    const leads = await prisma.lead.findMany({
      where: { sender_number: phone },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // Lazy load Support Tickets
    const tickets = await prisma.ticket.findMany({
      where: { sender_number: phone },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // Future integration endpoints for Orders, Invoices, and AMC
    const orders: any[] = [];
    const invoices: any[] = [];
    const amc: any = null;

    return NextResponse.json({
      status: 'success',
      data: {
        leads,
        tickets,
        orders,
        invoices,
        amc
      }
    });

  } catch (err: unknown) {
    console.error('[API] Customer 360 fetch failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
