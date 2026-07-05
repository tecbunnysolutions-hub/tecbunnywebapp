import { NextRequest, NextResponse } from 'next/server';

import { buildCustomSetupBlueprintSummary, type CustomSetupBlueprintSummary } from '@/lib/custom-setup-service';
import { AdminAuthError, requireAdminContext } from '@/lib/auth/admin-guard';
import { logger } from '@/lib/logger';
import { getRedis } from '@/lib/redis';
import { DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG } from '@/lib/custom-setup.constants';

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

function isMissingCustomSetupRelation(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null | undefined;
  const message = candidate?.message?.toLowerCase() ?? '';
  return candidate?.code === '42P01' ||
    candidate?.code === 'PGRST205' ||
    message.includes('custom_setup_templates') ||
    message.includes('custom_setup_systems') ||
    message.includes('custom_setup_components');
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

function buildLegacySummary(rows: LegacyInventoryRow[]): CustomSetupBlueprintSummary {
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
    description: 'Compatibility template generated from legacy setup inventory.',
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
        name: 'Analog CCTV',
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
        name: 'IP CCTV',
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
  const { data, error } = await serviceSupabase
    .from('custom_setup_inventory')
    .select('id, category, label, capacity, mrp, sale, metadata')
    .eq('is_active', true);

  if (error) {
    logger.error('admin_custom_setups.legacy_inventory_failed', {
      error: error.message,
      code: error.code,
    });
    throw error;
  }

  return buildLegacySummary((data ?? []) as LegacyInventoryRow[]);
}

async function fetchTemplateWithDetails(serviceSupabase: Awaited<ReturnType<typeof requireAdminContext>>['serviceSupabase'], slug: string) {
  const { data, error } = await serviceSupabase
    .from('custom_setup_templates')
    .select(`
      id,
      slug,
      name,
      description,
      category,
      hero_copy,
      base_price,
      currency,
      metadata,
      systems:custom_setup_systems(
        id,
        slug,
        name,
        description,
        sort_order,
        base_fee,
        pricing_formula,
        metadata,
        is_default,
        components:custom_setup_components(
          id,
          slug,
          name,
          description,
          category,
          is_required,
          min_quantity,
          max_quantity,
          default_quantity,
          quantity_variable,
          pricing_mode,
          base_price,
          unit_price,
          price_formula,
          metadata,
          sort_order,
          options:custom_setup_component_options(
            id,
            label,
            value,
            description,
            is_default,
            unit_price,
            metadata
          )
        )
      ),
      variables:custom_setup_variables(
        id,
        key,
        label,
        input_type,
        description,
        min_value,
        max_value,
        step_value,
        default_value,
        metadata
      )
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    logger.error('admin_custom_setups.fetch_template_failed', {
      slug,
      error: error.message,
      code: error.code,
    });
    throw error;
  }

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      const { data, error } = await serviceSupabase
        .from('custom_setup_templates')
        .select('id, slug, name, category, is_active, base_price, currency')
        .order('name', { ascending: true });

      if (error) {
        logger.error('admin_custom_setups.list_templates_failed', {
          error: error.message,
          code: error.code,
        });
        if (isMissingCustomSetupRelation(error)) {
          const summary = await fetchLegacyInventorySummary(serviceSupabase);
          return NextResponse.json({
            success: true,
            data: [{
              id: summary.id,
              slug: summary.slug,
              name: summary.name,
              category: summary.category,
              is_active: true,
              base_price: summary.basePrice,
              currency: summary.currency,
            }],
          });
        }
        throw error;
      }

      return NextResponse.json({ success: true, data });
    }

    let template;
    try {
      template = await fetchTemplateWithDetails(serviceSupabase, slug);
    } catch (error) {
      if (isMissingCustomSetupRelation(error)) {
        const summary = await fetchLegacyInventorySummary(serviceSupabase);
        if (slug !== summary.slug) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          data: {
            template: {
              id: summary.id,
              slug: summary.slug,
              name: summary.name,
              currency: summary.currency,
              systems: summary.systems,
            },
            summary,
          },
        });
      }
      throw error;
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const summary = buildCustomSetupBlueprintSummary(template) ?? null;

    return NextResponse.json({ success: true, data: { template, summary } });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    logger.error('admin_custom_setups.get_unhandled', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: 'Failed to load custom setup data' }, { status: 500 });
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
