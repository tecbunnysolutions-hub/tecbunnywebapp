'use client';

import { useState, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { LucideProps } from 'lucide-react';
import {
  Award,
  Cctv,
  Code,
  Cpu,
  HeadphonesIcon,
  RefreshCw,
  Shield,
  ShoppingCart,
  Truck,
  Wrench,
  Sparkles,
  Network,
  Lock,
  Fingerprint,
  Camera,
  Terminal,
  Database,
  ArrowRight
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { cn, revealDelayClass } from "@tecbunny/core/utils";
import { useCart } from "@tecbunny/core/hooks";
import { useAnalytics } from '../hooks/use-analytics';
import { usePermissions } from '../hooks/use-permissions';
import { useRevealSections } from '../hooks/use-reveal-sections';
import type { Product, Service } from "@tecbunny/core/types";
import { BRAND_LOGO_URL } from "@tecbunny/ui";

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Wrench,
  Shield,
  Truck,
  HeadphonesIcon,
  RefreshCw,
  Award,
  Cctv,
  Cpu,
  Code,
};

interface ServicePricingTier {
  label: string;
  price: string;
  detail: string;
  amount?: number;
}

interface ServicePricingPlan {
  name: string;
  summary: string;
  tiers: ServicePricingTier[];
}

interface ServicePricingCategory {
  category: string;
  blurb: string;
  plans: ServicePricingPlan[];
}

interface TermSubSection {
  title: string;
  description?: string;
  bullets: string[];
}

const servicePricing: ServicePricingCategory[] = [
  {
    category: 'CCTV & AMC Services',
    blurb: 'Professional installation and ongoing maintenance plans for cameras, NVRs, and access systems.',
    plans: [
      
      
      
      {
        name: 'CCTV New Installation',
        summary: 'Supply, cable, configure and commission CP PLUS / Hikvision camera systems.',
        tiers: [
          { label: '4-Camera Kit (Home)', price: 'from ₹14,999', detail: '4 cameras · 4-ch NVR · 1TB HDD · Full cabling · Mobile app setup', amount: 14999 },
          { label: '8-Camera Kit (Shop/Office)', price: 'from ₹24,999', detail: '8 cameras · 8-ch NVR · 2TB HDD · Full cabling · Remote access', amount: 24999 },
        ]
      }
    ]
  },
  {
    category: 'Computer Services',
    blurb: 'From bespoke workstation builds to fast repair and upgrade programs.',
    plans: [
      {
        name: 'Repair Services',
        summary: 'Rapid fault isolation plus genuine spares for laptops and desktops.',
        tiers: [
          { label: 'Standard Repair', price: '₹999', detail: 'Includes diagnostics, OS tune-up, and labour (parts extra).', amount: 999 }
        ]
      },
      {
        name: 'Upgrade Services',
        summary: 'Extend hardware life with certified performance upgrades.',
        tiers: [
          { label: 'Upgrade Service Ticket', price: '₹999', detail: 'Covers labour for RAM, SSD, or GPU swaps (parts extra).', amount: 999 }
        ]
      }
    ]
  },
  {
    category: 'Smart Home & Access Control',
    blurb: 'Retrofit automation and access control for homes, hotels and offices.',
    plans: [
      {
        name: 'Home Automation Starter',
        summary: 'Voice + app control for lighting, fans and door bells.',
        tiers: [
          { label: 'Starter Pack (up to 5 nodes)', price: 'from ₹12,999', detail: 'Includes devices, programming, app setup, and 1-year support call.', amount: 12999 }
        ]
      },
      {
        name: 'RFID Access Control',
        summary: 'Biometric and smartcard access for offices, warehouses and hotels.',
        tiers: [
          { label: 'Single Door RFID Kit', price: 'from ₹8,999', detail: 'Controller · reader · electric lock · power supply · programming & commissioning.', amount: 8999 }
        ]
      }
    ]
  }
];

const companyInfo = {
  name: 'TECBUNNY SOLUTIONS PRIVATE LIMITED',
  cin: 'U80200GA2025PTC017488',
  udyam: 'UDYAM-GA-01-0047280',
  gstin: '30AAMCT1608G1ZO',
  ceo: 'SHUBHAM SAKHARAM BHISAJI',
  website: 'https://www.tecbunny.com'
};

export interface ServicesPageProps {
  services: Service[];
  hasServiceLoadError?: boolean;
}

export default function ServicesPage({ services, hasServiceLoadError = false }: ServicesPageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { trackEvent } = useAnalytics();
  const { atLeast } = usePermissions();
  const [busyServiceId, setBusyServiceId] = useState<string | null>(null);
  const canManageServices = atLeast('admin');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // Scroll back to start if at the end, otherwise scroll by one full page of cards + gap
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: container.clientWidth + 24, behavior: 'smooth' });
        }
      }
    }, 15000); // 15 seconds auto-scroll

    return () => clearInterval(interval);
  }, []);

  useRevealSections();

  const getContactHref = (service: Service) => {
    const title = (service.title || '').toLowerCase();
    const category = (service.category || '').toLowerCase();

    if (title.includes('amc')) {
      return '/contact?subject=sales&service=amc_service&intent=amc_quote&source=services_core_desk&message=I%20need%20an%20AMC%20quote.%20Please%20share%20coverage%20options%20for%20my%20setup.';
    }
    if (title.includes('cctv') && (title.includes('installation') || title.includes('new'))) {
      return '/contact?subject=sales&service=cctv_installation&intent=site_survey&source=services_core_desk&message=I%20need%20a%20CCTV%20site%20survey%20and%20quote.%20Please%20contact%20me.';
    }
    if (title.includes('web')) {
      return '/contact?subject=web_development&service=web_development&intent=project_quote&message=I%20need%20a%20web%20development%20quote.%20Please%20contact%20me%20about%20my%20project.';
    }
    if (title.includes('repair')) {
      return '/contact?subject=support&service=repair_service&intent=service_request&source=services_core_desk&message=I%20need%20help%20with%20a%20repair%20request.%20Please%20let%2520me%20know%20the%2520next%20steps.';
    }
    if (category.includes('computer')) {
      return '/contact?subject=sales&service=computer_setup&intent=project_quote&source=services_core_desk&message=I%20need%20a%20computer%20setup%20or%20upgrade%20quote.%20Please%20contact%20me.';
    }
    return '/contact?subject=sales&service=general_service&intent=quote_request&source=services_core_desk&message=I%20need%20a%20service%20quote.%20Please%20contact%20me%20with%20the%20next%20steps.';
  };

  const serviceSections = services.reduce<Array<{ key: string; items: Service[] }>>((acc, service) => {
    const key = service.category || 'Services';
    const existing = acc.find(section => section.key === key);
    if (existing) {
      existing.items.push(service);
    } else {
      acc.push({ key, items: [service] });
    }
    return acc;
  }, []);

  const buildServiceProduct = (service: Service): Product => {
    const title = service.title || service.name || 'TecBunny Service';
    const parsedPrice = typeof service.price === 'number'
      ? service.price
      : Number(service.price ?? 0);
    const price = Number.isFinite(parsedPrice) ? parsedPrice : 0;
    const product: Product = {
      id: `service-${service.id}`,
      title,
      name: title,
      description: service.description || 'TecBunny expert service request.',
      price,
      mrp: price,
      offer_price: price,
      discount_percentage: 0,
      category: service.category || 'Services',
      image: BRAND_LOGO_URL,
      images: [BRAND_LOGO_URL],
      product_type: 'service',
      tags: ['service', service.category || 'Services'],
      status: 'active',
      brand: 'TecBunny Services',
      popularity: 0,
      rating: 0,
      reviewCount: 0,
      created_at: service.created_at || new Date().toISOString(),
      updated_at: service.updated_at || undefined,
      gstRate: price > 0 ? 18 : 0,
      product_url: '/services',
      additional_images: [],
    };

    return product;
  };

  const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleAddToCart = (service: Service) => {
    if (busyServiceId === service.id) return;
    setBusyServiceId(service.id);

    const coercedPrice = typeof service.price === 'number' && service.price > 0 ? service.price : 0;
    const product = buildServiceProduct(service);
    product.price = coercedPrice;
    product.offer_price = coercedPrice;
    product.gstRate = coercedPrice > 0 ? 18 : 0;
    product.gst_rate = product.gstRate;

    addToCart(product);
    setBusyServiceId(null);
  };

  const handlePricingTierAdd = (category: string, plan: ServicePricingPlan, tier: ServicePricingTier) => {
    if (!tier.amount) return;
    const syntheticId = `pricing-${slugify(category)}-${slugify(plan.name)}-${slugify(tier.label)}`;
    if (busyServiceId === syntheticId) return;
    setBusyServiceId(syntheticId);

    const nowIso = new Date().toISOString();
    const syntheticService: Service = {
      id: syntheticId,
      icon: category.includes('CCTV') ? 'Cctv' : 'Cpu',
      title: `${plan.name} – ${tier.label}`,
      description: `${plan.summary} ${tier.detail}`.trim(),
      features: [plan.summary, tier.detail],
      badge: null,
      is_active: true,
      price: tier.amount,
      duration_days: undefined,
      category: (category.includes('CCTV') ? 'CCTV' : 'Computer') as Service['category'],
      display_order: 0,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const product = buildServiceProduct(syntheticService);
    product.title = syntheticService.title;
    product.price = tier.amount;
    product.offer_price = tier.amount;
    product.gstRate = tier.amount > 0 ? 18 : 0;
    product.gst_rate = product.gstRate;

    addToCart(product);
    setBusyServiceId(null);
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden py-16 sm:py-24">
      {/* Background Noise and Grid (unified style) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      {/* Ambient Blobs */}
      <div className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse" aria-hidden="true" />
      <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" aria-hidden="true" />

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 sm:px-8">
        
        {/* Page Hero */}
        <section className="reveal-section text-center space-y-6 max-w-3xl mx-auto" data-reveal-id="services-hero">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
            <Sparkles size={14} className="animate-pulse" />
            <span>Enterprise Solutions</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-tech leading-tight tech-heading">
            End-to-End Solutions for <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">the Modern Enterprise</span>
          </h1>
          <p className="text-lg font-light leading-relaxed tech-body">
            From securing your physical perimeter to optimizing your cloud infrastructure and scaling your back-office operations, we provide the technology that drives your business forward.
          </p>
          {canManageServices && (
            <div className="mt-6 flex justify-center">
              <Link
                href="/superadmin/mgmt/services"
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 text-blue-400 hover:bg-zinc-800/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm"
              >
                Services Core Desk
              </Link>
            </div>
          )}
        </section>

        {/* Core Service Categories */}
        <section className="reveal-section space-y-8" data-reveal-id="core-service-categories">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-blue-500" />
            <div>
              <h2 className="text-xl font-bold font-tech tech-heading">Our Service Offerings</h2>
              <p className="text-xs text-zinc-500">Select a category below to explore our deep-dive technical capabilities.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Network & Infrastructure */}
            <div className="bento-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-blue-500/30">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <Network size={20} />
                </div>
                <h3 className="text-lg font-bold font-tech tech-heading text-white">Network & Infrastructure Solutions</h3>
                <p className="text-xs leading-relaxed text-zinc-400 font-light tech-body">
                  Enterprise-grade network design, structured copper/fiber cabling, core routing, managed switching, Wi-Fi optimization, and firewall configurations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900/60">
                <Link
                  href="/services/network-infrastructure"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Explore Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 2: Physical Security */}
            <div className="bento-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-blue-500/30">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Camera size={20} />
                </div>
                <h3 className="text-lg font-bold font-tech tech-heading text-white">Physical Security & Surveillance</h3>
                <p className="text-xs leading-relaxed text-zinc-400 font-light tech-body">
                  High-definition IP CCTV camera systems, secure local NVR server setups, AI video analytics, and motion-based intrusion alarm routing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900/60">
                <Link
                  href="/services/physical-security"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Explore Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 3: Access Control */}
            <div className="bento-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-blue-500/30">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                  <Lock size={20} />
                </div>
                <h3 className="text-lg font-bold font-tech tech-heading text-white">Smart Access Control Systems</h3>
                <p className="text-xs leading-relaxed text-zinc-400 font-light tech-body">
                  Contactless RFID lock systems, biometric and facial recognition entry, speed gates, turnstiles, and automated driveway boom barriers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900/60">
                <Link
                  href="/services/smart-access-control"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Explore Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 4: Lifecycle Hardware */}
            <div className="bento-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-blue-500/30">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Cpu size={20} />
                </div>
                <h3 className="text-lg font-bold font-tech tech-heading text-white">Lifecycle Hardware Management</h3>
                <p className="text-xs leading-relaxed text-zinc-400 font-light tech-body">
                  Tier-1 OEM device procurement, standardized OS imaging, physical desk deployment, and proactive AMC maintenance/hardware swaps.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900/60">
                <Link
                  href="/services/lifecycle-hardware"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Explore Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 5: Software & System Admin */}
            <div className="bento-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-blue-500/30">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Terminal size={20} />
                </div>
                <h3 className="text-lg font-bold font-tech tech-heading text-white">Software & System Administration</h3>
                <p className="text-xs leading-relaxed text-zinc-400 font-light tech-body">
                  OS deployment, Active Directory/IAM access rules, patch management, cloud/offline backups, and disaster recovery strategies.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900/60">
                <Link
                  href="/services/software-system-admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Explore Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Services Catalog */}
        <section className="space-y-16">
          {(!services || services.length === 0) && !hasServiceLoadError && (
            <div className="bento-card p-12 text-center shadow-sm">
              <Wrench className="h-10 w-10 text-zinc-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold font-tech tech-heading">Recompiling the Arsenal</h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-light tech-body">
                We are currently deploying new service packages. Contact our engineers directly to map out your infrastructure.
              </p>
              <Link
                href="/contact?subject=sales&intent=service_quote&source=services_core_desk"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Summon an Engineer
              </Link>
            </div>
          )}

          <div className="reveal-section space-y-6" data-reveal-id="services-all">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-blue-500" />
              <div>
                <h2 className="text-xl font-bold font-tech tech-heading">All Services</h2>
                <p className="text-xs text-zinc-500">Explore our complete catalog of professional technology services.</p>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="grid grid-cols-1 gap-6 pb-8 pt-4 sm:flex sm:overflow-x-auto sm:snap-x sm:snap-mandatory sm:[&::-webkit-scrollbar]:h-2 sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-blue-500/20 sm:hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/40"
            >
              {services.map((service) => {
                const Icon = iconMap[service.icon] || Wrench;
                return (
                  <div
                    key={service.id}
                    className="bento-card flex h-full w-full flex-col justify-between p-6 transition-all duration-300 sm:w-[calc(50%-12px)] sm:shrink-0 sm:snap-start lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Icon className="h-5.5 w-5.5" />
                        </div>
                        {service.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5">
                            {service.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-base font-bold font-tech tech-heading">{service.title || service.name}</h3>
                      <p className="mt-2 text-xs leading-relaxed font-light tech-body text-zinc-400">{service.description}</p>
                      
                      {service.features && service.features.length > 0 && (
                        <ul className="mt-4 space-y-2 text-xs text-zinc-500">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-50" />
                              <span className="font-light tech-body">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Rate Credit</span>
                        <span className="text-base font-bold font-mono tech-heading">
                          {service.price ? `₹${Number(service.price).toLocaleString('en-IN')}` : 'Quotation Basis'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(service)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-555 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] disabled:opacity-50"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add Service to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const href = getContactHref(service);
                          router.push(href);
                        }}
                        className="w-full py-2 border border-zinc-800 text-zinc-450 hover:bg-zinc-800/30 text-xs font-semibold rounded-lg transition-colors text-center"
                      >
                        Consult Engineering Team
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>



      </div>
    </div>
  );
}
