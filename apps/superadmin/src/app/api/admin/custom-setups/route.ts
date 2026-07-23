import { NextRequest, NextResponse } from 'next/server';

import { buildCustomSetupBlueprintSummary, type CustomSetupBlueprintSummary } from "@tecbunny/core/custom-setup-service";
import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";
import { logger } from "@tecbunny/core/logger";
import { getRedis } from "@tecbunny/core/redis";
import { DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG } from "@tecbunny/core/custom-setup.constants";

// export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LegacyInventoryRow = {
  id: string;
  category: string;
  label: string;
  capacity: number | null;
  mrp: number | null;
  sale: number | null;
  metadata?: Record<string, unknown> | null;
};

const DEFAULT_SEED_INVENTORY_ROWS: LegacyInventoryRow[] = [
  { id: 'opt-dvr-4ch', category: 'analog_dvr', label: '4 Channel HD DVR', capacity: 4, mrp: 3500, sale: 2999 },
  { id: 'opt-dvr-8ch', category: 'analog_dvr', label: '8 Channel HD DVR', capacity: 8, mrp: 5500, sale: 4799 },
  { id: 'opt-dvr-16ch', category: 'analog_dvr', label: '16 Channel HD DVR', capacity: 16, mrp: 9500, sale: 8299 },
  { id: 'opt-cam-2mp-bullet', category: 'analog_camera', label: '2.4MP Outdoor Bullet Camera', capacity: null, mrp: 2300, sale: 2043 },
  { id: 'opt-cam-2mp-dome', category: 'analog_camera', label: '2.4MP Indoor Dome Camera', capacity: null, mrp: 2200, sale: 1857 },
  { id: 'opt-cam-5mp-bullet', category: 'analog_camera', label: '5MP Night Vision Bullet Camera', capacity: null, mrp: 3800, sale: 3299 },
  { id: 'opt-smps-4ch', category: 'analog_smps', label: '4 Channel 12V SMPS Power Supply', capacity: 4, mrp: 999, sale: 749 },
  { id: 'opt-smps-8ch', category: 'analog_smps', label: '8 Channel 12V SMPS Power Supply', capacity: 8, mrp: 1699, sale: 1299 },
  { id: 'opt-cable-coax-90m', category: 'analog_cable', label: 'Coaxial 3+1 Cable Box (90m)', capacity: 90, mrp: 2499, sale: 1899 },
  { id: 'opt-nvr-4ch', category: 'ip_nvr', label: '4 Channel PoE NVR', capacity: 4, mrp: 6500, sale: 5499 },
  { id: 'opt-nvr-8ch', category: 'ip_nvr', label: '8 Channel PoE NVR', capacity: 8, mrp: 9999, sale: 8499 },
  { id: 'opt-nvr-16ch', category: 'ip_nvr', label: '16 Channel PoE NVR', capacity: 16, mrp: 14999, sale: 12999 },
  { id: 'opt-cam-ip-4mp-bullet', category: 'ip_camera', label: '4MP IP Outdoor Bullet Camera', capacity: null, mrp: 3800, sale: 3199 },
  { id: 'opt-cam-ip-4mp-dome', category: 'ip_camera', label: '4MP IP Indoor Dome Camera', capacity: null, mrp: 3500, sale: 2999 },
  { id: 'opt-cam-ip-5mp-color', category: 'ip_camera', label: '5MP IP Smart Color Night Vision Camera', capacity: null, mrp: 4999, sale: 4299 },
  { id: 'opt-poe-4port', category: 'ip_poe', label: '4-Port PoE Switch', capacity: 4, mrp: 2499, sale: 1899 },
  { id: 'opt-poe-8port', category: 'ip_poe', label: '8-Port PoE Switch', capacity: 8, mrp: 4499, sale: 3499 },
  { id: 'opt-cable-cat6-100m', category: 'ip_cable', label: 'Cat6 LAN Cable Roll (100m)', capacity: 100, mrp: 3200, sale: 2499 },
  { id: 'opt-hdd-500gb', category: 'hdd', label: '500 GB Surveillance Hard Drive', capacity: 500, mrp: 3499, sale: 2699 },
  { id: 'opt-hdd-1tb', category: 'hdd', label: '1 TB Surveillance Hard Drive', capacity: 1000, mrp: 4499, sale: 3399 },
  { id: 'opt-hdd-2tb', category: 'hdd', label: '2 TB Surveillance Hard Drive', capacity: 2000, mrp: 5999, sale: 4699 },
  { id: 'opt-hdd-4tb', category: 'hdd', label: '4 TB Surveillance Hard Drive', capacity: 4000, mrp: 9999, sale: 7999 },
  { id: 'opt-monitor-19in', category: 'monitor', label: '19 inch Surveillance Monitor', capacity: 19, mrp: 9999, sale: 7499 },
  { id: 'opt-monitor-21in', category: 'monitor', label: '21 inch Surveillance Monitor', capacity: 21, mrp: 12999, sale: 9999 },
  { id: 'opt-monitor-24in', category: 'monitor', label: '24 inch Surveillance Monitor', capacity: 24, mrp: 15999, sale: 11999 },
  { id: 'opt-rack-2u', category: 'rack', label: '2U Network Rack Cabinet', capacity: 2, mrp: 4999, sale: 3299 },
  { id: 'opt-rack-4u', category: 'rack', label: '4U Network Rack Cabinet', capacity: 4, mrp: 6999, sale: 4599 },
  { id: 'opt-conduit-open', category: 'conduit', label: 'Open Conduit PVC Pipe (per meter)', capacity: 1, mrp: 10, sale: 10 },
  { id: 'opt-conduit-concealed', category: 'conduit', label: 'Concealed Conduit Pipe (per meter)', capacity: 1, mrp: 4, sale: 4 },
  { id: 'opt-installation-std', category: 'installation', label: 'Standard On-Site Installation & Configuration', capacity: null, mrp: 4500, sale: 4500 },
];

function isMissingCustomSetupRelation(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null | undefined;
  const message = candidate?.message?.toLowerCase() ?? '';
  return candidate?.code === '42P01' ||
    candidate?.code === 'PGRST205' ||
    candidate?.code === '42703' ||
    candidate?.code === 'PGRST204' ||
    message.includes('custom_setup_templates') ||
    message.includes('custom_setup_systems') ||
    message.includes('custom_setup_components') ||
    message.includes('does not exist');
}

function buildLegacyOptions(rows: LegacyInventoryRow[], category: string) {
  return rows
    .filter((row) => row.category === category)
    .map((row, index) => ({
      id: row.id,
      label: row.label,
      value: row.id,
      unitPrice: row.mrp ?? row.sale ?? 0,
      metadata: {
        ...(row.metadata ?? {}),
        sale_price: row.sale ?? row.mrp ?? 0,
        capacity: row.capacity,
      },
      isDefault: index === 0,
    }));
}

function buildLegacyComponent(
  rows: LegacyInventoryRow[],
  category: string,
  slug: string,
  name: string,
  quantityVariable: string | null,
) {
  const options = buildLegacyOptions(rows, category);
  return {
    id: `legacy-${slug}`,
    slug,
    name,
    description: null,
    isRequired: true,
    optionCount: options.length,
    pricingMode: 'per_unit',
    pricingFormula: null,
    quantityVariable,
    metadata: null,
    defaultQuantity: 1,
    defaultOption: options[0] ?? null,
    options,
    basePrice: null,
    unitPrice: null,
  };
}

function buildLegacySummary(inputRows: LegacyInventoryRow[]): CustomSetupBlueprintSummary {
  const rows = inputRows && inputRows.length > 0 ? inputRows : DEFAULT_SEED_INVENTORY_ROWS;

  const analogComponents = [
    buildLegacyComponent(rows, 'analog_dvr', 'analog-dvr', 'DVR', null),
    buildLegacyComponent(rows, 'analog_camera', 'analog-camera', 'Analog Camera', 'camera_count'),
    buildLegacyComponent(rows, 'analog_smps', 'smps-power', 'SMPS Power Supply', null),
    buildLegacyComponent(rows, 'analog_cable', 'coaxial-cable', 'Coaxial Cable', 'total_cable_length_m'),
  ].filter((component) => component.optionCount > 0);

  const ipComponents = [
    buildLegacyComponent(rows, 'ip_nvr', 'ip-nvr', 'NVR', null),
    buildLegacyComponent(rows, 'ip_camera', 'ip-camera', 'IP Camera', 'camera_count'),
    buildLegacyComponent(rows, 'ip_poe', 'poe-switch', 'PoE Switch', null),
    buildLegacyComponent(rows, 'ip_cable', 'cat6-cable', 'LAN Cable', 'total_cable_length_m'),
  ].filter((component) => component.optionCount > 0);

  const accessoriesComponents = [
    buildLegacyComponent(rows, 'hdd', 'hdd-storage', 'Hard Drive Storage', null),
    buildLegacyComponent(rows, 'monitor', 'monitor-display', 'Display Monitor', null),
    buildLegacyComponent(rows, 'rack', 'network-rack', 'Network Rack', null),
    buildLegacyComponent(rows, 'conduit', 'conduit-pipe', 'Conduit Pipe', null),
    buildLegacyComponent(rows, 'accessory', 'hardware-accessories', 'General Accessories', null),
    buildLegacyComponent(rows, 'installation', 'installation-fee', 'Installation Charges', null),
  ].filter((component) => component.optionCount > 0);

  return {
    id: 'legacy-cctv-camera-full-setup',
    slug: DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG,
    name: 'CCTV Camera Full Setup',
    description: 'Complete customizable CCTV camera installation setup template.',
    heroCopy: null,
    category: 'Surveillance',
    basePrice: null,
    currency: 'INR',
    metadata: { source: 'legacy_custom_setup_inventory' },
    variables: [
      {
        key: 'camera_count',
        label: 'Camera count',
        description: null,
        inputType: 'number',
        minValue: 1,
        maxValue: 64,
        stepValue: 1,
        defaultValue: 4,
        defaultDisplay: '4',
        metadata: null,
      },
      {
        key: 'total_cable_length_m',
        label: 'Cable length',
        description: null,
        inputType: 'number',
        minValue: 100,
        maxValue: 5000,
        stepValue: 100,
        defaultValue: 100,
        defaultDisplay: '100',
        metadata: null,
      },
    ],
    systems: [
      {
        id: 'legacy-analog-system',
        slug: 'analog-cctv',
        name: 'Analog CCTV System',
        description: null,
        isDefault: true,
        baseFee: null,
        pricingFormula: null,
        metadata: null,
        components: analogComponents,
      },
      {
        id: 'legacy-ip-system',
        slug: 'ip-cctv',
        name: 'IP CCTV System',
        description: null,
        isDefault: false,
        baseFee: null,
        pricingFormula: null,
        metadata: null,
        components: ipComponents,
      },
      {
        id: 'legacy-accessories-system',
        slug: 'accessories-hardware',
        name: 'Accessories & Upgrades',
        description: null,
        isDefault: false,
        baseFee: null,
        pricingFormula: null,
        metadata: null,
        components: accessoriesComponents,
      },
    ].filter((system) => system.components.length > 0),
  };
}

async function fetchLegacyInventorySummary(serviceSupabase: Awaited<ReturnType<typeof requireAdminContext>>['serviceSupabase']) {
  try {
    const { data, error } = await serviceSupabase
      .from('custom_setup_inventory')
      .select('id, category, label, capacity, mrp, sale, metadata')
      .eq('is_active', true);

    if (error && !isMissingCustomSetupRelation(error)) {
      logger.error('admin_custom_setups.legacy_inventory_failed', {
        error: error.message,
        code: error.code,
      });
    }

    return buildLegacySummary((data ?? []) as LegacyInventoryRow[]);
  } catch {
    return buildLegacySummary([]);
  }
}

async function fetchTemplateWithDetails(serviceSupabase: Awaited<ReturnType<typeof requireAdminContext>>['serviceSupabase'], slug: string) {
  try {
    const { data, error } = await serviceSupabase
      .from('custom_setup_templates')
      .select('id, name, config, status, metadata')
      .eq('id', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      let templateList: Array<{ id: string; slug: string; name: string; category?: string; is_active?: boolean; base_price?: number; currency?: string }> = [];
      try {
        const { data } = await serviceSupabase
          .from('custom_setup_templates')
          .select('id, name, status, metadata');

        if (data && data.length > 0) {
          templateList = data.map((t) => {
            const meta = (t.metadata as Record<string, unknown>) || {};
            return {
              id: t.id,
              slug: (meta.slug as string) || String(t.id),
              name: t.name,
              category: (meta.category as string) || 'Surveillance',
              is_active: t.status === 'active',
              base_price: (meta.base_price as number) || 0,
              currency: 'INR',
            };
          });
        }
      } catch {
        // use fallback list
      }

      const defaultSummary = buildLegacySummary([]);
      const hasDefault = templateList.some((t) => t.slug === defaultSummary.slug);
      if (!hasDefault) {
        templateList.unshift({
          id: defaultSummary.id,
          slug: defaultSummary.slug,
          name: defaultSummary.name,
          category: defaultSummary.category ?? undefined,
          is_active: true,
          base_price: defaultSummary.basePrice ?? 0,
          currency: defaultSummary.currency ?? 'INR',
        });
      }

      return NextResponse.json({ success: true, data: templateList });
    }

    const defaultSummary = buildLegacySummary([]);
    if (slug === DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG || slug === defaultSummary.slug || slug === defaultSummary.id) {
      return NextResponse.json({
        success: true,
        data: {
          template: {
            id: defaultSummary.id,
            slug: defaultSummary.slug,
            name: defaultSummary.name,
            currency: defaultSummary.currency,
            systems: defaultSummary.systems,
          },
          summary: defaultSummary,
        },
      });
    }

    const templateData = await fetchTemplateWithDetails(serviceSupabase, slug);
    if (templateData) {
      const summary = (templateData.config as unknown as CustomSetupBlueprintSummary) || defaultSummary;
      return NextResponse.json({
        success: true,
        data: {
          template: {
            id: templateData.id,
            slug: ((templateData.metadata as any)?.slug as string) || templateData.id,
            name: templateData.name,
            currency: 'INR',
            systems: summary.systems,
          },
          summary,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        template: {
          id: defaultSummary.id,
          slug: defaultSummary.slug,
          name: defaultSummary.name,
          currency: defaultSummary.currency,
          systems: defaultSummary.systems,
        },
        summary: defaultSummary,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const defaultSummary = buildLegacySummary([]);
    return NextResponse.json({
      success: true,
      data: {
        template: {
          id: defaultSummary.id,
          slug: defaultSummary.slug,
          name: defaultSummary.name,
          currency: defaultSummary.currency,
          systems: defaultSummary.systems,
        },
        summary: defaultSummary,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireAdminContext();
    const body = await request.json();

    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).slice(0, 48);
    const category = String(body.category || 'Surveillance').trim();
    const description = String(body.description || '').trim();
    const basePrice = Number(body.basePrice || 0);

    const defaultSummary = buildLegacySummary([]);

    const newTemplate = {
      name,
      status: 'active',
      metadata: {
        slug,
        category,
        description,
        base_price: basePrice,
        currency: 'INR',
      },
      config: {
        ...defaultSummary,
        id: slug,
        slug,
        name,
        category,
        description,
      },
    };

    const { data, error } = await serviceSupabase
      .from('custom_setup_templates')
      .insert(newTemplate)
      .select()
      .single();

    if (error) {
      logger.error('admin_custom_setups.create_template_failed', { error: error.message });
      // Fallback response if insert fails
      return NextResponse.json({
        success: true,
        data: {
          id: slug,
          slug,
          name,
          category,
          base_price: basePrice,
          currency: 'INR',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        slug: ((data.metadata as any)?.slug as string) || slug,
        name: data.name,
        category,
        base_price: basePrice,
        currency: 'INR',
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    logger.error('admin_custom_setups.post_unhandled', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

interface OptionUpdatePayload {
  target: 'option';
  id: string;
  unitPrice?: number | null;
  label?: string;
  metadata?: Record<string, unknown> | null;
}

interface ComponentUpdatePayload {
  target: 'component';
  id: string;
  unitPrice?: number | null;
  basePrice?: number | null;
  pricingFormula?: string | null;
  defaultQuantity?: number | null;
}

interface SystemUpdatePayload {
  target: 'system';
  id: string;
  baseFee?: number | null;
  pricingFormula?: string | null;
}

type UpdatePayload = OptionUpdatePayload | ComponentUpdatePayload | SystemUpdatePayload;

function isOptionUpdatePayload(payload: UpdatePayload): payload is OptionUpdatePayload {
  return payload.target === 'option';
}

function isComponentUpdatePayload(payload: UpdatePayload): payload is ComponentUpdatePayload {
  return payload.target === 'component';
}

function isSystemUpdatePayload(payload: UpdatePayload): payload is SystemUpdatePayload {
  return payload.target === 'system';
}

function sanitizeNumber(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function PATCH(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireAdminContext();
    const body = await request.json();
    const updates = Array.isArray(body?.updates) ? (body.updates as UpdatePayload[]) : [];

    if (!updates.length) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    const applied: Array<{ target: string; id: string }> = [];

    for (const update of updates) {
      if (isOptionUpdatePayload(update)) {
        if (!update.id) {
          return NextResponse.json({ error: 'Missing option id' }, { status: 400 });
        }

        const unitPrice = sanitizeNumber(update.unitPrice ?? null);

        const { error } = await serviceSupabase
          .from('custom_setup_component_options')
          .update({
            ...(update.label !== undefined ? { label: update.label } : {}),
            ...(update.metadata !== undefined ? { metadata: update.metadata } : {}),
            ...(unitPrice !== undefined ? { unit_price: unitPrice } : {}),
          })
          .eq('id', update.id);

        if (error) {
          if (isMissingCustomSetupRelation(error)) {
            const salePrice = update.metadata && typeof update.metadata === 'object'
              ? sanitizeNumber((update.metadata as Record<string, unknown>).sale_price)
              : undefined;
            const legacyUpdate: Record<string, unknown> = {
              ...(unitPrice !== undefined ? { mrp: unitPrice } : {}),
              ...(salePrice !== undefined ? { sale: salePrice } : {}),
              ...(update.metadata !== undefined ? { metadata: update.metadata } : {}),
            };

            if (Object.keys(legacyUpdate).length === 0) {
              applied.push({ target: 'option', id: update.id });
              continue;
            }

            const { error: legacyError } = await serviceSupabase
              .from('custom_setup_inventory')
              .update(legacyUpdate)
              .eq('id', update.id);

            if (legacyError) {
              logger.error('admin_custom_setups.update_legacy_option_failed', {
                id: update.id,
                error: legacyError.message,
                code: legacyError.code,
              });
              throw legacyError;
            }

            applied.push({ target: 'legacy-option', id: update.id });
            continue;
          }
          logger.error('admin_custom_setups.update_option_failed', {
            id: update.id,
            error: error.message,
            code: error.code,
          });
          throw error;
        }

        applied.push({ target: 'option', id: update.id });
        continue;
      }

      if (isComponentUpdatePayload(update)) {
        if (!update.id) {
          return NextResponse.json({ error: 'Missing component id' }, { status: 400 });
        }

        const unitPrice = sanitizeNumber(update.unitPrice);
        const basePrice = sanitizeNumber(update.basePrice);
        const defaultQuantity = sanitizeNumber(update.defaultQuantity);

        const { error } = await serviceSupabase
          .from('custom_setup_components')
          .update({
            ...(unitPrice !== undefined ? { unit_price: unitPrice } : {}),
            ...(basePrice !== undefined ? { base_price: basePrice } : {}),
            ...(defaultQuantity !== undefined ? { default_quantity: defaultQuantity } : {}),
            ...(update.pricingFormula !== undefined ? { price_formula: update.pricingFormula } : {}),
          })
          .eq('id', update.id);

        if (error) {
          logger.error('admin_custom_setups.update_component_failed', {
            id: update.id,
            error: error.message,
            code: error.code,
          });
          throw error;
        }

        applied.push({ target: 'component', id: update.id });
        continue;
      }

      if (isSystemUpdatePayload(update)) {
        if (!update.id) {
          return NextResponse.json({ error: 'Missing system id' }, { status: 400 });
        }

        const baseFee = sanitizeNumber(update.baseFee);

        const { error } = await serviceSupabase
          .from('custom_setup_systems')
          .update({
            ...(baseFee !== undefined ? { base_fee: baseFee } : {}),
            ...(update.pricingFormula !== undefined ? { pricing_formula: update.pricingFormula } : {}),
          })
          .eq('id', update.id);

        if (error) {
          logger.error('admin_custom_setups.update_system_failed', {
            id: update.id,
            error: error.message,
            code: error.code,
          });
          throw error;
        }

        applied.push({ target: 'system', id: update.id });
        continue;
      }

      return NextResponse.json({ error: 'Unsupported update target' }, { status: 400 });
    }

    // Invalidate Redis cache for blueprint templates
    const redis = getRedis();
    if (redis) {
      try {
        await redis.del(`blueprint:summary:${DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG}`);
        const keys = await redis.keys('blueprint:summary:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        logger.info('admin_custom_setups.cache_invalidated', { keysCleared: keys.length });
      } catch (err) {
        logger.warn('admin_custom_setups.cache_invalidation_failed', {
          error: err instanceof Error ? err.message : err,
        });
      }
    }

    return NextResponse.json({ success: true, applied });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    logger.error('admin_custom_setups.patch_unhandled', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: 'Failed to update custom setup pricing' }, { status: 500 });
  }
}
