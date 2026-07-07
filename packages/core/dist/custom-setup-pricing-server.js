'use server';
import { getCustomSetupConstantsFromDb, getCustomSetupInventoryFromDb } from './config-db';
import { buildCapacityEntries, buildCableEntries, buildCameraMatrix, buildHddOptionsFromComponents, pickFirstOption, findComponentBySlug, } from './custom-setup-pricing';
async function getFallbackPricing() {
    const inventory = await getCustomSetupInventoryFromDb();
    const getItems = (category) => inventory.filter(i => i.category === category).map(i => ({
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
    const getAccessory = (id) => getItems('accessory').find(i => i.id === id) || { id, label: 'Unknown', mrp: 0, sale: 0 };
    const getAnalogCamera = (id) => getItems('analog_camera').find(i => i.id === id) || { id, label: 'Unknown', mrp: 0, sale: 0 };
    const getIpCamera = (id) => getItems('ip_camera').find(i => i.id === id) || { id, label: 'Unknown', mrp: 0, sale: 0 };
    return {
        analog: {
            dvr: getItems('analog_dvr').filter((entry) => [4, 8, 16].includes(entry.capacity) && entry.label.toLowerCase().includes('analog')),
            smps: getItems('analog_smps').filter((entry) => [4, 8, 16].includes(entry.capacity)),
            camera: {
                '2.4mp': { standard: getAnalogCamera('analog-2.4-standard'), dualLight: getAnalogCamera('analog-2.4-dual') },
                '5mp': { standard: getAnalogCamera('analog-5-standard'), dualLight: getAnalogCamera('analog-5-dual') }
            },
            cable: getItems('analog_cable')
        },
        ip: {
            nvr: getItems('ip_nvr').filter((entry) => [8, 16, 32].includes(entry.capacity)),
            poe: getItems('ip_poe').filter((entry) => [4, 8, 16, 32].includes(entry.capacity)),
            camera: {
                '2mp': { standard: getIpCamera('ip-2-standard'), dualLight: getIpCamera('ip-2-dual') },
                '5mp': { standard: getIpCamera('ip-4-standard'), dualLight: getIpCamera('ip-4-dual') }
            },
            cable: getItems('ip_cable')
        },
        hddOptions: getItems('hdd').filter(i => !/new|refurbished/i.test(i.label)),
        monitorOptions: getItems('monitor'),
        rackOptions: getItems('rack'),
        conduitOptions: getItems('conduit'),
        installationOption: getItems('installation')[0] || getAccessory('installation'),
        wallMountAddon: getAccessory('wall-mount-addon'),
        spikeGuardOption: getAccessory('spike-guard')
    };
}
export async function buildPricingCatalog(blueprint) {
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
    const analogPricing = {
        dvr: buildCapacityEntries(findComponentBySlug(analogSystem, ['dvr-recorder', 'analog-dvr']), fallbacks.analog.dvr),
        smps: buildCapacityEntries(findComponentBySlug(analogSystem, ['smps-power', 'analog-smps']), fallbacks.analog.smps),
        camera: {
            '2.4mp': buildCameraMatrix(findComponentBySlug(analogSystem, ['analog-camera']), '2.4mp', fallbacks.analog.camera['2.4mp']),
            '5mp': buildCameraMatrix(findComponentBySlug(analogSystem, ['analog-camera']), '5mp', fallbacks.analog.camera['5mp']),
        },
        cable: buildCableEntries(findComponentBySlug(analogSystem, ['coaxial-cable']), fallbacks.analog.cable),
    };
    const ipPricing = {
        nvr: buildCapacityEntries(findComponentBySlug(ipSystem, ['nvr-recorder', 'ip-nvr']), fallbacks.ip.nvr),
        poe: buildCapacityEntries(findComponentBySlug(ipSystem, ['poe-switch', 'ip-poe']), fallbacks.ip.poe),
        camera: {
            '2mp': buildCameraMatrix(findComponentBySlug(ipSystem, ['ip-camera']), '2mp', fallbacks.ip.camera['2mp']),
            '5mp': buildCameraMatrix(findComponentBySlug(ipSystem, ['ip-camera']), '5mp', fallbacks.ip.camera['5mp']),
        },
        cable: buildCableEntries(findComponentBySlug(ipSystem, ['cat6-cable']), fallbacks.ip.cable),
    };
    const hddOptions = buildHddOptionsFromComponents([
        analogSystem?.components.find((component) => component.slug === 'dvr-storage'),
        ipSystem?.components.find((component) => component.slug === 'nvr-storage'),
    ], fallbacks.hddOptions);
    const monitorComponent = analogSystem?.components.find((component) => component.slug.includes('monitor')) ??
        ipSystem?.components.find((component) => component.slug.includes('monitor'));
    const installationComponent = analogSystem?.components.find((component) => component.slug === 'installation-service') ??
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
