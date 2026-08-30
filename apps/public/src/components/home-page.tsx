'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import HeroCarousel from './HeroCarousel';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Server,
  Zap,
  Layers,
  Sliders,
  FileText,
  TrendingDown,
  Building2,
  Award,
  Activity,
  ShoppingBag,
  Lock,
  Wifi,
  Shield,
  Clock
} from 'lucide-react';

import { getProductDisplayImage } from "@tecbunny/core/image-utils";
import { cn, revealDelayClass } from "@tecbunny/core/utils";
import { OptimizedImage, Button } from "@tecbunny/ui";
import type { Product } from '@tecbunny/core';
import { RegionalTrustBanner } from './RegionalTrustBanner';
import { HeroRotator } from './home/HeroRotator';
import { TrustSection } from './TrustSection';
import { HowItWorksSection } from './HowItWorksSection';
import { WhatsAppFloatingButton } from './WhatsAppFloatingButton';

const DynamicBehavioralCouponPopup = dynamic(() => import('./BehavioralCouponPopup').then(mod => mod.BehavioralCouponPopup), { ssr: false });
const DynamicAmbientEffects = dynamic(() => import('./home/AmbientEffects').then(mod => mod.AmbientEffects), { ssr: false });
const DynamicHeroVisuals = dynamic(() => import('./home/HeroVisuals').then(mod => mod.HeroVisuals), { ssr: false });
const TrackQuoteForm = dynamic(() => import('./home/TrackQuoteForm').then(mod => mod.TrackQuoteForm), { ssr: false });

const AddToCartButton = dynamic(
  () => import('@/components/cart/AddToCartButton').then((module) => module.AddToCartButton),
  { ssr: false }
);

type DbProduct = {
  id: string;
  title?: string;
  name?: string;
  price?: number;
  mrp?: number;
  image?: string | null;
  images?: Array<string | { url?: string | null }>;
  status?: string | null;
  description?: string | null;
  category?: string | null;
  popularity?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | null;
};

const FEATURE_PILLARS = [
  {
    title: 'Core IT and Network Infrastructure for Your Business',
    desc: 'Resilient digital foundations, seamless cloud migrations, and managed IT support.',
    icon: Server,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/network-infrastructure',
  },
  {
    title: 'IT Security and Compliance for Your Business Network',
    desc: 'Continuous threat detection, data backup, and uncompromised protection.',
    icon: ShieldCheck,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/software-system-admin',
  },
  {
    title: 'Physical Tech and Smart Building Infrastructure in Goa',
    desc: 'CCTV installation, IP surveillance, RFID access control, smart automation, and structured cabling.',
    icon: Zap,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/physical-security',
  },
  {
    title: 'Managed ITES and Business Process Outsourcing Services',
    desc: 'Optimized business processes, technical support desks, and back-office automation.',
    icon: Layers,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/smart-infrastructure',
  },
];

export default function HomePage({
  initialProducts = [],
  initialPartnerBrands = [],
  initialHeroCarousel = null,
}: {
  initialProducts?: DbProduct[];
  initialPartnerBrands?: Array<{ name: string; logoUrl: string }>;
  initialHeroCarousel?: any;
}) {
  const hasPartnerBrands = initialPartnerBrands.length > 0;

  return (
    <div className="tb-page relative overflow-hidden selection:bg-blue-500/20 selection:text-white">
      <DynamicBehavioralCouponPopup />

      <section className="relative flex min-h-[72vh] items-center overflow-hidden py-14 sm:py-20 lg:py-24">
        <DynamicAmbientEffects />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.06] brightness-100 contrast-150" />

        <div className="tb-container relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] xl:gap-16">
            <div className="reveal-section is-revealed max-w-3xl space-y-6" data-reveal-id="hero-copy">
              <h1 className="text-3xl font-extrabold leading-[1.05] text-white sm:text-4xl md:text-5xl xl:text-6xl font-tech tracking-tight" aria-label="CCTV, IT & Smart Automation. Securing Your Enterprise.">
                <span className="glitch-text block pb-3 text-blue-400" data-text="CCTV, IT & Smart Automation.">CCTV, IT &amp; Smart Automation.</span>
                <span className="block text-zinc-100">
                  Securing Your Enterprise.
                </span>
              </h1>

              <HeroRotator />

              <p className="tb-lede max-w-2xl text-lg sm:text-xl">
                We build IT systems, handle CCTV, and run back-office work — so your business can grow and stay safe.
              </p>

              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 transition-all duration-300 hover:border-blue-500/40 hover:bg-blue-500/10">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400">Business?</span>
                    <h3 className="mt-1 text-lg font-bold text-white font-tech">Enterprise solutions</h3>
                    <p className="text-xs text-zinc-400 mt-2 mb-4 leading-relaxed font-light">
                      CCTV, networks, smart locks, and IT support for Goa hotels, resorts, and offices.
                    </p>
                  </div>
                  <Link
                    href="/contact?subject=sales&service=enterprise_solutions&intent=enterprise_consultation&source=homepage_hero"
                    className="tb-button-primary w-full text-center flex items-center justify-center gap-1.5 h-11 text-xs uppercase tracking-wider font-semibold rounded-xl"
                  >
                    Talk to Enterprise Team
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/20">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Need hardware?</span>
                    <h3 className="mt-1 text-lg font-bold text-white font-tech">Shop products</h3>
                    <p className="text-xs text-zinc-450 mt-2 mb-4 leading-relaxed font-light">
                      PCs, NVR hardware, and core components, with delivery eligibility confirmed at checkout.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    className="tb-button-secondary w-full text-center flex items-center justify-center gap-1.5 h-11 text-xs uppercase tracking-wider font-semibold rounded-xl"
                  >
                    Shop Products
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/20">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Need repair or service?</span>
                    <h3 className="mt-1 text-lg font-bold text-white font-tech">Book service</h3>
                    <p className="text-xs text-zinc-450 mt-2 mb-4 leading-relaxed font-light">
                      Request CCTV, network, IT, or AMC help from our local service team.
                    </p>
                  </div>
                  <Link
                    href="/contact?subject=support&service=repair_service&intent=service_request&source=homepage_hero"
                    className="tb-button-secondary w-full text-center flex items-center justify-center gap-1.5 h-11 text-xs uppercase tracking-wider font-semibold rounded-xl"
                  >
                    Book Service
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <aside className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4" aria-labelledby="goa-delivery-eligibility">
                <h2 id="goa-delivery-eligibility" className="text-sm font-semibold text-white">Next-day delivery in Goa: eligibility</h2>
                <dl className="mt-3 grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2">
                  <div><dt className="font-medium text-zinc-300">Eligible PIN codes</dt><dd className="text-zinc-500">Goa 403xxx PIN codes, confirmed at checkout.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Products</dt><dd className="text-zinc-500">In-stock products at our Goa fulfillment hub only.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Order cut-off</dt><dd className="text-zinc-500">Shown at checkout; later orders move to the next working day.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Working days</dt><dd className="text-zinc-500">Business days only.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Holiday exceptions</dt><dd className="text-zinc-500">Public holidays and carrier closures are excluded.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Shipping partner</dt><dd className="text-zinc-500">Assigned at dispatch and shown with tracking.</dd></div>
                </dl>
              </aside>

              <div className="grid max-w-md grid-cols-2 gap-6 border-t border-zinc-800/80 pt-8">
                <div className="group">
                  <p className="text-3xl font-black text-white font-tech group-hover:text-blue-400 transition-colors">100+</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Installations delivered</p>
                </div>
                <div className="group">
                  <p className="text-3xl font-black text-white font-tech group-hover:text-blue-400 transition-colors">SLA</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Direct Support</p>
                </div>
              </div>
            </div>

            <DynamicHeroVisuals />
          </div>
        </div>
      </section>

      {/* Instant Quote & Negotiation System Promotion */}
      <section className="tb-section relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="tb-container relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Promotion Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold text-blue-400">
                <Sparkles size={14} className="animate-pulse" />
                Instant Quotation & Live Negotiation
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-tech leading-tight animate-reveal">
                Design Your Custom IT System. <br />
                <span className="text-zinc-200">Name Your Price, Get an Instant Quote.</span>
              </h2>
              <p className="tb-lede max-w-2xl text-base">
                Stop waiting for quotes. Pick exactly what you need, see the real price, and get a custom deal instantly.
              </p>
              
              {/* Feature grid */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="flex gap-3">
                  <div className="tb-icon-tile">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Live Customization</h3>
                    <p className="text-xs text-zinc-500 mt-1">Adjust cameras, cabling, storage & accessories dynamically.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="tb-icon-tile">
                    <TrendingDown size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Live Bidding Engine</h3>
                    <p className="text-xs text-zinc-500 mt-1">Submit an eligible offer for review; a counter-offer is never guaranteed.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="tb-icon-tile">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Instant Formal PDF</h3>
                    <p className="text-xs text-zinc-500 mt-1">Download custom pricing summaries with 7-day validity details.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="tb-icon-tile">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">System Compatibility</h3>
                    <p className="text-xs text-zinc-500 mt-1">Auto-verifies storage parameters & power needs in real time.</p>
                  </div>
                </div>
              </div>

              <aside className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4" aria-labelledby="negotiation-rules">
                <h3 id="negotiation-rules" className="text-sm font-semibold text-white">Name Your Price: rules</h3>
                <dl className="mt-3 grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2">
                  <div><dt className="font-medium text-zinc-300">Eligible products</dt><dd className="text-zinc-500">Custom CCTV and IT system configurations only; standard store products use their listed price.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Minimum offer</dt><dd className="text-zinc-500">At least 70% of the displayed custom-quote total.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Quote validity</dt><dd className="text-zinc-500">7 calendar days from issue.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Stock</dt><dd className="text-zinc-500">Not reserved until the quote is accepted and the order is confirmed.</dd></div>
                  <div><dt className="font-medium text-zinc-300">Counter-offers</dt><dd className="text-zinc-500">A counter-offer is discretionary; final terms are shown on the reviewed quote.</dd></div>
                  <div><dt className="font-medium text-zinc-300">GST and shipping</dt><dd className="text-zinc-500">GST is included in the quote total. Shipping is separate unless the final quote says otherwise.</dd></div>
                </dl>
              </aside>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/customised-setups"
                  className="tb-button-primary"
                >
                  Start Custom Setup Configurator
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>

            {/* Right Column: Dynamic Quote Tracking Panel */}
            <div className="lg:col-span-5">
              <TrackQuoteForm />
            </div>
          </div>
        </div>
      </section>

      <div>
        <HeroCarousel pageKey="homepage" initialData={initialHeroCarousel} />
      </div>

      {/* 4. REAL-TIME REGIONAL SOCIAL PROOF */}
      {hasPartnerBrands ? (
        <RegionalTrustBanner partnerBrands={initialPartnerBrands} />
      ) : null}

      {/* Partner Brands Strip */}
      {hasPartnerBrands ? (
        <section className="border-y border-zinc-800 bg-zinc-950/60 py-8 sm:py-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '200px' }}>
          <div className="tb-container">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500 mb-6">
              Authorized Product Brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
              {initialPartnerBrands.map((brand) => (
                <span key={brand.name} className="flex items-center justify-center transition-all hover:scale-105 duration-200">
                  {brand.logoUrl ? (
                    <div className="bg-white p-3 rounded-md shadow-sm flex items-center justify-center h-14 w-32 md:h-16 md:w-40">
                      <OptimizedImage
                        src={brand.logoUrl}
                        alt={brand.name}
                        width={120}
                        height={40}
                        className="h-full w-full object-contain"
                        transformation={{ quality: 80 }}
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-bold tracking-widest text-zinc-400 font-tech hover:text-blue-500 transition-colors">
                      {brand.name}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="tb-section reveal-section is-revealed" data-reveal-id="pillars" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="tb-container">
          <div className="mb-14 max-w-2xl">
            <span className="tb-kicker">Core pillars</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Systems Engineered for Scale and Designed for Security</h2>
            <p className="tb-lede mt-4 text-sm sm:text-base">
              Comprehensive IT and ITES solutions tailored to the demands of modern business.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURE_PILLARS.map((pillar, index) => (
              <div
                key={pillar.title}
                className={cn(
                  'tb-card reveal-item p-6',
                  revealDelayClass(index * 90)
                )}
              >
                <div className={`mb-5 tb-icon-tile bg-gradient-to-br ${pillar.accent}`}>
                  <pillar.icon size={22} className="text-zinc-200" />
                </div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">{pillar.desc}</p>
                <Link
                  href={pillar.href}
                  className="mt-6 tb-text-link text-xs uppercase tracking-[0.2em]"
                >
                  Explore <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tb-section reveal-section is-revealed" data-reveal-id="cctv-services" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <div className="tb-container">
          <div className="mb-10 max-w-2xl">
            <span className="tb-kicker">What we deliver</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">CCTV Installation, Networking and Managed IT Services</h2>
            <p className="tb-lede mt-4 text-sm sm:text-base">
              We do CCTV and IT work across Goa. One team for all your tech needs — CCTV, networks, smart home tools, and AMC plans with clear SLAs.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Professional Camera and Surveillance System Setup in Goa</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We install CCTV in Goa. We fit cameras at hotels, homes, offices, and shops across North Goa and South Goa — Pernem, Mapusa, Panaji, Anjuna, Siolim, and more. We sell and fit Hikvision, Dahua, CP Plus, and top CCTV brands. CCTV jobs can include AMC coverage, support access, and warranty options. We fit IP cameras, PTZ cameras, NVR and DVR units, night cameras, and cloud CCTV systems to keep your site safe day and night.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Network Setup and Structured Cabling Services in Goa</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We build and run networks for hotels, offices, and clinics in Goa. Our work covers Cat6 cabling, Wi-Fi 6 access points, VLAN setup, firewall install, and smart switches. We use Cisco, Ubiquiti, and Fortinet gear. You get a fast, safe, and well-run network with an SLA to back it up.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Smart Home, Office, and Building Automation in Goa</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We fit smart systems for homes, resorts, and offices. This covers RFID locks, smart door latches, light control, smart blinds, power tracking, and AV setup. We use KNX, Zigbee, and Z-Wave tools. You can run it all from your phone or by voice. Your team can watch many sites from one screen.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Annual IT AMC and Managed Support Plans for Your Business</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our AMC plans cover your CCTV, network gear, servers, and all IT kit. We do planned check-ups, remote help desk, hardware fixes, firmware updates, and audit reports. We serve hotels, hospitals, schools, and firms in Goa and Maharashtra. Response targets vary by request type and plan coverage.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-white mb-3">Our IT Service Coverage Areas Across Goa and India</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We do CCTV, IT, and smart home work across <strong className="text-zinc-300">North Goa</strong> — Pernem, Mapusa, Calangute, Baga, Anjuna, Siolim, Vagator, Chopdem, Arambol, Morjim, and Candolim. We cover <strong className="text-zinc-300">South Goa</strong> too — Panaji, Margao, Vasco, Ponda, and Cortalim. We also serve big IT and CCTV jobs in <strong className="text-zinc-300">Mumbai, Pune, and Nashik</strong>. Call us today for a fast CCTV, network, or AMC quote.
            </p>
          </div>
        </div>
      </section>

      <section className="tb-section reveal-section is-revealed" data-reveal-id="plans" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="tb-container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className={cn('tb-panel reveal-item relative p-5 sm:p-10', revealDelayClass(0))}>
            <h3 className="text-2xl font-semibold text-white sm:text-3xl">Simple to Use and Hard to Break: Smart Systems</h3>
            <p className="tb-lede mt-4 text-sm sm:text-base">
              Enjoy peace of mind with smart systems designed for everyday people, backed by our friendly local support.
            </p>
            <div className="mt-6 grid gap-4">
              {['Unified monitoring', 'Actionable reporting', 'Hands-on lifecycle support'].map((item, index) => (
                <div key={item} className={cn('reveal-item flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300', revealDelayClass(100 + index * 70))}>
                  <Layers size={16} className="text-blue-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="tb-section reveal-section is-revealed" data-reveal-id="hardware" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="tb-container">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="tb-kicker">Storefront</span>
              <h2 className="mt-3 text-3xl font-semibold text-white">Our Featured Hardware for IT and Smart Home Systems</h2>
            </div>
            <Link
              href="/products"
              className="tb-text-link"
            >
              Browse catalog <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {initialProducts.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-zinc-800 bg-zinc-950/70 p-8 text-center text-zinc-500">
                No products available yet.
              </div>
            )}

            {initialProducts.map((product, index) => {
              const title = product.title || product.name || 'Product';
              const rawPrice = Number(product.price ?? product.mrp ?? 0);
              const rawMrp = Number(product.mrp ?? rawPrice);
              
              const price = rawPrice;
              const oldPrice = rawMrp;
              const imageUrl = getProductDisplayImage(product) || '';
              const resolvedProduct: Product = {
                ...product,
                title,
                name: title,
                description: (product.description ?? '').trim(),
                price,
                category: product.category || 'General',
                image: imageUrl || '',
                popularity: product.popularity ?? 0,
                rating: product.rating ?? 0,
                reviewCount: product.reviewCount ?? 0,
                created_at: product.created_at || new Date().toISOString(),
              } as Product;

              return (
                <div key={product.id} className={cn('tb-card reveal-item flex flex-col justify-between p-5', revealDelayClass(index * 90))}>
                  <Link href={`/products/${product.id}`} className="group/product-link block">
                    <div className="group/product relative mb-4 flex h-32 sm:h-40 items-center justify-center overflow-hidden rounded-lg bg-white p-2 border border-zinc-800">
                      {imageUrl ? (
                        <OptimizedImage
                          src={imageUrl}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="h-full w-full object-contain transition-transform duration-500 group-hover/product:scale-105"
                          transformation={{ width: 480, height: 320, quality: 75 }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-2 border border-zinc-800 rounded-lg text-zinc-500 hover:text-blue-500 hover:border-blue-500/20 transition-all duration-300">
                          <Server size={36} className="text-zinc-600 group-hover/product-link:text-blue-500 transition-colors" />
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 font-tech">Hardware</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover/product-link:text-blue-500 transition-colors line-clamp-2 min-h-[40px]">{title}</h3>
                  </Link>
                  <div>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <span className="text-blue-400 font-semibold">₹{price.toLocaleString('en-IN')}</span>
                      {oldPrice > price && (
                        <span className="text-zinc-500 line-through">₹{oldPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <AddToCartButton
                      product={resolvedProduct}
                      className="mt-4 min-h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-semibold text-white hover:border-blue-500/30 transition-colors"
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries Showcase Section */}
      <section className="tb-section reveal-section is-revealed border-t border-zinc-900 bg-zinc-950/40 py-16 sm:py-24" data-reveal-id="industries-showcase" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="tb-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="tb-kicker">Industry Verticals</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
                Specialized IT &amp; Security Infrastructure for Goa Businesses
              </h2>
              <p className="tb-lede mt-3 text-sm sm:text-base text-zinc-400">
                Tailored engineering architectures designed for the specific physical and operational needs of your industry.
              </p>
            </div>
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
            >
              Explore All Industries <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Hospitality */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/30 p-7 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                  <Building2 size={22} />
                </div>
                <h3 className="text-xl font-bold text-white font-tech">Hospitality &amp; Resorts</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  High-density guest Wi-Fi through laterite walls, RFID European mortise door locks, and property-wide low-light CCTV.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-850/60">
                <Link href="/industries/hospitality" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
                  View Hospitality Solutions <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Corporate Offices */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/30 p-7 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                  <Building2 size={22} />
                </div>
                <h3 className="text-xl font-bold text-white font-tech">Corporate Offices &amp; Co-Working</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Dual-ISP auto-failover, structured Cat6/fiber rack cabling, and 0.2s facial recognition attendance terminals.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-850/60">
                <Link href="/industries/offices" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
                  View Office Solutions <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Education */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/30 p-7 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                  <Award size={22} />
                </div>
                <h3 className="text-xl font-bold text-white font-tech">Schools &amp; Campuses</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Content-filtering firewalls, computer lab high-density cabling, and perimeter AI security cameras with gate transit tracking.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-850/60">
                <Link href="/industries/education" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
                  View Campus Solutions <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Healthcare */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/30 p-7 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Activity size={22} />
                </div>
                <h3 className="text-xl font-bold text-white font-tech">Healthcare &amp; Hospitals</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Isolated medical VLANs for PACS/EMR security, pharmacy biometric locks, and uninterrupted UPS power conditioning.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-850/60">
                <Link href="/industries/healthcare" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
                  View Hospital Solutions <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Retail */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/30 p-7 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300 sm:col-span-2 lg:col-span-2">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <ShoppingBag size={22} />
                </div>
                <h3 className="text-xl font-bold text-white font-tech">Retail &amp; Commercial Stores</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Redundant POS billing failover, 4K cash-drawer security cameras, customer guest Wi-Fi portals, and multi-store cloud management.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-850/60">
                <Link href="/industries/retail" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
                  View Retail Solutions <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured 8-Step Lifecycle */}
      <HowItWorksSection />

      {/* Factual Trust Section */}
      <TrustSection />

      <section className="tb-section reveal-section is-revealed" data-reveal-id="about" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
        <div className="tb-container">
          <div className="mx-auto max-w-4xl space-y-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
            <h2 className="text-3xl font-semibold text-white mb-8 font-tech">One Team, One Partner for All Your IT and Tech Needs</h2>
            <p>
              At TecBunny, we use tech to help your business grow. We are a team of CCTV experts, IT engineers, and support staff. We build and run tech systems for your firm in Goa, Maharashtra, and India.
            </p>
            <p>
              We started by fitting CCTV cameras and access control for hotels, hospitals, schools, and offices. Now we do much more. We run full IT systems, keep your data safe, and help your team work better every day.
            </p>
            <p>
              We link CCTV, networks, and smart office tools to work as one. One team. One point of call. Need a CCTV fix, a network job, or an IT help desk? We can do all of it — in Goa and across India.
            </p>
            <p>
              We hold brand deals and service licences with Hikvision, Dahua, CP Plus, Cisco, Ubiquiti, and Fortinet. Every CCTV or IT job we do comes with a clear SLA, fair pricing, and one account manager.
            </p>
            <p>
              We are based in Pernem, North Goa. We know local tech issues well — the humidity, power cuts, and dust that affect CCTV and IT gear in Goa. This local know-how helps us do better, faster work for our clients across the state and beyond.
            </p>
          </div>
        </div>
      </section>

      <section className="tb-section reveal-section is-revealed" data-reveal-id="faq" style={{ contentVisibility: 'auto', containIntrinsicSize: '700px' }}>
        <div className="tb-container">
          <div className="mb-10 max-w-2xl">
            <span className="tb-kicker">FAQ</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl font-tech">Frequently Asked Questions About Our Services in Goa</h2>
          </div>
          <dl className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you fit CCTV in homes in Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We fit CCTV in homes, villas, and flats in Goa. We help you pick the right camera count and type for your space. AMC, support access, and warranty coverage depend on the selected plan. We also check old camera wiring and update it where included in the quote.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">How much does CCTV cost in Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Our CCTV prices start at Rs 8,000 for a basic 2-camera setup. A full 4-camera NVR kit starts at Rs 15,000. All costs include fitting, cabling, and a one-year warranty. We also offer easy monthly payment plans. Ask us for a free quote today.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you service and repair old CCTV?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We can service, fix, or upgrade most CCTV brands. We do on-site checks, camera swaps, NVR updates, and cable fixes. Our AMC plans cover all of this for a flat yearly fee. We also stock spare parts for Hikvision, Dahua, and CP Plus systems.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you set up Wi-Fi networks in Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We set up Wi-Fi, LAN networks, and cable runs for homes, offices, and hotels across Goa. We use Ubiquiti, Cisco, and Fortinet gear. Every network job comes with a 90-day free support period and a full handover report.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">What does an AMC plan cover?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">An AMC (Annual Maintenance Contract) covers your CCTV or IT kit for the full year. It can include planned check-ups, remote support, on-site fixes, and audit reports, with response targets defined in your plan. It helps reduce ad hoc repairs and keeps your gear maintained.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you do smart home setup in Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We fit smart lights, smart locks, RFID access, and AV systems in homes and resorts across Goa. We work with top smart home brands and link your devices to one app on your phone. All smart home jobs come with a warranty and tech support.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you fit CCTV for hotels in Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. Hotels are a key service area. We fit CCTV in hotel lobbies, car parks, pools, lifts, and guest floors. We plan a full CCTV layout map with the hotel team before we start. AMC and support coverage are defined in the project proposal.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you serve areas outside Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We serve clients in Mumbai, Pune, and Nashik for large IT and CCTV jobs. We also run remote IT support for firms across India. For jobs outside Goa, we can send a team or work with a local vendor under our watch. Call us to get a fast quote.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">How fast do you respond to faults?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Our service response times are shown in the clearly labelled panel at the top of this page. The applicable target depends on whether the request is a general enquiry, a critical AMC incident, or an on-site critical fault, and on plan coverage.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">What is an NVR and DVR for CCTV?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">A DVR (Digital Video Recorder) records from older analog CCTV cameras. An NVR (Network Video Recorder) records from IP cameras over a LAN. We help you pick the right one for your setup and budget. Most new CCTV systems use NVR units with remote view on your phone.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you fit RFID locks and smart access?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We fit RFID card readers, smart door locks, and access systems for offices, hotels, and flats in Goa. You can track who enters and exits your space in real time. We can also link the access system to your CCTV for a full audit trail.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you work with builders and architects?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We work with builders, fit-out teams, and architects to plan CCTV, network, and smart home cables at the build stage. Planning cables early saves money and time later. Call us for a free design consult on any new build or fit-out project in Goa.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Primary High-Converting CTA Banner */}
      <section className="tb-section reveal-section is-revealed" data-reveal-id="cta" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
        <div className="tb-container">
          <div className="tb-panel relative overflow-hidden p-8 sm:p-12 md:p-14 border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div className={cn('reveal-item space-y-4', revealDelayClass(0))}>
                <span className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
                  <Sparkles size={14} className="animate-pulse" /> Engineering Assessment
                </span>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl font-tech leading-tight">
                  Ready to Upgrade Your Commercial IT &amp; Security Infrastructure?
                </h2>
                <p className="tb-lede text-base sm:text-lg text-zinc-300 font-light max-w-2xl leading-relaxed">
                  Request a free, no-obligation technology assessment. Our certified engineers will review your property blueprint, calculate network density, and provide an itemized proposal within 24 hours.
                </p>
              </div>
              <div className={cn('reveal-item rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center space-y-4 shadow-xl', revealDelayClass(120))}>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Free Technical Proposal</span>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl w-full h-12 text-sm shadow-lg shadow-blue-500/25">
                  <Link href="/assessment">
                    Get Free Assessment &rarr;
                  </Link>
                </Button>
                <Link
                  href="/contact?subject=sales&service=enterprise_solutions&intent=enterprise_consultation"
                  className="block text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Or schedule a direct site consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
