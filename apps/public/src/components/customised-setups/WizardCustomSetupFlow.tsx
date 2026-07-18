'use client';



import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tecbunny/ui";
import { Checkbox } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Label } from "@tecbunny/ui";
import { RadioGroup, RadioGroupItem } from "@tecbunny/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import { CustomSetupBlueprintComponentSummary, CustomSetupBlueprintSummary } from "@tecbunny/core/custom-setup-service";
import { useAuth, useCart } from "@tecbunny/core/hooks";
import { cn } from "@tecbunny/core/utils";
import { ROICostEfficiencyBanner } from './ROICostEfficiencyBanner';
import { useLeadCaptureTrigger } from '@/hooks/use-lead-capture-trigger';
import { FreeInstallationOfferBanner } from "@tecbunny/ui";
import { Share2, Sparkles } from 'lucide-react';

export interface CustomSetupFlowProps {
  blueprint: CustomSetupBlueprintSummary | null;
  variant?: 'default' | 'tech';
}



import {
  SetupSystem,
  PriceEntry,
  CapacityPriceEntry,
  CameraPriceMatrix,
  CablePriceEntry,
  AnalogPricing,
  IpPricing,
  Totals,
  ActiveOffer,
  AnalogSelections,
  IpSelections,
  FALLBACK_ANALOG_PRICING,
  FALLBACK_IP_PRICING,
  FALLBACK_HDD_OPTIONS,
  FALLBACK_MONITOR_OPTION,
  FALLBACK_MONITOR_OPTIONS,
  FALLBACK_WALL_MOUNT_ADDON,
  FALLBACK_SPIKE_GUARD_OPTION,
  FALLBACK_RACK_OPTIONS,
  FALLBACK_CONDUIT_PIPE_OPTIONS,
  FALLBACK_INSTALLATION_OPTION,
  calculateTotals,
  pickCapacityOption,
  calculateQuantity,
  calculateCableQuantity,
  recommendedAnalogDvrCapacity,
  recommendedAnalogSmpsCapacity,
  recommendedIpCapacity,
  formatCurrency,
  buildAnalogSystemSummary,
  buildIpSystemSummary,
  resolveAccessoryPrice,
} from "@tecbunny/core/custom-setup-pricing";
import { buildPricingCatalog } from "@tecbunny/core/custom-setup-pricing-server";

export function CustomSetupFlow({ blueprint, variant = 'default' }: CustomSetupFlowProps) {
  const isTech = variant === 'tech';
  const [pricingCatalog, setPricingCatalog] = useState<{
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
  }>({
    analog: FALLBACK_ANALOG_PRICING,
    ip: FALLBACK_IP_PRICING,
    hddOptions: FALLBACK_HDD_OPTIONS,
    monitorOptions: FALLBACK_MONITOR_OPTIONS,
    rackOptions: FALLBACK_RACK_OPTIONS,
    conduitOptions: FALLBACK_CONDUIT_PIPE_OPTIONS,
    wallMountAddon: FALLBACK_WALL_MOUNT_ADDON,
    spikeGuardOption: FALLBACK_SPIKE_GUARD_OPTION,
    monitorOption: FALLBACK_MONITOR_OPTION,
    installationOption: FALLBACK_INSTALLATION_OPTION,
    constants: {},
  });

  useEffect(() => {
    buildPricingCatalog(blueprint).then(setPricingCatalog).catch(console.error);
  }, [blueprint]);

  const analogPricing = pricingCatalog.analog;
  const ipPricing = pricingCatalog.ip;
  const hddOptions = pricingCatalog.hddOptions;
  const monitorOption = pricingCatalog.monitorOption;
  const installationOption = pricingCatalog.installationOption;
  const selectableHddOptions = hddOptions.length ? hddOptions : FALLBACK_HDD_OPTIONS;

  // Debug: Log pricing source - disabled for production

  //   hasBlueprintData: !!blueprint,
  //   blueprintSystems: blueprint?.systems?.length || 0,
  //   usingFallback: !blueprint,
  //   timestamp: new Date().toISOString(),
  //   sampleDvrPricing: analogPricing.dvr[0] || null
  // });

  const [system, setSystem] = useState<SetupSystem>('analog');
  const [premiseType, setPremiseType] = useState<'Residential' | 'Commercial' | 'Industrial'>('Residential');
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(true);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(false);
  const [cameraCount, setCameraCount] = useState<number>(4);
  const [cameraCountInput, setCameraCountInput] = useState<string>('4');
  const [analogSelections, setAnalogSelections] = useState<AnalogSelections>({
    dvrId: analogPricing.dvr[0]?.id ?? FALLBACK_ANALOG_PRICING.dvr[0].id,
    smpsId: analogPricing.smps[0]?.id ?? FALLBACK_ANALOG_PRICING.smps[0].id,
    cableId: analogPricing.cable[0]?.id ?? FALLBACK_ANALOG_PRICING.cable[0].id,
    resolution: '2.4mp',
    dualLight: false,
  });
  const [ipSelections, setIpSelections] = useState<IpSelections>({
    nvrId: ipPricing.nvr[0]?.id ?? FALLBACK_IP_PRICING.nvr[0].id,
    poeId: ipPricing.poe[0]?.id ?? FALLBACK_IP_PRICING.poe[0].id,
    cableId: ipPricing.cable[0]?.id ?? FALLBACK_IP_PRICING.cable[0].id,
    resolution: '2mp',
    dualLight: false,
  });
  const [poeType, setPoeType] = useState<'normal' | 'giga'>('normal');
  const [hddId, setHddId] = useState<string>(
    selectableHddOptions[1]?.id ?? selectableHddOptions[0]?.id ?? FALLBACK_HDD_OPTIONS[0].id
  );
  const [monitorIncluded, setMonitorIncluded] = useState<boolean>(false);
  const [monitorId, setMonitorId] = useState<string>(FALLBACK_MONITOR_OPTIONS[0]?.id ?? 'monitor-19');
  const [monitorStand, setMonitorStand] = useState<'none' | 'static' | 'movable'>('none');
  const [wallMountIncluded, setWallMountIncluded] = useState<boolean>(false);
  const [spikeGuardIncluded, setSpikeGuardIncluded] = useState<boolean>(false);
  const [accessoryPricing, setAccessoryPricing] = useState<Record<string, { mrp: number; sale: number }> | null>(null);
  const [rackId, setRackId] = useState<string | null>(null);
  const [conduitPipeId, setConduitPipeId] = useState<string | null>(null);
  const [conduitMeters, setConduitMeters] = useState<number>(0);
  const [installationIncluded, setInstallationIncluded] = useState<boolean>(true);
  const [quoteDownloading, setQuoteDownloading] = useState<boolean>(false);
  const [isBidding, setIsBidding] = useState(false);
  const [bidForm, setBidForm] = useState({ name: '', email: '', phone: '', address: '', price: '' });
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [anonForm, setAnonForm] = useState({ name: '', phone: '', address: '', email: '' });
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  // CRO: Dynamic lead capture trigger
  useLeadCaptureTrigger(45000);

  useEffect(() => {
    const fetchActiveOffer = async () => {
      try {
        const response = await fetch('/api/custom-setup-offers');
        const { data } = await response.json();
        
        if (response.ok && data) {
          setActiveOffer({
            id: data.id,
            title: data.title,
            description: data.description,
            offerType: data.offer_type,
            offerValue: data.offer_value,
            endDate: data.end_date,
          });
        }
      } catch (err) {
        console.error('Failed to fetch custom setup offers:', err);
      }
    };
    fetchActiveOffer();
  }, []);

  useEffect(() => {
    const normalized = Number.isFinite(cameraCount) ? Math.min(32, Math.max(1, Math.round(cameraCount))) : 4;
    if (normalized !== cameraCount) {
      setCameraCount(normalized);
      setCameraCountInput(normalized.toString());
    }
  }, [cameraCount]);

  useEffect(() => {
    if (user) {
      setBidForm(prev => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.mobile || '' }));
    }
  }, [user]);

  const handleCameraRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = Math.min(32, Math.max(1, Number.parseInt(event.target.value, 10)));
    setCameraCount(normalized);
    setCameraCountInput(normalized.toString());
  };

  const cameraCountLabel = cameraCount <= 0 ? 'None' : `${cameraCount} Camera${cameraCount > 1 ? 's' : ''}`;
  const recommendationLines = useMemo(() => {
    if (cameraCount <= 0) {
      return ['> No Surveillance Selected'];
    }
    if (cameraCount <= 4) {
      return ['> 4CH CP PLUS DVR', '> 1TB Surveillance HDD', `> ${cameraCount}x 2.4MP Cameras`];
    }
    if (cameraCount <= 8) {
      return ['> 8CH CP PLUS DVR', '> 2TB Surveillance HDD', `> ${cameraCount}x 2.4MP Cameras`];
    }
    if (cameraCount <= 16) {
      return ['> 16CH CP PLUS DVR', '> 4TB Surveillance HDD', `> ${cameraCount}x 5MP Cameras`];
    }
    return ['> 32CH NVR (Enterprise)', '> 2x 6TB HDD', `> ${cameraCount}x IP Cameras`];
  }, [cameraCount]);

  const cardClassName = isTech ? 'border-border bg-card/60 text-card-foreground' : undefined;
  const cardHeaderClassName = isTech ? 'text-foreground font-semibold' : undefined;
  const cardDescriptionClassName = isTech ? 'text-muted-foreground' : undefined;
  const inputClassName = isTech ? 'bg-muted/10 border-border text-foreground placeholder:text-muted-foreground' : undefined;
  const selectTriggerClassName = isTech ? 'border-slate-700 bg-slate-950/95 text-slate-50' : undefined;
  const selectContentClassName = isTech
    ? 'z-[80] border-slate-700 bg-slate-950 text-slate-50 shadow-2xl shadow-black/70'
    : undefined;
  const selectItemClassName = isTech
    ? 'min-h-12 items-start py-2.5 text-slate-50 focus:bg-cyan-500/15 focus:text-cyan-100 data-[highlighted]:bg-cyan-500/15 data-[highlighted]:text-cyan-100'
    : undefined;
  const selectMutedClassName = isTech ? 'text-slate-300' : 'text-muted-foreground';

  // Handle camera count input changes
  const handleCameraCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCameraCountInput(value);
    
    // Only update the actual count if it's a valid number
    const numValue = Number.parseInt(value, 10);
    if (!isNaN(numValue) && value !== '') {
      const normalized = Math.min(32, Math.max(1, numValue));
      setCameraCount(normalized);
    }
  };

  // Handle when user finishes editing (blur event)
  const handleCameraCountBlur = () => {
    const numValue = Number.parseInt(cameraCountInput, 10);
    if (isNaN(numValue) || cameraCountInput === '') {
      // Reset to current valid value if input is invalid or empty
      setCameraCountInput(cameraCount.toString());
    } else {
      // Normalize the value
      const normalized = Math.min(32, Math.max(1, numValue));
      setCameraCount(normalized);
      setCameraCountInput(normalized.toString());
    }
  };

  useEffect(() => {
    setAnalogSelections((previous) => {
      const resolvedDvrId = analogPricing.dvr.some((entry: CapacityPriceEntry) => entry.id === previous.dvrId)
        ? previous.dvrId
        : analogPricing.dvr[0]?.id ?? FALLBACK_ANALOG_PRICING.dvr[0].id;
      const resolvedSmpsId = analogPricing.smps.some((entry: CapacityPriceEntry) => entry.id === previous.smpsId)
        ? previous.smpsId
        : analogPricing.smps[0]?.id ?? FALLBACK_ANALOG_PRICING.smps[0].id;
      const resolvedCableId = analogPricing.cable.some((entry: CablePriceEntry) => entry.id === previous.cableId)
        ? previous.cableId
        : analogPricing.cable[0]?.id ?? FALLBACK_ANALOG_PRICING.cable[0].id;

      if (resolvedDvrId === previous.dvrId && resolvedSmpsId === previous.smpsId && resolvedCableId === previous.cableId) {
        return previous;
      }

      return { ...previous, dvrId: resolvedDvrId, smpsId: resolvedSmpsId, cableId: resolvedCableId } satisfies AnalogSelections;
    });
  }, [analogPricing]);

  // Helper for advanced picking
  const pickAnalogDvrOption = (options: CapacityPriceEntry[], capacity: number, resolution: string) => {
    const sorted = [...options].sort((a, b) => a.capacity - b.capacity);
    const filtered = sorted.filter(entry => {
      const is5mp = entry.id.includes('5mp') || entry.label.toLowerCase().includes('5mp');
      if (resolution === '5mp') return is5mp;
      if (is5mp && capacity < 16) return false;
      return true;
    });
    return filtered.find((entry) => entry.capacity >= capacity) ?? filtered[filtered.length - 1] ?? sorted[sorted.length - 1];
  };

  const pickIpPoeOption = (options: CapacityPriceEntry[], capacity: number, poeType: string) => {
    const sorted = [...options].sort((a, b) => a.capacity - b.capacity);
    const filtered = sorted.filter(entry => {
      const isGiga = entry.id.includes('giga') || entry.label.toLowerCase().includes('giga');
      if (poeType === 'giga') return isGiga;
      return !isGiga;
    });
    return filtered.find((entry) => entry.capacity >= capacity) ?? filtered[filtered.length - 1] ?? sorted[sorted.length - 1];
  };

  useEffect(() => {
    setIpSelections((previous) => {
      const resolvedNvrId = ipPricing.nvr.some((entry: CapacityPriceEntry) => entry.id === previous.nvrId)
        ? previous.nvrId
        : ipPricing.nvr[0]?.id ?? FALLBACK_IP_PRICING.nvr[0].id;
      const resolvedPoeId = ipPricing.poe.some((entry: CapacityPriceEntry) => entry.id === previous.poeId)
        ? previous.poeId
        : ipPricing.poe[0]?.id ?? FALLBACK_IP_PRICING.poe[0].id;
      const resolvedCableId = ipPricing.cable.some((entry: CablePriceEntry) => entry.id === previous.cableId)
        ? previous.cableId
        : ipPricing.cable[0]?.id ?? FALLBACK_IP_PRICING.cable[0].id;

      if (resolvedNvrId === previous.nvrId && resolvedPoeId === previous.poeId && resolvedCableId === previous.cableId) {
        return previous;
      }

      return { ...previous, nvrId: resolvedNvrId, poeId: resolvedPoeId, cableId: resolvedCableId } satisfies IpSelections;
    });
  }, [ipPricing]);

  useEffect(() => {
    setHddId((previous) => {
      if (selectableHddOptions.some((entry: PriceEntry) => entry.id === previous)) {
        return previous;
      }
      return selectableHddOptions[0]?.id ?? FALLBACK_HDD_OPTIONS[0].id;
    });
  }, [selectableHddOptions]);

  useEffect(() => {
    fetch('/api/settings?key=custom_setup_accessory_pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.value) {
          setAccessoryPricing(data.value);
        }
      })
      .catch((err) => console.error('Failed to load accessory pricing overrides:', err));
  }, []);

  useEffect(() => {
    const recommendedDvrCapacity = recommendedAnalogDvrCapacity(cameraCount);
    const recommendedDvr = pickAnalogDvrOption(analogPricing.dvr, recommendedDvrCapacity, analogSelections.resolution);
    const currentDvr = analogPricing.dvr.find((entry: CapacityPriceEntry) => entry.id === analogSelections.dvrId);
    
    // If current DVR has less capacity than required, or if resolution mandates a change
    if (!currentDvr || currentDvr.capacity < recommendedDvrCapacity || (analogSelections.resolution === '5mp' && !(currentDvr.id.includes('5mp') || currentDvr.label.toLowerCase().includes('5mp')))) {
      setAnalogSelections((previous) => ({ ...previous, dvrId: recommendedDvr.id }));
    }

    const recommendedSmpsCapacity = recommendedAnalogSmpsCapacity(cameraCount);
    const recommendedSmps = pickCapacityOption(analogPricing.smps, recommendedSmpsCapacity);
    const currentSmps = analogPricing.smps.find((entry: CapacityPriceEntry) => entry.id === analogSelections.smpsId);
    if (!currentSmps || currentSmps.capacity < recommendedSmpsCapacity) {
      setAnalogSelections((previous) => ({ ...previous, smpsId: recommendedSmps.id }));
    }
  }, [analogPricing, analogSelections.dvrId, analogSelections.smpsId, analogSelections.resolution, cameraCount]);

  useEffect(() => {
    const recommendedNvrCapacity = recommendedIpCapacity(cameraCount);
    const recommendedNvr = pickCapacityOption(ipPricing.nvr, recommendedNvrCapacity);
    const currentNvr = ipPricing.nvr.find((entry: CapacityPriceEntry) => entry.id === ipSelections.nvrId);
    if (!currentNvr || currentNvr.capacity < recommendedNvrCapacity) {
      setIpSelections((previous) => ({ ...previous, nvrId: recommendedNvr.id }));
    }

    const recommendedPoeCapacity = recommendedIpCapacity(cameraCount);
    const recommendedPoe = pickIpPoeOption(ipPricing.poe, recommendedPoeCapacity, poeType);
    const currentPoe = ipPricing.poe.find((entry: CapacityPriceEntry) => entry.id === ipSelections.poeId);
    if (!currentPoe || currentPoe.capacity < recommendedPoeCapacity) {
      setIpSelections((previous) => ({ ...previous, poeId: recommendedPoe.id }));
    }
  }, [cameraCount, ipPricing, ipSelections.nvrId, ipSelections.poeId, poeType]);

  const totals = useMemo(() => {
    return calculateTotals({
      system,
      cameraCount,
      analogSelections,
      ipSelections,
      hddId,
      monitorIncluded,
      monitorId,
      monitorStand,
      wallMountIncluded,
      spikeGuardIncluded,
      rackId,
      conduitPipeId,
      conduitMeters,
      installationIncluded,
      automationEnabled: false,
      pricingCatalog,
      accessoryPricingOverrides: accessoryPricing,
      activeOffer,
    });
  }, [
    system,
    cameraCount,
    analogSelections,
    ipSelections,
    hddId,
    monitorIncluded,
    monitorId,
    monitorStand,
    wallMountIncluded,
    spikeGuardIncluded,
    rackId,
    conduitPipeId,
    conduitMeters,
    installationIncluded,
    pricingCatalog,
    accessoryPricing,
    activeOffer,
  ]);

  const inlineQuoteSummary = useMemo(() => {
    const systemLabel = system === 'analog' ? 'Analog (DVR)' : 'IP (NVR)';
    const hddLabel = pricingCatalog.hddOptions.find(o => o.id === hddId)?.label || 'No HDD';
    const extrasLabel = (monitorIncluded || installationIncluded) ? ' + Extras' : '';
    
    return `${systemLabel} | ${cameraCount} cameras | HDD: ${hddLabel}${extrasLabel} | Sale total ${formatCurrency(totals.overall.sale)}`;
  }, [cameraCount, hddId, installationIncluded, monitorIncluded, selectableHddOptions, system, totals.overall.sale]);

  const handleInlineQuoteDownload = async () => {
    setIsDownloadModalOpen(true);
  };


  const handleInlineQuoteDownloadAnon = async () => {
    if (!anonForm.name || !anonForm.phone || !anonForm.address) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Name, mobile number, and address are required.' });
      return;
    }

    setQuoteDownloading(true);
    try {
      const systemLabel = system === 'analog' ? 'Analog DVR' : 'IP NVR';
      const hddLabel = selectableHddOptions.find((entry) => entry.id === hddId)?.label ?? 'Surveillance HDD';
      const items = [
        {
          description: `${systemLabel} system (${cameraCount} cameras)`,
          mrp: totals.system.mrp,
          sale: totals.system.sale,
        },
        {
          description: hddLabel,
          mrp: totals.hdd.mrp,
          sale: totals.hdd.sale,
        },
      ];

      if (totals.monitor.included) {
        items.push({
          description: `Monitor (${totals.monitor.label})`,
          mrp: totals.monitor.mrp,
          sale: totals.monitor.sale,
        });
      }

      if (totals.wallMount.included) {
        items.push({
          description: 'Wall Mount Installation Kit',
          mrp: totals.wallMount.mrp,
          sale: totals.wallMount.sale,
        });
      }

      if (totals.spikeGuard.included) {
        items.push({
          description: 'Spike Guard / Power Surge Protector',
          mrp: totals.spikeGuard.mrp,
          sale: totals.spikeGuard.sale,
        });
      }

      if (totals.rack.selected) {
        items.push({
          description: totals.rack.label,
          mrp: totals.rack.mrp,
          sale: totals.rack.sale,
        });
      }

      if (totals.conduit.selected) {
        items.push({
          description: `${totals.conduit.label} × ${totals.conduit.meters}m`,
          mrp: totals.conduit.mrp,
          sale: totals.conduit.sale,
        });
      }

      if (totals.installation.included) {
        items.push({
          description: `Installation (${installationOption.label})`,
          mrp: totals.installation.mrp,
          sale: totals.installation.sale,
        });
      }

      if (totals.installationLabor.sale > 0) {
        items.push({
          description: `Installation Labor (₹${totals.installationLabor.sale})`,
          mrp: totals.installationLabor.sale,
          sale: totals.installationLabor.sale,
        });
      }



      const customSetupConfig = {
        system,
        cameraCount,
        analogSelections,
        ipSelections,
        hddId,
        monitorIncluded,
        monitorId,
        wallMountIncluded,
        spikeGuardIncluded,
        rackId,
        conduitPipeId,
        conduitMeters,
        installationIncluded,
        automationEnabled,
      };

      const finalSelections = {
        type: 'customised_setup',
        systemType: systemLabel,
        cameraCount,
        items,
        totals: totals.overall,
        breakdown: totals.system.breakdown,
      };

      const quoteNumber = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(10000 + Math.random() * 90000))}`;

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: inlineQuoteSummary,
          gstIncluded: true,
          selections: finalSelections,
          customSetupConfig,
          customerName: anonForm.name,
          customerPhone: anonForm.phone,
          customerAddress: anonForm.address,
          customerEmail: anonForm.email || 'anonymous@tecbunny.com',
          quote_number: quoteNumber
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const message = err?.details || err?.error || 'Failed to generate quote';
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${quoteNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Quote ready', description: `Downloaded quote PDF successfully. Quote Number: ${quoteNumber}` });
      setIsDownloadModalOpen(false);
      setAnonForm({ name: '', phone: '', address: '', email: '' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Quote failed', description: error?.message || 'Unable to generate quote.' });
    } finally {
      setQuoteDownloading(false);
    }
  };

  const handleDownloadBidQuote = async () => {
    if (!bidForm.name || !bidForm.phone || !bidForm.price || !bidForm.address) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Name, phone, address, and bid price are required.' });
      return;
    }

    const originalPrice = totals?.overall?.sale || 0;
    const bidPrice = Number(bidForm.price);
    const minPrice = originalPrice * 0.7;

    if (bidPrice < minPrice) {
      toast({ 
        variant: 'destructive', 
        title: 'Bid too low', 
        description: `Minimum bid price is ₹${Math.round(minPrice).toLocaleString()} (70% of quoted price). Your bid: ₹${Math.round(bidPrice).toLocaleString()}` 
      });
      return;
    }

    setQuoteDownloading(true);
    try {
      const systemLabel = system === 'analog' ? 'Analog DVR' : 'IP NVR';
      const hddLabel = selectableHddOptions.find((entry: PriceEntry) => entry.id === hddId)?.label ?? 'Surveillance HDD';
      
      const biddedTotals = {
        ...totals.overall,
        sale: bidPrice,
        discountAmount: Math.max(0, totals.overall.mrp - bidPrice),
        discountPercent: totals.overall.mrp > 0 ? (Math.max(0, totals.overall.mrp - bidPrice) / totals.overall.mrp) * 100 : 0
      };

      const items = [
        {
          description: `${systemLabel} system (${cameraCount} cameras)`,
          mrp: totals.system.mrp,
          sale: totals.system.sale,
        },
        {
          description: hddLabel,
          mrp: totals.hdd.mrp,
          sale: totals.hdd.sale,
        },
      ];

      if (totals.monitor.included) {
        items.push({
          description: `Monitor (${totals.monitor.label})`,
          mrp: totals.monitor.mrp,
          sale: totals.monitor.sale,
        });
      }

      if (totals.wallMount.included) {
        items.push({
          description: 'Wall Mount Installation Kit',
          mrp: totals.wallMount.mrp,
          sale: totals.wallMount.sale,
        });
      }

      if (totals.spikeGuard.included) {
        items.push({
          description: 'Spike Guard / Power Surge Protector',
          mrp: totals.spikeGuard.mrp,
          sale: totals.spikeGuard.sale,
        });
      }

      if (totals.rack.selected) {
        items.push({
          description: totals.rack.label,
          mrp: totals.rack.mrp,
          sale: totals.rack.sale,
        });
      }

      if (totals.conduit.selected) {
        items.push({
          description: `${totals.conduit.label} × ${totals.conduit.meters}m`,
          mrp: totals.conduit.mrp,
          sale: totals.conduit.sale,
        });
      }

      if (totals.installation.included) {
        items.push({
          description: `Installation (${installationOption.label})`,
          mrp: totals.installation.mrp,
          sale: totals.installation.sale,
        });
      }

      if (totals.installationLabor.sale > 0) {
        items.push({
          description: `Installation Labor (₹${totals.installationLabor.sale})`,
          mrp: totals.installationLabor.sale,
          sale: totals.installationLabor.sale,
        });
      }



      const customSetupConfig = {
        system,
        cameraCount,
        analogSelections,
        ipSelections,
        hddId,
        monitorIncluded,
        monitorId,
        wallMountIncluded,
        spikeGuardIncluded,
        rackId,
        conduitPipeId,
        conduitMeters,
        installationIncluded,
        automationEnabled,
      };

      const finalSelections = {
        type: 'customised_setup',
        systemType: systemLabel,
        cameraCount,
        items,
        totals: biddedTotals,
        breakdown: totals.system.breakdown,
      };

      const quoteNumber = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(10000 + Math.random() * 90000))}`;

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: inlineQuoteSummary,
          gstIncluded: true,
          selections: finalSelections,
          customSetupConfig,
          customerName: bidForm.name,
          customerPhone: bidForm.phone,
          customerAddress: bidForm.address,
          customerEmail: bidForm.email || 'anonymous@tecbunny.com',
          quote_number: quoteNumber,
          biddedPrice: bidPrice,
          status: 'bidded'
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || 'Failed to submit bid and generate quote');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-bid-${quoteNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Bid Quote ready', description: `Generated and downloaded your negotiated quote PDF. Quote Number: ${quoteNumber}` });
      setIsBidding(false);
      setBidForm({ name: '', email: '', phone: '', address: '', price: '' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Download failed', description: error?.message || 'Unable to download bid quote.' });
    } finally {
      setQuoteDownloading(false);
    }
  };

  const handleBookNow = () => {
    if (quoteDownloading) return;
    const systemLabel = system === 'analog' ? 'Analog DVR' : 'IP NVR';
    
    addToCart({
      id: `service-cctv-${Math.random().toString(36).substring(2,9)}`,
      name: `Custom CCTV Setup - ${cameraCount} Cameras (${systemLabel})`,
      price: totals.overall.sale,
      mrp: totals.overall.mrp,
      image: 'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/TecBunny%20Solution/cctv-bundle.jpg',
      product_type: 'service',
      description: inlineQuoteSummary
    }, 1);
    
    router.push('/checkout');
  };

  const handleBookSiteInspection = () => {
    if (quoteDownloading) return;
    const systemLabel = system === 'analog' ? 'Analog DVR' : 'IP NVR';
    
    addToCart({
      id: `service-cctv-inspection-${Math.random().toString(36).substring(2,9)}`,
      name: `Site Inspection: Custom CCTV Setup (${cameraCount} Cameras)`,
      price: 999,
      mrp: 999,
      image: 'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/TecBunny%20Solution/cctv-bundle.jpg',
      product_type: 'service',
      description: `Site Inspection before confirming order. Rs. 999/- will be adjusted on the final bill if the order is confirmed. If canceled (e.g., due to pricing mismatch), this amount is treated as the visiting charge and will not be refunded. Please ensure you have finalized the quote before booking.`
    }, 1);
    
    router.push('/checkout');
  };

  const handleSubmitBid = async (): Promise<void> => {
    if (!bidForm.name || !bidForm.phone || !bidForm.price) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Name, phone, and bid price are required.' });
      return;
    }

    const originalPrice = totals?.overall?.sale || 0;
    const bidPrice = Number(bidForm.price);
    const minPrice = originalPrice * 0.7; // 70% of original price

    if (bidPrice < minPrice) {
      toast({ 
        variant: 'destructive', 
        title: 'Bid too low', 
        description: `Minimum bid price is ₹${Math.round(minPrice).toLocaleString()} (70% of quoted price). Your bid: ₹${Math.round(bidPrice).toLocaleString()}` 
      });
      return;
    }

    try {
      const customSetupConfig = {
        system,
        cameraCount,
        analogSelections,
        ipSelections,
        hddId,
        monitorIncluded,
        installationIncluded,
        automationEnabled,
        totals,
      };

      const res = await fetch('/api/quotes/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bidForm,
          biddedPrice: bidPrice,
          summary: inlineQuoteSummary,
          customSetupConfig
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      
      const data = await res.json();
      const quoteId = data.quoteId;
      
      toast({ 
        title: 'Bid Submitted Successfully!', 
        description: 'Check your quote status to see our counter-offer.' 
      });
      
      setIsBidding(false);
      setBidForm({ name: '', email: '', phone: '', address: '', price: '' });
      
      // Redirect to quote view page
      setTimeout(() => {
        router.push(`/quotes/${quoteId}`);
      }, 1500);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit bid.' });
    }
  };



    // --- WIZARD UI IMPLEMENTATION START ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isEasyMode, setIsEasyMode] = useState(true);
  const [squareFootage, setSquareFootage] = useState<number>(1000);

  useEffect(() => {
    if (isEasyMode) {
      // Map square footage to camera count: base 2 cameras for 500sqft, +1 per 400sqft
      const recommendedCameras = Math.max(2, Math.ceil(squareFootage / 400));
      setCameraCount(recommendedCameras);
      setCameraCountInput(recommendedCameras.toString());
    }
  }, [squareFootage, isEasyMode]);

  const handleNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handlePrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto">
      {/* LEFT COLUMN: GUIDED WIZARD */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Configurator</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="easy-mode" className="text-sm font-medium">Easy Mode</Label>
            {/* simple toggle if switch not ready */}
            <input type="checkbox" id="easy-mode" checked={isEasyMode} onChange={(e) => setIsEasyMode(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-primary" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: ((currentStep / 3) * 100) + '%' }}></div>
        </div>

        {isEasyMode ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Step 1: Property Type</h3>
                <RadioGroup value={premiseType} onValueChange={(v: any) => setPremiseType(v)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['Residential', 'Commercial', 'Industrial'].map(type => (
                    <div key={type} className="flex items-center space-x-2 border border-border p-4 rounded-lg hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="flex-1 cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleNextStep}>Next Step</Button>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Step 2: Area Requirements</h3>
                <div className="space-y-2">
                  <Label>Approximate Square Footage (sq ft)</Label>
                  <Input type="number" value={squareFootage} onChange={e => setSquareFootage(Number(e.target.value))} placeholder="e.g. 1000" />
                  <p className="text-sm text-muted-foreground">Based on {squareFootage} sq ft, we recommend {cameraCount} cameras.</p>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep}>Back</Button>
                  <Button onClick={handleNextStep}>Next Step</Button>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Step 3: Budget Range & Quality</h3>
                <RadioGroup value={system} onValueChange={(v: any) => setSystem(v)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2 border border-border p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="analog" id="analog" />
                      <Label htmlFor="analog" className="font-bold">Standard Quality (Analog)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">Cost-effective, standard HD clarity. Best for basic surveillance.</p>
                  </div>
                  <div className="flex flex-col space-y-2 border border-border p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ip" id="ip" />
                      <Label htmlFor="ip" className="font-bold">Premium Quality (IP)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">Superior clarity, digital zoom, future-proof. Best for critical security.</p>
                  </div>
                </RadioGroup>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep}>Back</Button>
                  <Button onClick={() => handleInlineQuoteDownloadAnon()} disabled={quoteDownloading}>
                    {quoteDownloading ? 'Generating...' : 'Get Instant Quote'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <p className="text-sm text-muted-foreground">Advanced configuration is currently hidden. Switch back to Easy Mode.</p>
             <div className="flex justify-between pt-4">
               <Button onClick={() => setIsEasyMode(true)}>Back to Easy Mode</Button>
             </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: LIVE PREVIEW */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <Card className="border-border shadow-lg">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <CardTitle>Live Configurator</CardTitle>
              <CardDescription>Your custom setup preview</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Premise Type:</span>
                  <span className="font-medium">{premiseType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">System Technology:</span>
                  <span className="font-medium">{system === 'analog' ? 'Standard (Analog DVR)' : 'Premium (IP NVR)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Camera Count:</span>
                  <span className="font-medium">{cameraCount}</span>
                </div>
                {isEasyMode && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Coverage Area:</span>
                    <span className="font-medium">~{squareFootage} sq ft</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Estimated Total:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(totals?.overall?.sale || 0)}</span>
                </div>
                {totals?.overall?.mrp > totals?.overall?.sale && (
                  <div className="flex justify-end">
                    <span className="text-sm text-muted-foreground line-through">MRP: {formatCurrency(totals?.overall?.mrp)}</span>
                    <span className="text-sm text-green-500 ml-2">
                      Save {Math.round(((totals.overall.mrp - totals.overall.sale) / totals.overall.mrp) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
