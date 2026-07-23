'use client';

import { useCallback, useEffect, useMemo, useState, useDeferredValue } from 'react';
import { RefreshCw, Save, Settings2, Package, Tag, ShieldCheck, DollarSign } from 'lucide-react';

import { Badge } from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Separator } from "@tecbunny/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tecbunny/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import { DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG } from "@tecbunny/core/custom-setup.constants";
import {
  type CustomSetupBlueprintSummary,
  type CustomSetupBlueprintSystemSummary,
  type JsonRecord,
} from "@tecbunny/core/custom-setup-service";
import { logger } from "@tecbunny/core/logger";

interface TemplateListItem {
  id: string;
  slug: string;
  name: string;
  category?: string | null;
  is_active?: boolean | null;
  base_price?: number | null;
  currency?: string | null;
}

interface AdminTemplateResponse {
  template: {
    id: string;
    slug: string;
    name: string;
    currency?: string | null;
    systems?: Array<CustomSetupBlueprintSystemSummary & {
      components?: Array<CustomSetupBlueprintSystemSummary['components'][number] & {
        options?: CustomSetupBlueprintSystemSummary['components'][number]['options'];
      }>;
    }>;
  };
  summary: CustomSetupBlueprintSummary | null;
}

type PricingDraftState = Record<string, string>;

type PendingOptionChange = {
  unitPrice?: number | null;
  metadata?: JsonRecord | null;
};

type PendingOptionState = Record<string, PendingOptionChange>;

type OptionUpdateRequest = {
  target: 'option';
  id: string;
  unitPrice?: number | null;
  metadata?: JsonRecord | null;
};

type SelectionDraft = {
  componentDefaultQuantities: Record<string, string>;
  systemBaseFees: Record<string, string>;
};

const SALE_PRICE_KEY = 'sale_price';

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function extractSalePrice(metadata: JsonRecord | null | undefined): number | null {
  if (!metadata) return null;
  const rawSale = metadata[SALE_PRICE_KEY];
  if (typeof rawSale === 'number' && Number.isFinite(rawSale)) return roundToTwoDecimals(rawSale);
  if (typeof rawSale === 'string' && rawSale.trim().length > 0) {
    const parsed = Number.parseFloat(rawSale);
    if (Number.isFinite(parsed)) return roundToTwoDecimals(parsed);
  }
  return null;
}

function cloneMetadata(metadata: JsonRecord | null | undefined): JsonRecord | null {
  return metadata ? { ...metadata } : null;
}

function normalizeMetadata(metadata: JsonRecord | null | undefined): JsonRecord | null {
  if (!metadata) return null;
  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined);
  return entries.length ? (Object.fromEntries(entries) as JsonRecord) : null;
}

function metadataEquals(a: JsonRecord | null | undefined, b: JsonRecord | null | undefined): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function parseNumericMetadata(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatCurrencyDisplay(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function CustomSetupPriceManager() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG);
  const [activeSystemSlug, setActiveSystemSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [blueprint, setBlueprint] = useState<CustomSetupBlueprintSummary | null>(null);
  const [pricingDrafts, setPricingDrafts] = useState<PricingDraftState>({});
  const [pendingOptionState, setPendingOptionState] = useState<PendingOptionState>({});
  const [filterQuery, setFilterQuery] = useState<string>('');
  const deferredFilterQuery = useDeferredValue(filterQuery);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/custom-setups');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const body = await res.json();
      if (body.success && Array.isArray(body.data)) {
        setTemplates(body.data);
      }
    } catch (err) {
      logger.error('superadmin.custom_setup_templates_fetch_failed', { error: String(err) });
    }
  }, []);

  const fetchTemplateDetails = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/custom-setups?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const body: { success?: boolean; data?: AdminTemplateResponse } = await res.json();
      if (body.success && body.data?.summary) {
        const fetchedSummary = body.data.summary;
        setBlueprint(fetchedSummary);
        if (fetchedSummary.systems?.length) {
          const defaultSys = fetchedSummary.systems.find((s) => s.isDefault) ?? fetchedSummary.systems[0];
          setActiveSystemSlug(defaultSys.slug);
        }
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to load custom setup template',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (selectedSlug) {
      fetchTemplateDetails(selectedSlug);
    }
  }, [selectedSlug, fetchTemplateDetails]);

  const currentSystem = useMemo(() => {
    if (!blueprint || !activeSystemSlug) return null;
    return blueprint.systems.find((s) => s.slug === activeSystemSlug) ?? blueprint.systems[0] ?? null;
  }, [blueprint, activeSystemSlug]);

  const handlePriceChange = (optionId: string, field: 'mrp' | 'sale', rawValue: string) => {
    const key = `${optionId}_${field}`;
    setPricingDrafts((prev) => ({ ...prev, [key]: rawValue }));

    const numVal = Number.parseFloat(rawValue);
    const validNum = Number.isFinite(numVal) && numVal >= 0 ? numVal : null;

    setPendingOptionState((prev) => {
      const existing = prev[optionId] ?? {};
      if (field === 'mrp') {
        return {
          ...prev,
          [optionId]: {
            ...existing,
            unitPrice: validNum,
          },
        };
      } else {
        const meta = existing.metadata ? { ...existing.metadata } : {};
        if (validNum !== null) {
          meta[SALE_PRICE_KEY] = validNum;
        } else {
          delete meta[SALE_PRICE_KEY];
        }
        return {
          ...prev,
          [optionId]: {
            ...existing,
            metadata: normalizeMetadata(meta),
          },
        };
      }
    });
  };

  const handleSaveChanges = async () => {
    if (!Object.keys(pendingOptionState).length) {
      toast({ title: 'No changes to save', description: 'Modify pricing fields before saving.' });
      return;
    }

    setSaving(true);
    try {
      const updates: OptionUpdateRequest[] = Object.entries(pendingOptionState).map(([id, change]) => ({
        target: 'option',
        id,
        ...(change.unitPrice !== undefined ? { unitPrice: change.unitPrice } : {}),
        ...(change.metadata !== undefined ? { metadata: change.metadata } : {}),
      }));

      const res = await fetch('/api/admin/custom-setups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const body = await res.json();

      if (body.success) {
        toast({
          title: 'Pricing updated successfully',
          description: `Updated ${body.applied?.length ?? 0} price entries.`,
        });
        setPendingOptionState({});
        setPricingDrafts({});
        fetchTemplateDetails(selectedSlug);
      } else {
        throw new Error(body.error || 'Update failed');
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Customised Setup Price Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure base prices, component MRP/Sale rates, accessories, and system packages for customized setup calculations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTemplateDetails(selectedSlug)}
            disabled={loading}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={saving || !Object.keys(pendingOptionState).length}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? 'Saving...' : `Save Overrides (${Object.keys(pendingOptionState).length})`}
          </Button>
        </div>
      </div>

      {/* Systems Tab Bar */}
      {blueprint?.systems && blueprint.systems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          {blueprint.systems.map((sys) => {
            const isActive = sys.slug === activeSystemSlug;
            return (
              <button
                key={sys.id}
                onClick={() => setActiveSystemSlug(sys.slug)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {sys.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Filter */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Filter components or options..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="max-w-md bg-zinc-950 border-zinc-800 text-white text-xs placeholder:text-zinc-500"
        />
      </div>

      {/* Components & Options List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-zinc-500 animate-pulse">
          Loading customized setup catalog & blueprint...
        </div>
      ) : !currentSystem ? (
        <div className="py-16 text-center text-sm text-zinc-400">
          No system blueprint available. Please select a template.
        </div>
      ) : (
        <div className="space-y-6">
          {currentSystem.components
            .filter((comp) => {
              if (!deferredFilterQuery.trim()) return true;
              const query = deferredFilterQuery.toLowerCase();
              return (
                comp.name.toLowerCase().includes(query) ||
                comp.options.some((opt) => opt.label.toLowerCase().includes(query))
              );
            })
            .map((comp) => (
              <Card key={comp.id} className="bg-zinc-950/60 border-zinc-800 shadow-sm">
                <CardHeader className="py-3.5 px-4 bg-zinc-900/40 border-b border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <CardTitle className="text-sm font-semibold text-white">{comp.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                        {comp.slug}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {comp.options.length} {comp.options.length === 1 ? 'option' : 'options'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-zinc-950/80">
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 text-xs font-semibold">Option Name</TableHead>
                        <TableHead className="text-zinc-400 text-xs font-semibold text-right w-36">MRP Price (₹)</TableHead>
                        <TableHead className="text-zinc-400 text-xs font-semibold text-right w-36">Sale Price (₹)</TableHead>
                        <TableHead className="text-zinc-400 text-xs font-semibold text-center w-28">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-800/60">
                      {comp.options.map((option) => {
                        const mrpKey = `${option.id}_mrp`;
                        const saleKey = `${option.id}_sale`;

                        const currentMrp = option.unitPrice ?? 0;
                        const currentSale = extractSalePrice(option.metadata) ?? currentMrp;

                        const mrpInputValue = pricingDrafts[mrpKey] ?? String(currentMrp);
                        const saleInputValue = pricingDrafts[saleKey] ?? String(currentSale);

                        const isModified = pendingOptionState[option.id] !== undefined;

                        return (
                          <TableRow key={option.id} className="hover:bg-zinc-900/30 transition-colors">
                            <TableCell className="py-2.5 px-4">
                              <div className="font-medium text-xs text-zinc-200">{option.label}</div>
                              <div className="text-[10px] font-mono text-zinc-500">{option.id}</div>
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-right">
                              <Input
                                type="number"
                                min={0}
                                step={10}
                                value={mrpInputValue}
                                onChange={(e) => handlePriceChange(option.id, 'mrp', e.target.value)}
                                className="w-28 text-right text-xs bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-emerald-500 ml-auto"
                              />
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-right">
                              <Input
                                type="number"
                                min={0}
                                step={10}
                                value={saleInputValue}
                                onChange={(e) => handlePriceChange(option.id, 'sale', e.target.value)}
                                className="w-28 text-right text-xs bg-zinc-900 border-zinc-800 text-emerald-300 font-semibold focus:border-emerald-500 ml-auto"
                              />
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-center">
                              {isModified ? (
                                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                                  Modified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-zinc-500 border-zinc-800 text-[10px]">
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
