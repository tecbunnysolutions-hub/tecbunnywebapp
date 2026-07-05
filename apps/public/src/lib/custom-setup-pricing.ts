import type { CustomSetupBlueprintSummary, CustomSetupBlueprintComponentSummary } from '@/lib/custom-setup-service';

export type SetupSystem = 'analog' | 'ip';

export interface PriceEntry {
  id: string;
  label: string;
  mrp: number | null;
  sale: number;
}

export type CapacityPriceEntry = PriceEntry & {
  capacity: number;
  variant?: string;
};

export type CameraPriceMatrix = {
  standard: PriceEntry;
  dualLight: PriceEntry;
};

export interface CablePriceEntry {
  id: string;
  label: string;
  coverageMeters: number;
  mrpPerUnit: number;
  salePerUnit: number;
}

export interface AnalogPricing {
  dvr: CapacityPriceEntry[];
  smps: CapacityPriceEntry[];
  camera: {
    '2.4mp': CameraPriceMatrix;
    '5mp': CameraPriceMatrix;
  };
  cable: CablePriceEntry[];
}

export interface IpPricing {
  nvr: CapacityPriceEntry[];
  poe: CapacityPriceEntry[];
  camera: {
    '2mp': CameraPriceMatrix;
    '5mp': CameraPriceMatrix;
  };
  cable: CablePriceEntry[];
}

export const FALLBACK_ANALOG_PRICING: AnalogPricing = {
  dvr: [
    { id: 'dvr-4', label: '4-Ch Analog (2.4MP Max)', capacity: 4, mrp: 0, sale: 0 },
    { id: 'dvr-8', label: '8-Ch Analog (2.4MP Max)', capacity: 8, mrp: 0, sale: 0 },
    { id: 'dvr-4-5mp', label: '4-Ch 5MP Analog', capacity: 4, mrp: 0, sale: 0 },
    { id: 'dvr-8-5mp', label: '8-Ch 5MP Analog', capacity: 8, mrp: 0, sale: 0 },
    { id: 'dvr-16-5mp', label: '16-Ch 5MP Analog', capacity: 16, mrp: 0, sale: 0 },
  ],
  smps: [
    { id: 'smps-8', label: '8-Channel SMPS (DVR Only)', capacity: 8, mrp: 0, sale: 0 },
    { id: 'smps-16', label: '16-Channel SMPS (DVR Only)', capacity: 16, mrp: 0, sale: 0 },
  ],
  camera: {
    '2.4mp': {
      standard: { id: 'analog-2.4-standard', label: '2.4MP Normal', mrp: 0, sale: 0 },
      dualLight: { id: 'analog-2.4-dual', label: '2.4MP Dual Light', mrp: 0, sale: 0 },
    },
    '5mp': {
      standard: { id: 'analog-5-standard', label: '5MP Normal', mrp: 0, sale: 0 },
      dualLight: { id: 'analog-5-dual', label: '5MP Dual Light', mrp: 0, sale: 0 },
    },
  },
  cable: [
    { id: 'cable-coaxial-100m', label: 'CCTV 3+1 Cable (DVR Only)', coverageMeters: 100, mrpPerUnit: 0, salePerUnit: 0 },
  ],
};

export const FALLBACK_IP_PRICING: IpPricing = {
  nvr: [
    { id: 'nvr-8', label: '8-Channel NVR (IP)', capacity: 8, mrp: 0, sale: 0 },
    { id: 'nvr-16', label: '16-Channel NVR (IP)', capacity: 16, mrp: 0, sale: 0 },
    { id: 'nvr-32', label: '32-Channel NVR (IP)', capacity: 32, mrp: 0, sale: 0 },
  ],
  poe: [
    { id: 'poe-4-normal', label: '4-Port POE Switch (Normal)', capacity: 4, variant: 'normal', mrp: 0, sale: 0 },
    { id: 'poe-8-normal', label: '8-Port POE Switch (Normal)', capacity: 8, variant: 'normal', mrp: 0, sale: 0 },
    { id: 'poe-16-normal', label: '16-Port POE Switch (Normal)', capacity: 16, variant: 'normal', mrp: 0, sale: 0 },
    { id: 'poe-24-normal', label: '24-Port POE Switch (Normal)', capacity: 24, variant: 'normal', mrp: 0, sale: 0 },
    { id: 'poe-4-giga', label: '4-Port POE Switch (GIGA)', capacity: 4, variant: 'giga', mrp: 0, sale: 0 },
    { id: 'poe-8-giga', label: '8-Port POE Switch (GIGA)', capacity: 8, variant: 'giga', mrp: 0, sale: 0 },
    { id: 'poe-16-giga', label: '16-Port POE Switch (GIGA)', capacity: 16, variant: 'giga', mrp: 0, sale: 0 },
    { id: 'poe-24-giga', label: '24-Port POE Switch (GIGA)', capacity: 24, variant: 'giga', mrp: 0, sale: 0 },
  ],
  camera: {
    '2mp': {
      standard: { id: 'ip-2-standard', label: '2MP Normal', mrp: 0, sale: 0 },
      dualLight: { id: 'ip-2-dual', label: '2MP Dual Light', mrp: 0, sale: 0 },
    },
    '5mp': {
      standard: { id: 'ip-4-standard', label: '4MP Normal', mrp: 0, sale: 0 },
      dualLight: { id: 'ip-4-dual', label: '4MP Dual Light', mrp: 0, sale: 0 },
    },
  },
  cable: [
    { id: 'cable-lan-cat5', label: 'LAN Cat5 Cable (100m)', coverageMeters: 100, mrpPerUnit: 0, salePerUnit: 0 },
    { id: 'cable-lan-cat6', label: 'LAN Cat6 Cable (100m)', coverageMeters: 100, mrpPerUnit: 0, salePerUnit: 0 },
  ],
};

export const FALLBACK_HDD_OPTIONS: PriceEntry[] = [
  { id: 'hdd-surveillance-500gb', label: '500 GB Surveillance HDD', mrp: 0, sale: 0 },
  { id: 'hdd-surveillance-1tb', label: '1 TB Surveillance HDD', mrp: 0, sale: 0 },
  { id: 'hdd-surveillance-2tb', label: '2 TB Surveillance HDD', mrp: 0, sale: 0 },
];

export const FALLBACK_MONITOR_OPTION: PriceEntry = {
  id: 'monitor-19',
  label: '19-inch LED Monitor',
  mrp: 0,
  sale: 0,
};

export const FALLBACK_MONITOR_OPTIONS: PriceEntry[] = [
  {
    id: 'monitor-19',
    label: '19-inch LED Monitor',
    mrp: 0,
    sale: 0,
  },
  {
    id: 'monitor-22',
    label: '22-inch LED Monitor',
    mrp: 0,
    sale: 0,
  },
];

export const FALLBACK_WALL_MOUNT_ADDON: PriceEntry = {
  id: 'wall-mount-addon',
  label: 'Wall Mount Installation Kit',
  mrp: 0,
  sale: 0,
};

export const FALLBACK_SPIKE_GUARD_OPTION: PriceEntry = {
  id: 'spike-guard',
  label: 'Spike Guard / Power Surge Protector',
  mrp: 0,
  sale: 0,
};

export const FALLBACK_RACK_OPTIONS: PriceEntry[] = [
  {
    id: 'rack-2u',
    label: '2U Wall Mount Rack',
    mrp: 0,
    sale: 0,
  },
  {
    id: 'rack-3u',
    label: '3U Wall Mount Rack',
    mrp: 0,
    sale: 0,
  },
];

export const FALLBACK_CONDUIT_PIPE_OPTIONS: PriceEntry[] = [
  {
    id: 'conduit-pipe',
    label: 'Conduit Pipe',
    mrp: 0,
    sale: 0,
  },
];

export const FALLBACK_INSTALLATION_OPTION: PriceEntry = {
  id: 'installation',
  label: 'On-site Installation & Configuration',
  mrp: 0,
  sale: 0,
};

import { getCustomSetupConstantsFromDb, getCustomSetupInventoryFromDb } from './config-db';

async function getFallbackPricing() {
  const inventory = await getCustomSetupInventoryFromDb();
  const getItems = (category: string) => inventory.filter(i => i.category === category).map(i => ({
    id: i.id,
    label: i.label,
    capacity: i.capacity || 1,
    variant: /giga/i.test(i.label) ? 'giga' : (/normal/i.test(i.label) ? 'normal' : undefined),
    mrp: i.mrp ? Number(i.mrp) : null,
    sale: Number(i.sale),
    coverageMeters: i.capacity || 100,
    mrpPerUnit: i.mrp ? Number(i.mrp) : 0,
    salePerUnit: Number(i.sale)
  }));
  const getAccessory = (id: string) => getItems('accessory').find(i => i.id === id) || { id, label: 'Unknown', mrp: 0, sale: 0 };
  const getAnalogCamera = (id: string) => getItems('analog_camera').find(i => i.id === id) || { id, label: 'Unknown', mrp: 0, sale: 0 };
  const getIpCamera = (id: string) => getItems('ip_camera').find(i => i.id === id) || { id, label: 'Unknown', mrp: 0, sale: 0 };
  
  return {
    analog: {
      dvr: getItems('analog_dvr').filter((entry) => [4, 8, 16].includes(entry.capacity) && entry.label.toLowerCase().includes('analog')),
      smps: getItems('analog_smps').filter((entry) => [4, 8, 16].includes(entry.capacity)),
      camera: {
        '2.4mp': { standard: getAnalogCamera('analog-2.4-standard'), dualLight: getAnalogCamera('analog-2.4-dual') },
        '5mp': { standard: getAnalogCamera('analog-5-standard'), dualLight: getAnalogCamera('analog-5-dual') }
      },
      cable: getItems('analog_cable')
    } as AnalogPricing,
    ip: {
      nvr: getItems('ip_nvr').filter((entry) => [8, 16, 32].includes(entry.capacity)),
      poe: getItems('ip_poe').filter((entry) => [4, 8, 16, 32].includes(entry.capacity)),
      camera: {
        '2mp': { standard: getIpCamera('ip-2-standard'), dualLight: getIpCamera('ip-2-dual') },
        '5mp': { standard: getIpCamera('ip-4-standard'), dualLight: getIpCamera('ip-4-dual') }
      },
      cable: getItems('ip_cable')
    } as IpPricing,
    hddOptions: getItems('hdd').filter(i => !/new|refurbished/i.test(i.label)),
    monitorOptions: getItems('monitor'),
    rackOptions: getItems('rack'),
    conduitOptions: getItems('conduit'),
    installationOption: getItems('installation')[0] || getAccessory('installation'),
    wallMountAddon: getAccessory('wall-mount-addon'),
    spikeGuardOption: getAccessory('spike-guard')
  };
}

const SALE_PRICE_METADATA_KEYS = ['sale_price', 'salePrice', 'offer_price', 'offerPrice', 'discounted_price', 'discountedPrice'];

function findComponentBySlug(
  system: CustomSetupBlueprintSummary['systems'][number] | undefined,
  slugs: string[]
): CustomSetupBlueprintComponentSummary | undefined {
  return system?.components.find((component) => slugs.includes(component.slug));
}

export function readNumericMetadata(meta: Record<string, unknown> | null | undefined, key: string): number | null {
  if (!meta || typeof meta !== 'object') {
    return null;
  }
  const raw = meta[key];
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const normalized = raw.replace(/[^0-9.\-]/g, '');
    if (!normalized.trim()) {
      return null;
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function readBooleanMetadata(meta: Record<string, unknown> | null | undefined, key: string): boolean | null {
  if (!meta || typeof meta !== 'object') {
    return null;
  }
  const raw = meta[key];
  if (typeof raw === 'boolean') {
    return raw;
  }
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    if (['true', 'yes', '1'].includes(normalized)) {
      return true;
    }
    if (['false', 'no', '0'].includes(normalized)) {
      return false;
    }
  }
  if (typeof raw === 'number') {
    if (raw === 1) return true;
    if (raw === 0) return false;
  }
  return null;
}

export function resolvePricePair(
  option: CustomSetupBlueprintComponentSummary['options'][number] | undefined,
  component: CustomSetupBlueprintComponentSummary | undefined,
  fallbackMrp: number,
  fallbackSale: number
): { mrp: number; sale: number } {
  const mrpSource = option?.unitPrice ?? component?.unitPrice ?? component?.basePrice ?? fallbackMrp;
  const saleMeta = option ? SALE_PRICE_METADATA_KEYS.map((key) => readNumericMetadata(option.metadata ?? null, key)).find((value) => value !== null) : null;
  const saleSource = saleMeta ?? fallbackSale ?? mrpSource;
  
  const rawMrp = Math.max(0, mrpSource || 0);
  const rawSale = Math.max(0, saleSource || 0);
  
  let mrp: number;
  let sale: number;
  
  if (rawMrp === 0 && rawSale > 0) {
    mrp = rawSale;
    sale = rawSale;
  } else if (rawMrp > 0 && rawSale > rawMrp) {
    mrp = rawMrp;
    sale = rawMrp;
  } else {
    mrp = rawMrp;
    sale = Math.min(rawSale, rawMrp);
  }
  
  return { mrp, sale };
}

export function parseChannelCapacity(label: string): number | null {
  const match = label.match(/(\d+)\s*channel/i);
  if (!match) {
    return null;
  }
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeCapacity(
  option: CustomSetupBlueprintComponentSummary['options'][number] | undefined,
  fallbackCapacity: number
): number {
  const metadataCapacity = option ? readNumericMetadata(option.metadata ?? null, 'channel_count') : null;
  if (metadataCapacity && Number.isFinite(metadataCapacity)) {
    return metadataCapacity;
  }
  if (option?.label) {
    const parsed = parseChannelCapacity(option.label);
    if (parsed) {
      return parsed;
    }
  }
  return fallbackCapacity;
}

function normalizeVariant(option: CustomSetupBlueprintComponentSummary['options'][number] | undefined): string | undefined {
  const metadataVariant = option?.metadata && typeof option.metadata === 'object'
    ? (option.metadata as Record<string, unknown>).variant
    : undefined;
  if (typeof metadataVariant === 'string' && metadataVariant.trim()) {
    return metadataVariant.trim().toLowerCase();
  }
  const label = option?.label?.toLowerCase() ?? '';
  if (label.includes('giga') || label.includes('gigabit')) {
    return 'giga';
  }
  if (label.includes('normal')) {
    return 'normal';
  }
  return undefined;
}

export function normalizeMegapixels(
  option: CustomSetupBlueprintComponentSummary['options'][number] | undefined,
  fallback: number
): number {
  const metadataMp = option ? readNumericMetadata(option.metadata ?? null, 'megapixels') : null;
  if (metadataMp && Number.isFinite(metadataMp)) {
    return metadataMp;
  }
  if (option?.label) {
    const match = option.label.match(/(\d+(?:\.\d+)?)\s*mp/i);
    if (match) {
      const parsed = Number.parseFloat(match[1]);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return fallback;
}

export function buildCapacityEntries(
  component: CustomSetupBlueprintComponentSummary | undefined,
  fallback: CapacityPriceEntry[]
): CapacityPriceEntry[] {
  if (!component) {
    return fallback;
  }

  const fallbackByCapacity = new Map<number, CapacityPriceEntry>(
    fallback.map((entry) => [entry.capacity, entry])
  );

  const entries: CapacityPriceEntry[] = [];

  component.options.forEach((option, index) => {
    const fallbackByIndex = fallback[index] ?? fallback[0] ?? null;
    const fallbackCapacity = fallbackByIndex?.capacity ?? fallback[0]?.capacity ?? 1;
    const capacity = Math.max(1, Math.round(normalizeCapacity(option, fallbackCapacity)));
    const fallbackEntry = fallbackByCapacity.get(capacity) ?? fallbackByIndex;
    const fallbackMrp = fallbackEntry?.mrp ?? fallbackByIndex?.mrp ?? 0;
    const fallbackSale = fallbackEntry?.sale ?? fallbackByIndex?.sale ?? 0;
    const { mrp, sale } = resolvePricePair(option, component, fallbackMrp, fallbackSale);

    entries.push({
      id: option.id,
      label: option.label || fallbackEntry?.label || component.name,
      capacity,
      variant: normalizeVariant(option) ?? fallbackEntry?.variant,
      mrp,
      sale,
    });
  });

  fallback.forEach((entry) => {
    if (!entries.some((candidate) => candidate.capacity === entry.capacity)) {
      entries.push(entry);
    }
  });

  return entries.sort((a, b) => a.capacity - b.capacity);
}

export function buildCableEntries(
  component: CustomSetupBlueprintComponentSummary | undefined,
  fallback: CablePriceEntry[]
): CablePriceEntry[] {
  if (!component) {
    return fallback;
  }

  return fallback.map((entry) => {
    const option = component.options.find((candidate) => {
      const label = candidate.label?.toLowerCase() ?? '';
      const fallbackLower = entry.label.toLowerCase();
      if (fallbackLower.includes('lan') && label.includes('lan')) {
        return true;
      }
      if (fallbackLower.includes('coaxial') && (label.includes('coax') || label.includes('rg59'))) {
        return true;
      }
      return false;
    });

    if (!option) {
      return entry;
    }

    const coverage = readNumericMetadata(option.metadata ?? null, 'coverage_m') ?? entry.coverageMeters;
    const { mrp, sale } = resolvePricePair(option, component, entry.mrpPerUnit, entry.salePerUnit);

    return {
      id: option.id,
      label: option.label || entry.label,
      coverageMeters: coverage,
      mrpPerUnit: mrp,
      salePerUnit: sale,
    } satisfies CablePriceEntry;
  });
}

export function buildCameraMatrix(
  component: CustomSetupBlueprintComponentSummary | undefined,
  resolutionKey: '2.4mp' | '5mp' | '2mp',
  fallback: CameraPriceMatrix
): CameraPriceMatrix {
  if (!component) {
    return fallback;
  }

  const targetMp = Number.parseFloat(resolutionKey.replace('mp', ''));

  const findOption = (dual: boolean) => {
    return component.options.find((option) => {
      const mp = normalizeMegapixels(option, targetMp);
      if (Math.abs(mp - targetMp) > 0.11) {
        return false;
      }
      const metaDual = readBooleanMetadata(option.metadata ?? null, 'dual_light');
      const label = option.label?.toLowerCase() ?? '';
      const isDual = metaDual ?? /dual/.test(label) ?? /two light/.test(label);
      return dual ? isDual : !isDual;
    });
  };

  const standardOption = findOption(false) ?? findOption(true);
  const dualOption = findOption(true) ?? standardOption;

  const standardPricing = standardOption
    ? (() => {
        const { mrp, sale } = resolvePricePair(standardOption, component, fallback.standard.mrp ?? 0, fallback.standard.sale);
        return {
          id: standardOption.id,
          label: standardOption.label || fallback.standard.label,
          mrp,
          sale,
        } satisfies PriceEntry;
      })()
    : fallback.standard;

  const dualPricing = dualOption
    ? (() => {
        const { mrp, sale } = resolvePricePair(dualOption, component, fallback.dualLight.mrp ?? 0, fallback.dualLight.sale);
        return {
          id: dualOption.id,
          label: dualOption.label || fallback.dualLight.label,
          mrp,
          sale,
        } satisfies PriceEntry;
      })()
    : fallback.dualLight;

  return {
    standard: standardPricing,
    dualLight: dualPricing,
  } satisfies CameraPriceMatrix;
}

export function buildHddOptionsFromComponents(
  components: Array<CustomSetupBlueprintComponentSummary | undefined>,
  fallback: PriceEntry[]
): PriceEntry[] {
  const entries: PriceEntry[] = [];
  const seen = new Set<string>();

  for (const component of components) {
    if (!component) continue;
    component.options.forEach((option) => {
      const label = option.label ?? '';
      const capacityMatch = label.match(/(\d+(?:\.\d+)?)\s*(tb|gb)/i);
      const key = capacityMatch ? capacityMatch[0].toLowerCase() : option.id;
      if (seen.has(key)) {
        return;
      }
      const { mrp, sale } = resolvePricePair(option, component, option.unitPrice ?? component.unitPrice ?? component.basePrice ?? 0, option.unitPrice ?? component.unitPrice ?? component.basePrice ?? 0);
      entries.push({
        id: option.id,
        label: label || 'Storage option',
        mrp,
        sale,
      });
      seen.add(key);
    });
  }

  if (!entries.length) {
    return fallback;
  }

  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

export function pickFirstOption(component: CustomSetupBlueprintComponentSummary | undefined): PriceEntry | null {
  if (!component || !component.options.length) {
    return null;
  }
  const option = component.options[0];
  const { mrp, sale } = resolvePricePair(option, component, option.unitPrice ?? component.unitPrice ?? component.basePrice ?? 0, option.unitPrice ?? component.unitPrice ?? component.basePrice ?? 0);
  return {
    id: option.id,
    label: option.label ?? component.name,
    mrp,
    sale,
  } satisfies PriceEntry;
}

export async function buildPricingCatalog(blueprint: CustomSetupBlueprintSummary | null): Promise<{
  analog: AnalogPricing;
  ip: IpPricing;
  hddOptions: PriceEntry[];
  monitorOptions: PriceEntry[];
  rackOptions: PriceEntry[];
  conduitOptions: PriceEntry[];
  wallMountAddon: PriceEntry;
  spikeGuardOption: PriceEntry;
  monitorOption: PriceEntry;
  installationOption: PriceEntry;
  constants: Record<string, number>;
}> {
  const fallbacks = await getFallbackPricing();
  const constants = await getCustomSetupConstantsFromDb();

  if (!blueprint) {
    return {
      analog: fallbacks.analog,
      ip: fallbacks.ip,
      hddOptions: fallbacks.hddOptions,
      monitorOptions: fallbacks.monitorOptions,
      rackOptions: fallbacks.rackOptions,
      conduitOptions: fallbacks.conduitOptions,
      wallMountAddon: fallbacks.wallMountAddon,
      spikeGuardOption: fallbacks.spikeGuardOption,
      monitorOption: fallbacks.monitorOptions[0] || { id: 'mon', label: 'Monitor', mrp: 0, sale: 0 },
      installationOption: fallbacks.installationOption,
      constants,
    };
  }

  const analogSystem = blueprint.systems.find((system) => ['dvr-system', 'analog-cctv'].includes(system.slug));
  const ipSystem = blueprint.systems.find((system) => ['nvr-system', 'ip-cctv'].includes(system.slug));

  const analogPricing: AnalogPricing = {
    dvr: buildCapacityEntries(
      findComponentBySlug(analogSystem, ['dvr-recorder', 'analog-dvr']),
      fallbacks.analog.dvr
    ),
    smps: buildCapacityEntries(
      findComponentBySlug(analogSystem, ['smps-power', 'analog-smps']),
      fallbacks.analog.smps
    ),
    camera: {
      '2.4mp': buildCameraMatrix(
        findComponentBySlug(analogSystem, ['analog-camera']),
        '2.4mp',
        fallbacks.analog.camera['2.4mp']
      ),
      '5mp': buildCameraMatrix(
        findComponentBySlug(analogSystem, ['analog-camera']),
        '5mp',
        fallbacks.analog.camera['5mp']
      ),
    },
    cable: buildCableEntries(
      findComponentBySlug(analogSystem, ['coaxial-cable']),
      fallbacks.analog.cable
    ),
  } satisfies AnalogPricing;

  const ipPricing: IpPricing = {
    nvr: buildCapacityEntries(
      findComponentBySlug(ipSystem, ['nvr-recorder', 'ip-nvr']),
      fallbacks.ip.nvr
    ),
    poe: buildCapacityEntries(
      findComponentBySlug(ipSystem, ['poe-switch', 'ip-poe']),
      fallbacks.ip.poe
    ),
    camera: {
      '2mp': buildCameraMatrix(
        findComponentBySlug(ipSystem, ['ip-camera']),
        '2mp',
        fallbacks.ip.camera['2mp']
      ),
      '5mp': buildCameraMatrix(
        findComponentBySlug(ipSystem, ['ip-camera']),
        '5mp',
        fallbacks.ip.camera['5mp']
      ),
    },
    cable: buildCableEntries(
      findComponentBySlug(ipSystem, ['cat6-cable']),
      fallbacks.ip.cable
    ),
  } satisfies IpPricing;

  const hddOptions = buildHddOptionsFromComponents(
    [
      analogSystem?.components.find((component) => component.slug === 'dvr-storage'),
      ipSystem?.components.find((component) => component.slug === 'nvr-storage'),
    ],
    fallbacks.hddOptions
  );

  const monitorComponent =
    analogSystem?.components.find((component) => component.slug.includes('monitor')) ??
    ipSystem?.components.find((component) => component.slug.includes('monitor'));

  const installationComponent =
    analogSystem?.components.find((component) => component.slug === 'installation-service') ??
    ipSystem?.components.find((component) => component.slug === 'installation-service');

  const monitorOption = pickFirstOption(monitorComponent) ?? (fallbacks.monitorOptions[0] || { id: 'mon', label: 'Monitor', mrp: 0, sale: 0 });
  const installationOption = pickFirstOption(installationComponent) ?? fallbacks.installationOption;

  return {
    analog: analogPricing,
    ip: ipPricing,
    hddOptions,
    monitorOptions: fallbacks.monitorOptions,
    rackOptions: fallbacks.rackOptions,
    conduitOptions: fallbacks.conduitOptions,
    wallMountAddon: fallbacks.wallMountAddon,
    spikeGuardOption: fallbacks.spikeGuardOption,
    monitorOption,
    installationOption,
    constants,
  };
}

export function pickCapacityOption(options: CapacityPriceEntry[], cameraCount: number): CapacityPriceEntry {
  const sorted = [...options].sort((a, b) => a.capacity - b.capacity);
  return sorted.find((entry) => entry.capacity >= cameraCount) ?? sorted[sorted.length - 1];
}

export function calculateQuantity(cameraCount: number, capacity: number): number {
  if (capacity <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(cameraCount / capacity));
}

const AVERAGE_RUN_METERS_PER_CAMERA = 25;
const CABLE_METERS_PER_UNIT = 100;
const DVR_BASE_SETUP_FEE = 1000;
const NVR_BASE_SETUP_FEE = 2000;
const INSTALLATION_SETUP_CONFIGURATION_COST = DVR_BASE_SETUP_FEE;
const INSTALLATION_LABOR_PER_CAMERA = 250;
const INSTALLATION_LABOR_PER_METER_CABLE = 5;

export function calculateCableQuantity(cameraCount: number, cable: CablePriceEntry, cableUnits?: number, constants?: Record<string, number>): number {
  if (typeof cableUnits === 'number' && Number.isFinite(cableUnits)) {
    return Math.max(1, Math.round(cableUnits));
  }

  const avgMeters = constants?.average_run_meters_per_camera ?? AVERAGE_RUN_METERS_PER_CAMERA;
  const totalRun = Math.max(1, cameraCount) * avgMeters;
  const coverage = Math.max(1, cable.coverageMeters);
  return Math.max(1, Math.ceil(totalRun / coverage));
}

export function calculateCableMetersFromUnits(cableUnits: number): number {
  return Math.max(1, Math.round(cableUnits)) * CABLE_METERS_PER_UNIT;
}

export function roundUpToThousandMinusOne(value: number): number {
  if (value <= 0) {
    return 0;
  }
  return Math.max(0, Math.ceil(value / 1000) * 1000 - 1);
}

export function calculateInstallationCharges(
  system: SetupSystem, 
  cameraCount: number, 
  cableUnits: number,
  monitorStand: 'none' | 'static' | 'movable' = 'none',
  rackIncluded: boolean = false,
  constants?: Record<string, number>
): {
  sale: number;
  breakdown: string[];
} {
  const cameraCountClamped = Math.max(0, cameraCount);
  const cableMeters = calculateCableMetersFromUnits(cableUnits);
  
  const dvrFee = constants?.dvr_base_setup_fee ?? DVR_BASE_SETUP_FEE;
  const nvrFee = constants?.nvr_base_setup_fee ?? NVR_BASE_SETUP_FEE;
  const laborCam = constants?.installation_labor_per_camera ?? INSTALLATION_LABOR_PER_CAMERA;
  const laborCable = constants?.installation_labor_per_meter_cable ?? INSTALLATION_LABOR_PER_METER_CABLE;

  const baseSetupCost = system === 'analog' ? dvrFee : nvrFee;
  const cameraLaborCost = cameraCountClamped * laborCam;
  const cableLaborCost = cableMeters * laborCable;
  
  let accessoryInstallCost = 0;
  if (monitorStand === 'static' || monitorStand === 'movable') {
    accessoryInstallCost += 299;
  }
  if (rackIncluded) {
    accessoryInstallCost += 299;
  }

  const rawTotal = cameraCountClamped > 0 ? baseSetupCost + cameraLaborCost + cableLaborCost + accessoryInstallCost : 0;

  const breakdown: string[] = [];
  if (cameraCountClamped > 0) {
    breakdown.push(`${cameraCountClamped} camera installation @ ₹${laborCam}/unit`);
    breakdown.push(`${cableMeters} m cable laying @ ₹${laborCable}/m`);
    breakdown.push(`Base Setup & configuration: ₹${baseSetupCost}`);
    if (accessoryInstallCost > 0) {
      breakdown.push(`Accessory Installation: ₹${accessoryInstallCost}`);
    }
  }

  return {
    sale: roundUpToThousandMinusOne(rawTotal),
    breakdown,
  };
}

export function recommendedAnalogDvrCapacity(cameraCount: number): number {
  if (cameraCount <= 4) {
    return 4;
  }
  if (cameraCount <= 8) {
    return 8;
  }
  if (cameraCount <= 16) {
    return 16;
  }
  return 16;
}

export function recommendedAnalogSmpsCapacity(cameraCount: number): number {
  if (cameraCount <= 4) {
    return 4;
  }
  if (cameraCount <= 8) {
    return 8;
  }
  return 16;
}

export function recommendedIpCapacity(cameraCount: number): number {
  if (cameraCount <= 8) {
    return 8;
  }
  if (cameraCount <= 16) {
    return 16;
  }
  return 32;
}

export function recommendedPoePortCapacity(cameraCount: number): number {
  if (cameraCount <= 4) {
    return 4;
  }
  if (cameraCount <= 8) {
    return 8;
  }
  if (cameraCount <= 16) {
    return 16;
  }
  return 32;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(value));
}

export interface AnalogSelections {
  dvrId: string;
  smpsId: string;
  cableId: string;
  resolution: '2.4mp' | '5mp';
  dualLight: boolean;
}

export interface IpSelections {
  nvrId: string;
  poeId: string;
  cableId: string;
  resolution: '2mp' | '5mp';
  dualLight: boolean;
}

export interface ActiveOffer {
  id: string;
  title: string;
  description: string;
  offerType: 'PERCENTAGE_DISCOUNT' | 'FREE_INSTALLATION' | 'FREE_ACCESSORY';
  offerValue: string;
  endDate: string;
}

export interface Totals {
  system: { mrp: number; sale: number; breakdown: string[] };
  hdd: { mrp: number; sale: number; label: string };
  monitor: { mrp: number; sale: number; included: boolean; label: string };
  wallMount: { mrp: number; sale: number; included: boolean };
  spikeGuard: { mrp: number; sale: number; included: boolean };
  rack: { mrp: number; sale: number; selected: boolean; label: string };
  conduit: { mrp: number; sale: number; selected: boolean; label: string; meters: number };
  installation: { mrp: number; sale: number; included: boolean };
  installationLabor: { sale: number; breakdown: string[] };
  overall: { mrp: number; sale: number; discountAmount: number; discountPercent: number };
  appliedOffer?: {
    title: string;
    originalSale: number;
    discountedSale: number;
    savings: number;
  } | null;
}

export function buildAnalogSystemSummary(cameraCount: number, selections: AnalogSelections, pricing: AnalogPricing, cableUnits?: number, constants?: Record<string, number>): {
  mrp: number;
  sale: number;
  breakdown: string[];
} {
  const dvr = pricing.dvr.find((entry) => entry.id === selections.dvrId) ?? pricing.dvr[0];
  const smps = pricing.smps.find((entry) => entry.id === selections.smpsId) ?? pricing.smps[0];
  const cable = pricing.cable.find((entry) => entry.id === selections.cableId) ?? pricing.cable[0];
  const cameraMatrix = pricing.camera[selections.resolution];
  const cameraPricing = selections.dualLight ? cameraMatrix.dualLight : cameraMatrix.standard;

  const smpsQuantity = calculateQuantity(cameraCount, smps.capacity);
  const cableQuantity = calculateCableQuantity(cameraCount, cable, cableUnits, constants);

  const mrp =
    (dvr.mrp ?? 0) +
    (smps.mrp ?? 0) * smpsQuantity +
    (cameraPricing.mrp ?? 0) * cameraCount +
    (cable.mrpPerUnit ?? 0) * cableQuantity;
  const sale =
    dvr.sale +
    smps.sale * smpsQuantity +
    cameraPricing.sale * cameraCount +
    cable.salePerUnit * cableQuantity;

  const breakdown: string[] = [
    `${dvr.label} (${formatCurrency(dvr.sale)})`,
    `${smpsQuantity} × ${smps.label} (${formatCurrency(smps.sale * smpsQuantity)})`,
    `${cameraCount} × ${cameraPricing.label} (${formatCurrency(cameraPricing.sale * cameraCount)})`,
    `${cableQuantity} × ${cable.label} (${formatCurrency(cable.salePerUnit * cableQuantity)})`,
  ];

  return { mrp, sale, breakdown };
}

export function buildIpSystemSummary(cameraCount: number, selections: IpSelections, pricing: IpPricing, cableUnits?: number, constants?: Record<string, number>): {
  mrp: number;
  sale: number;
  breakdown: string[];
} {
  const nvr = pricing.nvr.find((entry) => entry.id === selections.nvrId) ?? pricing.nvr[0];
  const poe = pricing.poe.find((entry) => entry.id === selections.poeId) ?? pricing.poe[0];
  const cable = pricing.cable.find((entry) => entry.id === selections.cableId) ?? pricing.cable[0];
  const cameraMatrix = pricing.camera[selections.resolution];
  const cameraPricing = selections.dualLight ? cameraMatrix.dualLight : cameraMatrix.standard;

  const poeQuantity = calculateQuantity(cameraCount, poe.capacity);
  const cableQuantity = calculateCableQuantity(cameraCount, cable, cableUnits, constants);

  const mrp =
    (nvr.mrp ?? 0) +
    (poe.mrp ?? 0) * poeQuantity +
    (cameraPricing.mrp ?? 0) * cameraCount +
    (cable.mrpPerUnit ?? 0) * cableQuantity;
  const sale =
    nvr.sale +
    poe.sale * poeQuantity +
    cameraPricing.sale * cameraCount +
    cable.salePerUnit * cableQuantity;

  const breakdown: string[] = [
    `${nvr.label} (${formatCurrency(nvr.sale)})`,
    `${poeQuantity} × ${poe.label} (${formatCurrency(poe.sale * poeQuantity)})`,
    `${cameraCount} × ${cameraPricing.label} (${formatCurrency(cameraPricing.sale * cameraCount)})`,
    `${cableQuantity} × ${cable.label} (${formatCurrency(cable.salePerUnit * cableQuantity)})`,
  ];

  return { mrp, sale, breakdown };
}

export interface CalculateTotalsInput {
  system: SetupSystem;
  cameraCount: number;
  cableUnits?: number;
  analogSelections: AnalogSelections;
  ipSelections: IpSelections;
  hddId: string;
  monitorIncluded: boolean;
  monitorId?: string;
  monitorStand?: 'none' | 'static' | 'movable';
  wallMountIncluded?: boolean;
  spikeGuardIncluded?: boolean;
  rackId?: string | null;
  conduitPipeId?: string | null;
  conduitMeters?: number;
  installationIncluded: boolean;
  automationEnabled?: boolean;
  pricingCatalog: Awaited<ReturnType<typeof buildPricingCatalog>>;
  accessoryPricingOverrides?: Record<string, { mrp: number; sale: number }> | null;
  activeOffer?: ActiveOffer | null;
}

export function resolveAccessoryPrice(
  id: string,
  defaultMrp: number,
  defaultSale: number,
  overrides?: Record<string, { mrp: number; sale: number }> | null
): { mrp: number; sale: number } {
  if (overrides && overrides[id]) {
    const override = overrides[id];
    return {
      mrp: typeof override.mrp === 'number' ? override.mrp : (typeof override.sale === 'number' ? override.sale : defaultMrp),
      sale: typeof override.sale === 'number' ? override.sale : defaultSale,
    };
  }
  return { mrp: defaultMrp, sale: defaultSale };
}

export function calculateTotals({
  system,
  cameraCount,
  cableUnits = 1,
  analogSelections,
  ipSelections,
  hddId,
  monitorIncluded,
  monitorId = 'monitor-19',
  monitorStand = 'none',
  wallMountIncluded = false,
  spikeGuardIncluded = false,
  rackId = null,
  conduitPipeId = null,
  conduitMeters = 0,
  installationIncluded,
  automationEnabled = false,
  pricingCatalog,
  accessoryPricingOverrides = null,
  activeOffer = null,
}: CalculateTotalsInput): Totals {
  const analogPricing = pricingCatalog.analog;
  const ipPricing = pricingCatalog.ip;
  const selectableHddOptions = pricingCatalog.hddOptions.length ? pricingCatalog.hddOptions : [{ id: 'hdd', label: 'HDD', mrp: 0, sale: 0 }];
  const monitorOption = pricingCatalog.monitorOptions?.find((entry) => entry.id === monitorId) ?? pricingCatalog.monitorOptions?.[0] ?? { id: 'mon', label: 'Monitor', mrp: 0, sale: 0 };
  const systemSummary = system === 'analog'
    ? buildAnalogSystemSummary(cameraCount, analogSelections, analogPricing, cableUnits, pricingCatalog.constants)
    : buildIpSystemSummary(cameraCount, ipSelections, ipPricing, cableUnits, pricingCatalog.constants);

  const installationLaborCharges = installationIncluded ? calculateInstallationCharges(system, cameraCount, cableUnits, monitorStand, !!rackId, pricingCatalog.constants) : { sale: 0, breakdown: [] };

  // Resolve HDD
  const hdd = selectableHddOptions.find((entry) => entry.id === hddId) ?? selectableHddOptions[0];
  const resolvedHddPrice = resolveAccessoryPrice(hdd.id, hdd.mrp ?? 0, hdd.sale, accessoryPricingOverrides);

  // Resolve Monitor
  const resolvedMonitorPrice = resolveAccessoryPrice(monitorOption.id, monitorOption.mrp ?? 0, monitorOption.sale, accessoryPricingOverrides);
  let monitorStandCost = 0;
  if (monitorStand === 'static') monitorStandCost = 399;
  if (monitorStand === 'movable') monitorStandCost = 799;

  const monitorMrp = monitorIncluded ? resolvedMonitorPrice.mrp + monitorStandCost : 0;
  const monitorSale = monitorIncluded ? resolvedMonitorPrice.sale + monitorStandCost : 0;

  // Resolve Installation (using dynamic installation labor charges)
  const installationMrp = installationLaborCharges.sale;
  const installationSale = installationLaborCharges.sale;

  // Resolve Wall Mount Addon
  const resolvedWallMountPrice = resolveAccessoryPrice(
    'wall-mount-addon',
    pricingCatalog.wallMountAddon.mrp ?? 0,
    pricingCatalog.wallMountAddon.sale,
    accessoryPricingOverrides
  );
  const wallMountMrp = (monitorIncluded && wallMountIncluded) ? resolvedWallMountPrice.mrp : 0;
  const wallMountSale = (monitorIncluded && wallMountIncluded) ? resolvedWallMountPrice.sale : 0;

  // Resolve Spike Guard
  const resolvedSpikeGuardPrice = resolveAccessoryPrice(
    'spike-guard',
    pricingCatalog.spikeGuardOption.mrp ?? 0,
    pricingCatalog.spikeGuardOption.sale,
    accessoryPricingOverrides
  );
  const spikeGuardMrp = spikeGuardIncluded ? resolvedSpikeGuardPrice.mrp : 0;
  const spikeGuardSale = spikeGuardIncluded ? resolvedSpikeGuardPrice.sale : 0;

  // Resolve Rack Cabinet
  let rackMrp = 0;
  let rackSale = 0;
  let rackLabel = 'None';
  if (rackId) {
    const rackOption = pricingCatalog.rackOptions?.find((entry) => entry.id === rackId);
    if (rackOption) {
      const resolvedRackPrice = resolveAccessoryPrice(
        rackOption.id,
        rackOption.mrp ?? 0,
        rackOption.sale,
        accessoryPricingOverrides
      );
      rackMrp = resolvedRackPrice.mrp;
      rackSale = resolvedRackPrice.sale;
      rackLabel = rackOption.label;
    }
  }

  // Resolve Conduit Pipe
  let conduitMrp = 0;
  let conduitSale = 0;
  let conduitLabel = 'None';
  if (conduitPipeId && conduitMeters > 0) {
    const conduitOption = pricingCatalog.conduitOptions?.find((entry) => entry.id === conduitPipeId);
    if (conduitOption) {
      const resolvedConduitPrice = resolveAccessoryPrice(
        conduitOption.id,
        conduitOption.mrp ?? 0,
        conduitOption.sale,
        accessoryPricingOverrides
      );
      conduitMrp = resolvedConduitPrice.mrp * conduitMeters;
      conduitSale = resolvedConduitPrice.sale * conduitMeters;
      conduitLabel = conduitOption.label;
    }
  }

  const equipmentMrp =
    systemSummary.mrp +
    resolvedHddPrice.mrp +
    monitorMrp +
    wallMountMrp +
    spikeGuardMrp +
    rackMrp +
    conduitMrp;

  const rawEquipmentSale =
    systemSummary.sale +
    resolvedHddPrice.sale +
    monitorSale +
    wallMountSale +
    spikeGuardSale +
    rackSale +
    conduitSale;
    
  const equipmentSale = roundUpToThousandMinusOne(rawEquipmentSale);

  let finalInstallationSale = installationSale;
  
  let appliedOfferResult: Totals['appliedOffer'] = null;
  
  if (activeOffer) {
    if (activeOffer.offerType === 'FREE_INSTALLATION') {
      appliedOfferResult = {
        title: activeOffer.title,
        originalSale: finalInstallationSale,
        discountedSale: 0,
        savings: finalInstallationSale,
      };
      finalInstallationSale = 0;
    }
    // We will process FREE_ACCESSORY below if it matches
  }

  const overallMrp = roundUpToThousandMinusOne(equipmentMrp + installationMrp);
  let overallSale = roundUpToThousandMinusOne(equipmentSale + finalInstallationSale);
  
  if (activeOffer && activeOffer.offerType === 'PERCENTAGE_DISCOUNT') {
    const percentage = parseFloat(activeOffer.offerValue);
    if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
      const discount = Math.round((overallSale * percentage) / 100);
      appliedOfferResult = {
        title: activeOffer.title,
        originalSale: overallSale,
        discountedSale: overallSale - discount,
        savings: discount,
      };
      overallSale = overallSale - discount;
    }
  }

  // Handle FREE_ACCESSORY
  if (activeOffer && activeOffer.offerType === 'FREE_ACCESSORY') {
    let savings = 0;
    if (activeOffer.offerValue === hddId) savings = resolvedHddPrice.sale;
    else if (activeOffer.offerValue === monitorId && monitorIncluded) savings = monitorSale;
    else if (activeOffer.offerValue === 'wall-mount-addon' && wallMountIncluded) savings = wallMountSale;
    else if (activeOffer.offerValue === 'spike-guard' && spikeGuardIncluded) savings = spikeGuardSale;
    else if (rackId && activeOffer.offerValue === rackId) savings = rackSale;

    if (savings > 0) {
      appliedOfferResult = {
        title: activeOffer.title,
        originalSale: overallSale,
        discountedSale: overallSale - savings,
        savings: savings,
      };
      overallSale = overallSale - savings;
    }
  }
  
  const validatedMrp = Math.max(overallMrp, overallSale);
  const validatedSale = Math.min(overallSale, validatedMrp);

  const discountAmount = Math.max(0, Math.round(validatedMrp - validatedSale));
  const discountPercent = validatedMrp > 0 ? (discountAmount / validatedMrp) * 100 : 0;

  return {
    system: systemSummary,
    hdd: { mrp: resolvedHddPrice.mrp, sale: resolvedHddPrice.sale, label: hdd.label },
    monitor: { mrp: monitorMrp, sale: monitorSale, included: monitorIncluded, label: monitorOption.label },
    wallMount: { mrp: wallMountMrp, sale: wallMountSale, included: monitorIncluded && wallMountIncluded },
    spikeGuard: { mrp: spikeGuardMrp, sale: spikeGuardSale, included: spikeGuardIncluded },
    rack: { mrp: rackMrp, sale: rackSale, selected: !!rackId, label: rackLabel },
    conduit: { mrp: conduitMrp, sale: conduitSale, selected: !!conduitPipeId && conduitMeters > 0, label: conduitLabel, meters: conduitMeters },
    installation: { mrp: installationMrp, sale: finalInstallationSale, included: installationIncluded },
    installationLabor: { sale: installationLaborCharges.sale, breakdown: installationLaborCharges.breakdown },
    overall: {
      mrp: validatedMrp,
      sale: validatedSale,
      discountAmount,
      discountPercent,
    },
    appliedOffer: appliedOfferResult,
  };
}
