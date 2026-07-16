import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isSuperadminSession, isSuperadmin } from '@tecbunny/core/permissions';
import { createSupabaseClient } from '@tecbunny/database';

const prisma = new PrismaClient();

async function checkAuth() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!await isSuperadminSession() && !await isSuperadmin(user)) {
      return false;
    }
    return true;
  } catch (e) {
    console.error('Auth verification error:', e);
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const branches = await prisma.branch.findMany({
      include: {
        organization: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(branches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const { name, organization_id, location } = await req.json();
    if (!name || !organization_id) {
      return NextResponse.json({ error: 'Name and Organization ID are required' }, { status: 400 });
    }
    const branch = await prisma.branch.create({
      data: { name, organization_id, location }
    });
    return NextResponse.json(branch);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
