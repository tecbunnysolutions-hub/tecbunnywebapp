'use server';

import type { CustomSetupBlueprintSummary } from "@tecbunny/core/custom-setup-service";
import { getCustomSetupConstantsFromDb, getCustomSetupInventoryFromDb } from './config-db';
import {
  type AnalogPricing,
  type IpPricing,
  type PriceEntry,
  FALLBACK_ANALOG_PRICING,
  FALLBACK_IP_PRICING,
  FALLBACK_HDD_OPTIONS,
  FALLBACK_MONITOR_OPTIONS,
  FALLBACK_RACK_OPTIONS,
  FALLBACK_CONDUIT_PIPE_OPTIONS,
  FALLBACK_INSTALLATION_OPTION,
  FALLBACK_WALL_MOUNT_ADDON,
  FALLBACK_SPIKE_GUARD_OPTION,
  buildCapacityEntries,
  buildCableEntries,
  buildCameraMatrix,
  buildHddOptionsFromComponents,
  pickFirstOption,
  findComponentBySlug,
} from './custom-setup-pricing';

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
  const withFallback = <T>(items: unknown[], fallback: T[]): T[] => items.length > 0 ? items as T[] : fallback;
  const getAccessory = (id: string, fallback: PriceEntry) => getItems('accessory').find(i => i.id === id) || fallback;
  const getAnalogCamera = (candidates: string[], fallback: PriceEntry) => {
    const items = getItems('analog_camera');
    for (const cand of candidates) {
      const match = items.find(i => i.id === cand || i.label.toLowerCase().includes(cand.toLowerCase()));
      if (match) return match;
    }
    return items[0] || fallback;
  };
  const getIpCamera = (candidates: string[], fallback: PriceEntry) => {
    const items = getItems('ip_camera');
    for (const cand of candidates) {
      const match = items.find(i => i.id === cand || i.label.toLowerCase().includes(cand.toLowerCase()));
      if (match) return match;
    }
    return items[0] || fallback;
  };

  const analogDvr = getItems('analog_dvr').filter((entry) => [4, 8, 16].includes(entry.capacity));
  const analogSmps = getItems('analog_smps').filter((entry) => [4, 8, 16].includes(entry.capacity));
  const ipNvr = getItems('ip_nvr').filter((entry) => [4, 8, 16, 32].includes(entry.capacity));
  const ipPoe = getItems('ip_poe').filter((entry) => [4, 8, 16, 24, 32].includes(entry.capacity));
  
  return {
    analog: {
      dvr: withFallback(analogDvr, FALLBACK_ANALOG_PRICING.dvr),
      smps: withFallback(analogSmps, FALLBACK_ANALOG_PRICING.smps),
      camera: {
        '2.4mp': {
          standard: getAnalogCamera(['opt-cam-2mp-dome', '2.4', '2mp', 'dome'], FALLBACK_ANALOG_PRICING.camera['2.4mp'].standard),
          dualLight: getAnalogCamera(['opt-cam-2mp-bullet', '2.4', 'dual', 'bullet'], FALLBACK_ANALOG_PRICING.camera['2.4mp'].dualLight),
        },
        '5mp': {
          standard: getAnalogCamera(['opt-cam-5mp-bullet', '5mp'], FALLBACK_ANALOG_PRICING.camera['5mp'].standard),
          dualLight: getAnalogCamera(['opt-cam-5mp-bullet', '5mp', 'dual'], FALLBACK_ANALOG_PRICING.camera['5mp'].dualLight),
        }
      },
      cable: withFallback(getItems('analog_cable'), FALLBACK_ANALOG_PRICING.cable)
    } as AnalogPricing,
    ip: {
      nvr: withFallback(ipNvr, FALLBACK_IP_PRICING.nvr),
      poe: withFallback(ipPoe, FALLBACK_IP_PRICING.poe),
      camera: {
        '2mp': {
          standard: getIpCamera(['opt-cam-ip-4mp-dome', '4mp', '2mp', 'dome'], FALLBACK_IP_PRICING.camera['2mp'].standard),
          dualLight: getIpCamera(['opt-cam-ip-4mp-bullet', '4mp', 'bullet'], FALLBACK_IP_PRICING.camera['2mp'].dualLight),
        },
        '5mp': {
          standard: getIpCamera(['opt-cam-ip-5mp-color', '5mp'], FALLBACK_IP_PRICING.camera['5mp'].standard),
          dualLight: getIpCamera(['opt-cam-ip-5mp-color', '5mp', 'color'], FALLBACK_IP_PRICING.camera['5mp'].dualLight),
        }
      },
      cable: withFallback(getItems('ip_cable'), FALLBACK_IP_PRICING.cable)
    } as IpPricing,
    hddOptions: withFallback(getItems('hdd').filter(i => !/new|refurbished/i.test(i.label)), FALLBACK_HDD_OPTIONS),
    monitorOptions: withFallback(getItems('monitor'), FALLBACK_MONITOR_OPTIONS),
    rackOptions: withFallback(getItems('rack'), FALLBACK_RACK_OPTIONS),
    conduitOptions: withFallback(getItems('conduit'), FALLBACK_CONDUIT_PIPE_OPTIONS),
    installationOption: getItems('installation')[0] || getAccessory('installation', FALLBACK_INSTALLATION_OPTION),
    wallMountAddon: getAccessory('wall-mount-addon', FALLBACK_WALL_MOUNT_ADDON),
    spikeGuardOption: getAccessory('spike-guard', FALLBACK_SPIKE_GUARD_OPTION)
  };
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
