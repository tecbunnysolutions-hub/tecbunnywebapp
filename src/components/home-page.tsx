'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Server,
  Wifi,
  Zap,
  CheckCircle2,
  Layers,
  Lock,
  Sliders,
  FileText,
  TrendingDown,
} from 'lucide-react';

import { getProductDisplayImage } from '@/lib/image-utils';
import { cn, revealDelayClass } from '@/lib/utils';
import { OptimizedImage } from './ui/optimized-image';
import type { Product } from '@/lib/types';
import { BehavioralCouponPopup } from './BehavioralCouponPopup';
import { RegionalTrustBanner } from './RegionalTrustBanner';

import { AmbientEffects } from './home/AmbientEffects';
import { HeroVisuals } from './home/HeroVisuals';
import { TrackQuoteForm } from './home/TrackQuoteForm';
import { MagneticButton } from './home/MagneticButton';
import { HeroRotator } from './home/HeroRotator';

const AddToCartButton = dynamic(
  () => import('@/components/cart/AddToCartButton').then((module) => module.AddToCartButton),
  { ssr: false }
);

const HeroCarousel = dynamic(() => import('./HeroCarousel'), {
  ssr: false,
  loading: () => (
    <section className="py-10 sm:py-14" aria-hidden="true">
      <div className="container mx-auto px-4">
        <div className="h-[340px] sm:h-[420px] w-full animate-pulse rounded-3xl bg-slate-900/60 border border-white/5" />
      </div>
    </section>
  ),
});

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
    title: 'Security Systems',
    desc: 'Layered protection with flexible monitoring and secure storage.',
    icon: ShieldCheck,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services',
  },
  {
    title: 'IT Reliability',
    desc: 'Keep devices, networks, and workflows resilient and optimized.',
    icon: Server,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services',
  },
  {
    title: 'Automation',
    desc: 'Smarter controls that adapt to the way you run your space.',
    icon: Wifi,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services',
  },
  {
    title: 'Incident Response',
    desc: 'Rapid alerts, clear workflows, and actionable insights.',
    icon: Zap,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services',
  },
];

const PLAN_TIERS = [
  {
    name: 'Essentials',
    summary: 'Foundational coverage for smaller footprints.',
    priceLabel: 'From ₹4,999/month',
    highlight: false,
    items: ['Routine health checks', 'Remote assistance window', 'Lifecycle planning'],
  },
  {
    name: 'Growth',
    summary: 'Balanced coverage for multi-site needs.',
    priceLabel: 'From ₹14,999/month',
    highlight: true,
    items: ['Priority response lane', 'Quarterly optimization', 'Dedicated escalation path'],
  },
  {
    name: 'Enterprise',
    summary: 'High-availability operations at scale.',
    priceLabel: 'From ₹24,999/month',
    highlight: false,
    items: ['Always-on monitoring', 'On-site engineering', 'Strategic roadmap reviews'],
  },
];

export default function HomePage({
  initialProducts = [],
  initialPartnerBrands = [
    { name: 'CP PLUS', logoUrl: '' },
    { name: 'HIKVISION', logoUrl: '' },
    { name: 'DAHUA', logoUrl: '' },
    { name: 'UBIQUITI', logoUrl: '' },
    { name: 'CISCO', logoUrl: '' },
    { name: 'TP-LINK', logoUrl: '' },
  ],
}: {
  initialProducts?: DbProduct[];
  initialPartnerBrands?: Array<{ name: string; logoUrl: string }>;
}) {
  return (
    <div className="relative overflow-hidden bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white">
      <BehavioralCouponPopup />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-zinc-850/5 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(9,9,11,0.6),_rgba(9,9,11,0.95))]" />
      </div>

      <section className="relative flex items-center overflow-hidden py-28 sm:py-36 min-h-[90vh]">
        <AmbientEffects />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-20 brightness-100 contrast-150" />
        <div className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse" aria-hidden="true" />
        <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="reveal-section space-y-10 is-revealed animate-scale-in" data-reveal-id="hero-copy" style={{ animationDuration: '0.8s' }}>
              <h1 className="text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl md:text-7xl xl:text-8xl font-tech tracking-tight" aria-label="Bulletproof IT and Unblinking Security">
                <span className="glitch-text block pb-3" data-text="Bulletproof IT.">Bulletproof IT.</span>
                <span className="block bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  Unblinking Security.
                </span>
              </h1>

              <HeroRotator />

              <p className="max-w-xl text-xl leading-relaxed text-zinc-400 font-light">
                Enterprise-grade CCTV, network infrastructure, and smart automation for Goa & Maharashtra. Engineered for zero downtime. Priced for aggressive growth.
              </p>

              <div className="flex flex-wrap gap-5">
                <MagneticButton
                  href="/contact"
                  className="relative inline-flex h-14 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#09090B] hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#09090b_50%,#3b82f6_100%)]"></span>
                  <span className="inline-flex h-full w-full items-center justify-center rounded-xl bg-[#09090B] px-8 py-3 text-base font-bold tracking-wide text-white backdrop-blur-3xl transition-colors hover:bg-zinc-900/90">
                    Build My Setup
                  </span>
                </MagneticButton>
                <MagneticButton
                  href="/services"
                  className="rounded-xl border border-zinc-700 bg-zinc-900/30 px-8 py-3 text-base font-bold tracking-wide text-white transition-all hover:bg-white/10 hover:border-zinc-500 flex items-center justify-center backdrop-blur-sm"
                >
                  See What We Do
                </MagneticButton>
              </div>

              <div className="flex gap-10 border-t border-zinc-800/80 pt-10">
                <div className="group">
                  <p className="text-3xl font-black text-white font-tech group-hover:text-blue-400 transition-colors">100+</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Installations</p>
                </div>
                <div className="group">
                  <p className="text-3xl font-black text-white font-tech group-hover:text-blue-400 transition-colors">SLA</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Direct Support</p>
                </div>
              </div>
            </div>

            <HeroVisuals />
          </div>
        </div>
      </section>

      {/* Instant Quote & Negotiation System Promotion */}
      <section className="relative py-16 sm:py-20 bg-[#09090B]/40 border-y border-zinc-800 overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        {/* Glow effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Promotion Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold text-blue-500">
                <Sparkles size={14} className="animate-pulse" />
                Instant Quotation & Live Negotiation
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-tech leading-tight animate-reveal">
                Build Your Defenses. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  Name Your Price.
                </span>
              </h2>
              <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
                Stop waiting days for bloated sales quotes. Use our live configurator to architect your exact security ecosystem, see transparent retail pricing, and submit a custom bid directly to our engineers.
              </p>
              
              {/* Feature grid */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Live Customization</h3>
                    <p className="text-xs text-zinc-500 mt-1">Adjust cameras, cabling, storage & accessories dynamically.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <TrendingDown size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Live Bidding Engine</h3>
                    <p className="text-xs text-zinc-500 mt-1">Tell us what you want to pay. Our system reviews and counter-offers in minutes.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Instant Formal PDF</h3>
                    <p className="text-xs text-zinc-500 mt-1">Download custom pricing summaries with 7-day validity details.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">System Compatibility</h3>
                    <p className="text-xs text-zinc-500 mt-1">Auto-verifies storage parameters & power needs in real time.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/customised-setups"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-bold text-white transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
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
        <HeroCarousel pageKey="homepage" />
      </div>

      {/* 4. REAL-TIME REGIONAL SOCIAL PROOF */}
      <RegionalTrustBanner />

      {/* Partner Brands Strip */}
      <section className="border-y border-zinc-800 bg-[#09090B]/80 py-8 sm:py-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '200px' }}>
        <div className="container mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500 mb-6">
            Authorized Product Brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 opacity-65">
            {initialPartnerBrands.map((brand) => (
              <span key={brand.name} className="flex items-center justify-center transition-all hover:scale-105 duration-200">
                {brand.logoUrl ? (
                  <OptimizedImage
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={120}
                    height={40}
                    className="h-8 md:h-10 w-auto object-contain filter brightness-75 contrast-125 hover:brightness-100 transition-all duration-200"
                    transformation={{ quality: 80 }}
                  />
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

      <section className="bg-[#09090B] py-12 sm:py-24 reveal-section is-revealed" data-reveal-id="pillars" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="container mx-auto px-6">
          <div className="mb-14 max-w-2xl">
            <span className="text-xs uppercase tracking-[0.4em] text-blue-500">Core pillars</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Infrastructure that never sleeps.</h2>
            <p className="mt-4 text-sm text-zinc-400 sm:text-base">
              We don&apos;t just install hardware. We build resilient, self-healing ecosystems that scale effortlessly as your footprint grows.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURE_PILLARS.map((pillar, index) => (
              <div
                key={pillar.title}
                className={cn(
                  'reveal-item rounded-2xl border border-zinc-800 bg-[#09090B] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/40 hover:shadow-xl hover:shadow-zinc-800/10',
                  revealDelayClass(index * 90)
                )}
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${pillar.accent}`}>
                  <pillar.icon size={22} className="text-zinc-200" />
                </div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">{pillar.desc}</p>
                <Link
                  href={pillar.href}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Explore <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#09090B]/40 py-12 sm:py-24 reveal-section is-revealed" data-reveal-id="plans" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="container mx-auto grid gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div className={cn('reveal-item relative rounded-3xl border border-zinc-800 bg-[#09090B] p-5 sm:p-10', revealDelayClass(0))}>
            <div className="ambient-blob pointer-events-none absolute -left-6 top-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-500/5 blur-2xl" aria-hidden="true"></div>
            <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute -bottom-8 right-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-zinc-800/10 blur-2xl" aria-hidden="true"></div>
            <h3 className="text-2xl font-semibold text-white sm:text-3xl">Operational clarity, not complexity.</h3>
            <p className="mt-4 text-sm text-zinc-400 sm:text-base">
              Build a secure foundation with a service model that keeps technology dependable and aligned with your goals.
            </p>
            <div className="mt-6 grid gap-4">
              {['Unified monitoring', 'Actionable reporting', 'Hands-on lifecycle support'].map((item, index) => (
                <div key={item} className={cn('reveal-item flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300', revealDelayClass(100 + index * 70))}>
                  <Layers size={16} className="text-blue-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className={cn('space-y-6 reveal-item', revealDelayClass(80))}>
            <div>
              <span className="text-xs uppercase tracking-[0.4em] text-blue-500">Plans</span>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Uptime is not optional.</h2>
              <p className="mt-4 text-sm text-zinc-400 sm:text-base">
                Choose the level of coverage that matches your footprint. Upgrade as your infrastructure grows.
              </p>
            </div>
            <div className="grid gap-4">
              {PLAN_TIERS.map((plan, index) => (
                <div
                  key={plan.name}
                  className={cn(
                    'reveal-item rounded-2xl border px-6 py-5 transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between',
                    plan.highlight
                      ? 'border-blue-500/30 bg-blue-500/5 shadow-sm'
                      : 'border-zinc-800 bg-[#09090B]',
                    revealDelayClass(140 + index * 90)
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{plan.summary}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-400">{plan.priceLabel}</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-zinc-300">
                      {plan.items.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-zinc-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-800">
                    <Link
                      href={`/contact?subject=sales&service=amc_service&intent=amc_quote&message=I%20am%20interested%20in%20the%20${plan.name}%20plan.%20Please%20contact%20me.`}
                      className={cn(
                        "inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                        plan.highlight
                          ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-500"
                          : "border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800"
                      )}
                    >
                      {plan.highlight ? "Secure My Operations" : "Lock In Coverage"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#09090B] py-12 sm:py-24 reveal-section is-revealed" data-reveal-id="hardware" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="container mx-auto px-6">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.4em] text-blue-500">Storefront</span>
              <h2 className="mt-3 text-3xl font-semibold text-white">Featured hardware</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Browse catalog <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {initialProducts.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-zinc-800 bg-[#09090B] p-8 text-center text-zinc-500">
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
                <div key={product.id} className={cn('reveal-item rounded-2xl border border-zinc-800 bg-[#09090B] p-5 transition duration-300 hover:-translate-y-1 hover:border-zinc-700/40 flex flex-col justify-between', revealDelayClass(index * 90))}>
                  <Link href={`/products/${product.id}`} className="group/product-link block">
                    <div className="group/product relative mb-4 flex h-32 sm:h-40 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 p-2 border border-zinc-800">
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
                        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-2 border border-zinc-850 rounded-xl text-zinc-500 hover:text-blue-500 hover:border-blue-500/20 transition-all duration-300">
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
                      className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-semibold text-white hover:border-blue-500/30 transition-colors"
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#09090B]/50 border-t border-zinc-800 py-12 sm:py-24 reveal-section is-revealed" data-reveal-id="about" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-zinc-400 space-y-6 text-sm sm:text-base leading-relaxed">
            <h2 className="text-3xl font-semibold text-white mb-8">Goa & Maharashtra’s Trusted Technology Integrator</h2>
            <p>
              At TecBunny Solutions, we design, deploy, and manage professional technology systems that protect your premises, keep your networks reliable, and automate your environment. Working closely with leading security and network brands, we deliver customized security and IT solutions for hospitality venues, retail shops, industrial spaces, and residential properties across Goa and Maharashtra.
            </p>
            <p>
              Our security architectures are built with enterprise-grade equipment from CP Plus, Hikvision, and Dahua, offering high-definition IP cameras, smart perimeter security, and secure local or cloud NVR systems. We customize camera placement and coverage to ensure complete visual security and 24/7 reliability.
            </p>
            <p>
              For IT infrastructure, our engineers design high-performance wired and wireless networks, structured cabling layouts, and server setups to ensure zero-bottleneck operations. Backed by our proactive Annual Maintenance Contracts (AMC) and on-site support guarantees, we keep your business systems secure and running smoothly at all times.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#09090B] border-t border-zinc-800 py-12 sm:py-24 reveal-section is-revealed" data-reveal-id="cta" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-8 md:p-10">
            <div className="ambient-blob pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" aria-hidden="true"></div>
            <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute -bottom-20 right-0 h-40 w-40 rounded-full bg-zinc-800/10 blur-3xl" aria-hidden="true"></div>
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className={cn('reveal-item', revealDelayClass(0))}>
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
                  <Sparkles size={14} /> Ready when you are
                </span>
                <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">Stop guessing with your security.</h3>
                <p className="mt-4 text-sm text-zinc-400 sm:text-base">
                  Share your requirements and we will map a secure, scalable setup tailored to your environment.
                </p>
              </div>
              <div className={cn('reveal-item rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 text-center', revealDelayClass(120))}>
                <p className="text-sm text-zinc-500">Talk to an advisor</p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-colors"
                >
                  Claim Your Free Security Audit
                </Link>
                <p className="mt-3 text-xs text-zinc-500">Response window: same business day</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
