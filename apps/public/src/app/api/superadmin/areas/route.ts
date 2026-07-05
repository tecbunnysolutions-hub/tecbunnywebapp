import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { verifySuperadminSessionToken } from '@/lib/auth/superadmin-session';
import { logger } from '@/lib/logger';
import { createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';

const areaSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_\-\s]+$/),
  name: z.string().trim().min(2).max(100),
  isActive: z.boolean().default(true),
  servicesEnabled: z.boolean().default(false),
  pincodes: z.array(z.string().regex(/^[1-9][0-9]{5}$/)).max(500).default([]),
  salesManagerId: z.string().uuid().nullable().optional(),
  serviceManagerId: z.string().uuid().nullable().optional(),
  salesTeamIds: z.array(z.string().uuid()).max(500).default([]),
  serviceEngineerIds: z.array(z.string().uuid()).max(500).default([]),
}).strict();

async function requireSuperadmin() {
  const cookieStore = await cookies();
  return Boolean(await verifySuperadminSessionToken(cookieStore.get('superadmin-session')?.value));
}

function db() {
  if (!isSupabaseServiceConfigured) throw new Error('Supabase service role is not configured');
  return createServiceClient();
}

type PostalOffice = {
  Name?: string;
  Block?: string;
  Taluk?: string;
  District?: string;
  State?: string;
  Division?: string;
  Region?: string;
  Circle?: string;
  BranchType?: string;
  DeliveryStatus?: string;
  Pincode?: string;
  [key: string]: unknown;
};

async function lookupPincode(pincode: string) {
  const response = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`, {
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Postal lookup failed for ${pincode}`);
  const payload = await response.json() as Array<{ Status?: string; PostOffice?: PostalOffice[] | null }>;
  const offices = payload?.[0]?.Status === 'Success' ? payload[0].PostOffice || [] : [];
  if (!offices.length) throw new Error(`India Postal API returned no locations for ${pincode}`);
  return offices.map((office) => ({
    pincode,
    office_name: office.Name || 'Unknown Post Office',
    block_taluka: office.Block || office.Taluk || null,
    district: office.District || null,
    state: office.State || null,
    division: office.Division || null,
    region: office.Region || null,
    circle: office.Circle || null,
    branch_type: office.BranchType || null,
    delivery_status: office.DeliveryStatus || null,
    raw_data: office,
  }));
}

async function lookupPostalLocations(pincodes: string[]) {
  const locations: Array<Record<string, unknown>> = [];
  for (let index = 0; index < pincodes.length; index += 10) {
    const batch = pincodes.slice(index, index + 10);
    const results = await Promise.all(batch.map(lookupPincode));
    results.forEach((items) => locations.push(...items));
  }
  return locations;
}

export async function GET() {
  if (!(await requireSuperadmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = db();
    const [{ data: areas, error: areasError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabase.from('areas').select('*').order('name'),
      supabase.from('profiles')
        .select('id, name, full_name, email, mobile, role, is_active')
        .in('role', ['sales_manager', 'sales_executive', 'store_executive', 'sales_agent', 'service_manager', 'service_engineer'])
        .eq('is_active', true)
        .order('name'),
    ]);
    if (areasError) throw areasError;
    if (profilesError) throw profilesError;

    const areaIds = (areas || []).map((area) => area.id);
    const [
      { data: pincodes, error: pincodeError },
      { data: assignments, error: assignmentError },
      { data: postalLocations, error: postalError },
    ] = areaIds.length
      ? await Promise.all([
          supabase.from('area_pincodes').select('pincode, area_id').in('area_id', areaIds).order('pincode'),
          supabase.from('user_area_assignments').select('user_id, area_id').in('area_id', areaIds),
          supabase.from('area_postal_locations')
            .select('area_id, pincode, office_name, block_taluka, district, state, division, region, circle, branch_type, delivery_status')
            .in('area_id', areaIds)
            .order('pincode'),
        ])
      : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
    if (pincodeError) throw pincodeError;
    if (assignmentError) throw assignmentError;
    if (postalError) throw postalError;

    const staffById = new Map((profiles || []).map((profile) => [profile.id, profile]));
    const result = (areas || []).map((area) => {
      const assignedIds = (assignments || []).filter((item) => item.area_id === area.id).map((item) => item.user_id);
      return {
        ...area,
        pincodes: (pincodes || []).filter((item) => item.area_id === area.id).map((item) => item.pincode),
        postalLocations: (postalLocations || []).filter((item) => item.area_id === area.id),
        salesTeamIds: assignedIds.filter((id) => ['sales_executive', 'store_executive', 'sales_agent'].includes(staffById.get(id)?.role || '')),
        serviceEngineerIds: assignedIds.filter((id) => staffById.get(id)?.role === 'service_engineer'),
      };
    });
    return NextResponse.json({ areas: result, staff: profiles || [] });
  } catch (error) {
    logger.error('superadmin_areas_fetch_failed', { error });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load areas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireSuperadmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = areaSchema.safeParse(await request.json());
    if (!parsed.success) {
      const issuesMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json({ error: `Invalid area configuration: ${issuesMsg}` }, { status: 400 });
    }
    const value = parsed.data;
    const uniquePincodes = Array.from(new Set(value.pincodes));
    const postalLocations = await lookupPostalLocations(uniquePincodes);
    const { data, error } = await db().rpc('superadmin_save_area_team', {
      p_area_id: value.id || null,
      p_code: value.code,
      p_name: value.name,
      p_is_active: value.isActive,
      p_services_enabled: value.servicesEnabled,
      p_pincodes: uniquePincodes,
      p_sales_manager_id: value.salesManagerId || null,
      p_service_manager_id: value.serviceManagerId || null,
      p_sales_team_ids: Array.from(new Set(value.salesTeamIds)),
      p_service_engineer_ids: Array.from(new Set(value.serviceEngineerIds)),
      p_postal_locations: postalLocations,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, areaId: data });
  } catch (error) {
    logger.error('superadmin_area_save_unhandled', { error });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save area' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireSuperadmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Valid area ID is required' }, { status: 400 });
  }
  const { error } = await db().from('areas').delete().eq('id', id);
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true });
}
