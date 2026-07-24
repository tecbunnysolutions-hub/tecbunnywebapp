import type { SupabaseClient } from '@supabase/supabase-js';

import { logger } from './logger';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';
import { createClient } from '@tecbunny/database';
import { getRedis } from './redis';
import { getCustomSetupInventoryFromDb } from './config-db';

export type JsonRecord = Record<string, unknown>;

// Removed constant to avoid client imports pulling server-only module

export interface CustomSetupComponentOptionRow {
  id: string;
  label: string;
  value: string | null;
  description: string | null;
  is_default: boolean | null;
  unit_price: number | null;
  metadata: JsonRecord | null;
}

export interface CustomSetupComponentRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  is_required: boolean | null;
  min_quantity: number | null;
  max_quantity: number | null;
  default_quantity: number | null;
  quantity_variable: string | null;
  pricing_mode: string;
  base_price: number | null;
  unit_price: number | null;
  price_formula: string | null;
  metadata: JsonRecord | null;
  sort_order: number | null;
  options?: CustomSetupComponentOptionRow[] | null;
}

export interface CustomSetupSystemRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  base_fee: number | null;
  pricing_formula: string | null;
  metadata: JsonRecord | null;
  is_default: boolean | null;
  components?: CustomSetupComponentRow[] | null;
}

export interface CustomSetupVariableRow {
  id: string;
  key: string;
  label: string;
  input_type: string;
  description: string | null;
  min_value: number | null;
  max_value: number | null;
  step_value: number | null;
  default_value: unknown;
  metadata: JsonRecord | null;
}

export interface CustomSetupTemplateRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  hero_copy: string | null;
  base_price: number | null;
  currency: string | null;
  metadata: JsonRecord | null;
  systems?: CustomSetupSystemRow[] | null;
  variables?: CustomSetupVariableRow[] | null;
}

export interface CustomSetupBlueprintOptionSummary {
  id: string;
  label: string;
  value: string | null;
  unitPrice: number | null;
  metadata: JsonRecord | null;
  isDefault: boolean;
}

export interface CustomSetupBlueprintComponentSummary {
  slug: string;
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  optionCount: number;
  pricingMode: string;
  pricingFormula: string | null;
  quantityVariable: string | null;
  metadata: JsonRecord | null;
  defaultQuantity: number | null;
  defaultOption: CustomSetupBlueprintOptionSummary | null;
  options: CustomSetupBlueprintOptionSummary[];
  basePrice: number | null;
  unitPrice: number | null;
}

export interface CustomSetupBlueprintSystemSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  baseFee: number | null;
  pricingFormula: string | null;
  metadata: JsonRecord | null;
  components: CustomSetupBlueprintComponentSummary[];
}

export interface CustomSetupBlueprintVariableSummary {
  key: string;
  label: string;
  description: string | null;
  inputType: string;
  minValue: number | null;
  maxValue: number | null;
  stepValue: number | null;
  defaultValue: unknown;
  defaultDisplay: string | null;
  metadata: JsonRecord | null;
}

export interface CustomSetupBlueprintSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  heroCopy: string | null;
  category: string | null;
  basePrice: number | null;
  currency: string | null;
  metadata: JsonRecord | null;
  variables: CustomSetupBlueprintVariableSummary[];
  systems: CustomSetupBlueprintSystemSummary[];
}

async function getSupabaseServerClient(): Promise<SupabaseClient> {
  if (isSupabaseServiceConfigured) {
    return createServiceClient();
  }

  return createClient();
}

export async function fetchCustomSetupTemplateBySlug(slug: string): Promise<CustomSetupTemplateRow | null> {
  if (!slug) {
    return null;
  }

  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
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
      .eq('is_active', true)
      .order('sort_order', { ascending: true, foreignTable: 'custom_setup_systems' })
      .order('sort_order', { ascending: true, foreignTable: 'custom_setup_systems.custom_setup_components' })
      .order('label', { ascending: true, foreignTable: 'custom_setup_systems.custom_setup_components.custom_setup_component_options' })
      .maybeSingle();

    if (error) {
      throw error;
    }

    logger.info('custom_setup.template_fetched', {
      slug,
      success: !!data,
      systemCount: data?.systems?.length || 0,
      timestamp: new Date().toISOString()
    });

    return data as CustomSetupTemplateRow | null;
  } catch (error) {
    logger.error('custom_setup.fetch_template_failed', {
      slug,
      error: error instanceof Error ? { message: error.message } : error
    });
    return null;
  }
}

function formatDefaultValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (_error) {
    return null;
  }
}

function toOptionSummary(option: CustomSetupComponentOptionRow | null | undefined): CustomSetupBlueprintOptionSummary | null {
  if (!option) {
    return null;
  }

  return {
    id: option.id,
    label: option.label,
    value: option.value ?? null,
    unitPrice: option.unit_price ?? null,
    metadata: option.metadata ?? null,
    isDefault: Boolean(option.is_default)
  } satisfies CustomSetupBlueprintOptionSummary;
}

function sortByOrder<T extends { sort_order?: number | null }>(items: T[] | null | undefined): T[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    const aOrder = a.sort_order ?? 9999;
    const bOrder = b.sort_order ?? 9999;
    return aOrder - bOrder;
  });
}

function sortSystems(systems: CustomSetupSystemRow[] | null | undefined): CustomSetupSystemRow[] {
  if (!Array.isArray(systems)) {
    return [];
  }

  return [...systems].sort((a, b) => {
    const aOrder = a.sort_order ?? 9999;
    const bOrder = b.sort_order ?? 9999;
    return aOrder - bOrder;
  });
}

export function buildCustomSetupBlueprintSummary(template: CustomSetupTemplateRow | null): CustomSetupBlueprintSummary | null {
  if (!template) {
    return null;
  }

  const variables: CustomSetupBlueprintVariableSummary[] = Array.isArray(template.variables)
    ? template.variables.map((variable) => ({
        key: variable.key,
        label: variable.label,
        description: variable.description ?? null,
        inputType: variable.input_type,
        minValue: variable.min_value ?? null,
        maxValue: variable.max_value ?? null,
        stepValue: variable.step_value ?? null,
        defaultValue: variable.default_value ?? null,
        defaultDisplay: formatDefaultValue(variable.default_value ?? null),
        metadata: variable.metadata ?? null
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  const systems: CustomSetupBlueprintSystemSummary[] = sortSystems(template.systems).map((system) => {
    const components = sortByOrder(system.components).map((component) => {
      const optionRows = Array.isArray(component.options) ? component.options : [];
      const optionSummaries = optionRows
        .map(toOptionSummary)
        .filter((option): option is CustomSetupBlueprintOptionSummary => option !== null);
      const defaultOption = optionSummaries.find((option) => option.isDefault) ?? optionSummaries[0] ?? null;

      return {
  slug: component.slug,
  id: component.id,
        name: component.name,
        description: component.description ?? null,
        isRequired: Boolean(component.is_required),
        optionCount: optionSummaries.length,
        pricingMode: component.pricing_mode,
        pricingFormula: component.price_formula ?? null,
        quantityVariable: component.quantity_variable ?? null,
        metadata: component.metadata ?? null,
        defaultQuantity: component.default_quantity ?? null,
        defaultOption,
        options: optionSummaries,
        basePrice: component.base_price ?? null,
        unitPrice: component.unit_price ?? null
      } satisfies CustomSetupBlueprintComponentSummary;
    });

    return {
      id: system.id,
      slug: system.slug,
      name: system.name,
      description: system.description ?? null,
      isDefault: Boolean(system.is_default),
      baseFee: system.base_fee ?? null,
      pricingFormula: system.pricing_formula ?? null,
      metadata: system.metadata ?? null,
      components
    } satisfies CustomSetupBlueprintSystemSummary;
  });

  return {
    id: template.id,
    slug: template.slug,
    name: template.name,
    description: template.description ?? null,
    heroCopy: template.hero_copy ?? null,
    category: template.category ?? null,
    basePrice: template.base_price ?? null,
    currency: template.currency ?? null,
    metadata: template.metadata ?? null,
    variables,
    systems
  } satisfies CustomSetupBlueprintSummary;
}

function buildLegacyOptionsFromInventory(
  rows: Array<{ id: string; category: string; label: string; capacity?: number | null; mrp?: number | null; sale?: number | null; metadata?: Record<string, unknown> | null }>,
  category: string
) {
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

function buildLegacyComponentFromInventory(
  rows: Array<{ id: string; category: string; label: string; capacity?: number | null; mrp?: number | null; sale?: number | null; metadata?: Record<string, unknown> | null }>,
  category: string,
  slug: string,
  name: string,
  quantityVariable: string | null
) {
  const options = buildLegacyOptionsFromInventory(rows, category);
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

export function buildSummaryFromInventoryRows(
  rows: Array<{ id: string; category: string; label: string; capacity?: number | null; mrp?: number | null; sale?: number | null; metadata?: Record<string, unknown> | null }>
): CustomSetupBlueprintSummary {
  const analogComponents = [
    buildLegacyComponentFromInventory(rows, 'analog_dvr', 'analog-dvr', 'DVR', null),
    buildLegacyComponentFromInventory(rows, 'analog_camera', 'analog-camera', 'Analog Camera', 'camera_count'),
    buildLegacyComponentFromInventory(rows, 'analog_smps', 'smps-power', 'SMPS Power Supply', null),
    buildLegacyComponentFromInventory(rows, 'analog_cable', 'coaxial-cable', 'Coaxial Cable', 'total_cable_length_m'),
  ].filter((component) => component.optionCount > 0);

  const ipComponents = [
    buildLegacyComponentFromInventory(rows, 'ip_nvr', 'ip-nvr', 'NVR', null),
    buildLegacyComponentFromInventory(rows, 'ip_camera', 'ip-camera', 'IP Camera', 'camera_count'),
    buildLegacyComponentFromInventory(rows, 'ip_poe', 'poe-switch', 'PoE Switch', null),
    buildLegacyComponentFromInventory(rows, 'ip_cable', 'cat6-cable', 'LAN Cable', 'total_cable_length_m'),
  ].filter((component) => component.optionCount > 0);

  const accessoriesComponents = [
    buildLegacyComponentFromInventory(rows, 'hdd', 'hdd-storage', 'Hard Drive Storage', null),
    buildLegacyComponentFromInventory(rows, 'monitor', 'monitor-display', 'Display Monitor', null),
    buildLegacyComponentFromInventory(rows, 'rack', 'network-rack', 'Network Rack', null),
    buildLegacyComponentFromInventory(rows, 'conduit', 'conduit-pipe', 'Conduit Pipe', null),
    buildLegacyComponentFromInventory(rows, 'accessory', 'hardware-accessories', 'General Accessories', null),
    buildLegacyComponentFromInventory(rows, 'installation', 'installation-fee', 'Installation Charges', null),
  ].filter((component) => component.optionCount > 0);

  return {
    id: 'cctv-camera-full-setup',
    slug: 'cctv-camera-full-setup',
    name: 'CCTV Camera Full Setup',
    description: 'Complete customizable CCTV camera installation setup template.',
    heroCopy: null,
    category: 'Surveillance',
    basePrice: null,
    currency: 'INR',
    metadata: { source: 'custom_setup_inventory' },
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

export async function getCustomSetupBlueprintSummary(slug: string): Promise<CustomSetupBlueprintSummary | null> {
  const redis = getRedis();
  const cacheKey = `blueprint:summary:${slug}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info('custom_setup.blueprint_cache_hit', { slug });
        return JSON.parse(cached) as CustomSetupBlueprintSummary;
      }
    } catch (err) {
      logger.warn('custom_setup.blueprint_cache_read_failed', {
        slug,
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  const template = await fetchCustomSetupTemplateBySlug(slug);
  let summary = buildCustomSetupBlueprintSummary(template);

  if (!summary) {
    try {
      const inventory = await getCustomSetupInventoryFromDb();
      if (inventory && inventory.length > 0) {
        summary = buildSummaryFromInventoryRows(inventory as any);
      }
    } catch (err) {
      logger.warn('custom_setup.fallback_inventory_failed', { slug, error: String(err) });
    }
  }

  if (redis && summary) {
    try {
      await redis.set(cacheKey, JSON.stringify(summary), 'EX', 3600); // Cache for 1 hour
      logger.info('custom_setup.blueprint_cache_write', { slug });
    } catch (err) {
      logger.warn('custom_setup.blueprint_cache_write_failed', {
        slug,
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  return summary;
}
