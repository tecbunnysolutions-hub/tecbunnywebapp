import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@tecbunny/core/logger';
import { isSuperadmin, isSuperadminSession } from '@tecbunny/core/permissions';
import { createServiceClient } from '@tecbunny/database/admin';
import { createSupabaseClient } from '@tecbunny/database/server';

async function checkAuth() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return Boolean(await isSuperadminSession() || await isSuperadmin(user));
  } catch (error) {
    logger.warn('superadmin_areas.auth_failed', { error });
    return false;
  }
}

function normalizePincodes(value: unknown) {
  return Array.isArray(value)
    ? Array.from(new Set(value.map((item) => String(item).trim()).filter((item) => /^[1-9][0-9]{5}$/.test(item))))
    : [];
}

function normalizeIds(value: unknown) {
  return Array.isArray(value)
    ? Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)))
    : [];
}

async function syncAssignments(supabase: any, areaId: string, userIds: string[], assignmentType: string) {
  await supabase.from('user_area_assignments').delete().eq('area_id', areaId).eq('assignment_type', assignmentType);
  if (userIds.length === 0) return;
  const rows = userIds.map((userId, index) => ({
    area_id: areaId,
    user_id: userId,
    assignment_type: assignmentType,
    is_primary: index === 0,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('user_area_assignments').insert(rows);
  if (error) throw error;
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const supabase = createServiceClient();
    const [{ data: areas, error: areaError }, { data: pincodes, error: pincodeError }, { data: assignments, error: assignmentError }, { data: staff, error: staffError }] = await Promise.all([
      supabase.from('areas').select('*').order('name', { ascending: true }),
      supabase.from('area_pincodes').select('*').is('deleted_at', null),
      supabase.from('user_area_assignments').select('area_id,user_id,assignment_type,is_primary').is('deleted_at', null),
      supabase.from('profiles').select('id,name,full_name,email,mobile,role').in('role', ['sales_manager', 'service_manager', 'sales_executive', 'store_executive', 'sales_agent', 'service_engineer']),
    ]);

    if (areaError) throw areaError;
    if (pincodeError) throw pincodeError;
    if (assignmentError) throw assignmentError;
    if (staffError) throw staffError;

    const pincodeMap = new Map<string, any[]>();
    for (const row of pincodes ?? []) {
      if (!row.area_id) continue;
      pincodeMap.set(row.area_id, [...(pincodeMap.get(row.area_id) ?? []), row]);
    }

    const assignmentMap = new Map<string, any[]>();
    for (const row of assignments ?? []) {
      if (!row.area_id) continue;
      assignmentMap.set(row.area_id, [...(assignmentMap.get(row.area_id) ?? []), row]);
    }

    const responseAreas = (areas ?? []).map((area: any) => {
      const areaPincodes = pincodeMap.get(area.id) ?? [];
      const areaAssignments = assignmentMap.get(area.id) ?? [];
      return {
        ...area,
        is_active: area.is_active !== false,
        services_enabled: area.services_enabled === true,
        pincodes: areaPincodes.map((item) => item.pincode).filter(Boolean),
        postalLocations: areaPincodes.map((item) => ({
          pincode: item.pincode,
          office_name: item.metadata?.office_name || item.city || item.pincode,
          district: item.metadata?.district || item.city || null,
          state: item.metadata?.state || item.state || null,
          block_taluka: item.metadata?.block_taluka || null,
          division: item.metadata?.division || null,
          region: item.metadata?.region || null,
          circle: item.metadata?.circle || null,
          branch_type: item.metadata?.branch_type || null,
          delivery_status: item.metadata?.delivery_status || null,
        })),
        salesTeamIds: areaAssignments.filter((item) => item.assignment_type === 'sales_team').map((item) => item.user_id),
        serviceEngineerIds: areaAssignments.filter((item) => item.assignment_type === 'service_engineer').map((item) => item.user_id),
      };
    });

    return NextResponse.json({ areas: responseAreas, staff: staff ?? [] });
  } catch (error) {
    logger.error('superadmin_areas.list_failed', { error });
    return NextResponse.json({ error: 'Failed to load area configuration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const pincodes = normalizePincodes(body.pincodes);

    if (!code || !name || pincodes.length === 0) {
      return NextResponse.json({ error: 'Area code, name, and at least one valid pincode are required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const areaPayload = {
      code,
      name,
      is_active: body.isActive !== false,
      services_enabled: body.servicesEnabled === true,
      sales_manager_id: body.salesManagerId || null,
      service_manager_id: body.serviceManagerId || null,
      updated_at: new Date().toISOString(),
    };

    const areaWrite = body.id
      ? await supabase.from('areas').update(areaPayload).eq('id', body.id).select('*').single()
      : await supabase.from('areas').insert({ ...areaPayload, created_at: new Date().toISOString() }).select('*').single();

    if (areaWrite.error) throw areaWrite.error;
    const area = areaWrite.data;

    await supabase.from('area_pincodes').update({ area_id: null, updated_at: new Date().toISOString() }).eq('area_id', area.id);
    const pincodeRows = pincodes.map((pincode) => ({
      area_id: area.id,
      pincode,
      is_active: true,
      is_serviceable: true,
      metadata: {},
      updated_at: new Date().toISOString(),
    }));
    const { error: pincodeError } = await supabase.from('area_pincodes').upsert(pincodeRows, { onConflict: 'pincode' });
    if (pincodeError) throw pincodeError;

    await syncAssignments(supabase, area.id, normalizeIds(body.salesTeamIds), 'sales_team');
    await syncAssignments(supabase, area.id, normalizeIds(body.serviceEngineerIds), 'service_engineer');

    return NextResponse.json({ area });
  } catch (error) {
    logger.error('superadmin_areas.save_failed', { error });
    return NextResponse.json({ error: 'Failed to save area' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Area id is required' }, { status: 400 });

    const supabase = createServiceClient();
    await supabase.from('area_pincodes').update({ area_id: null, updated_at: new Date().toISOString() }).eq('area_id', id);
    await supabase.from('user_area_assignments').delete().eq('area_id', id);
    const { error } = await supabase.from('areas').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('superadmin_areas.delete_failed', { error });
    return NextResponse.json({ error: 'Failed to delete area' }, { status: 500 });
  }
}