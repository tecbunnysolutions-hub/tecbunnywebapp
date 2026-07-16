import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isSuperadminSession, isSuperadmin } from '@tecbunny/core/permissions';
import {  createSupabaseClient  } from '@tecbunny/database/server';

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
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: { branches: true, users: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(orgs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const org = await prisma.organization.create({ data: { name } });
    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    await prisma.organization.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
