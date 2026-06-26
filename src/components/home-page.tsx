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

const DynamicBehavioralCouponPopup = dynamic(() => import('./BehavioralCouponPopup').then(mod => mod.BehavioralCouponPopup), { ssr: false });
const DynamicAmbientEffects = dynamic(() => import('./home/AmbientEffects').then(mod => mod.AmbientEffects), { ssr: false });
const DynamicHeroVisuals = dynamic(() => import('./home/HeroVisuals').then(mod => mod.HeroVisuals), { ssr: false });

const AddToCartButton = dynamic(
  () => import('@/components/cart/AddToCartButton').then((module) => module.AddToCartButton),
  { ssr: false }
);

const HeroCarousel = dynamic(() => import('./HeroCarousel'), {
  loading: () => (
    <section className="py-10 sm:py-14" aria-hidden="true">
      <div className="container mx-auto px-4">
        <div className="h-[340px] sm:h-[420px] w-full animate-pulse rounded-lg bg-slate-900/60 border border-white/5" />
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

      <section className="relative flex min-h-[86vh] items-center overflow-hidden py-20 sm:py-28 lg:py-32">
        <DynamicAmbientEffects />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.06] brightness-100 contrast-150" />

        <div className="tb-container relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] xl:gap-16">
            <div className="reveal-section is-revealed max-w-3xl space-y-8" data-reveal-id="hero-copy">
              <h1 className="text-4xl font-extrabold leading-[1.02] text-white sm:text-5xl md:text-6xl xl:text-7xl font-tech tracking-tight" aria-label="Bulletproof IT and Unblinking Security">
                <span className="glitch-text block pb-3 text-blue-400" data-text="Bulletproof IT.">Bulletproof IT.</span>
                <span className="block text-zinc-100">
                  Unblinking Security.
                </span>
              </h1>

              <HeroRotator />

              <p className="tb-lede max-w-2xl text-lg sm:text-xl">
                Enterprise-grade CCTV, network infrastructure, and smart automation for Goa & Maharashtra. Engineered for zero downtime. Priced for aggressive growth.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <MagneticButton
                  href="/contact"
                  className="tb-button-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#09090B]"
                >
                  Build My Setup
                </MagneticButton>
                <MagneticButton
                  href="/services"
                  className="tb-button-secondary"
                >
                  See What We Do
                </MagneticButton>
              </div>

              <div className="grid max-w-md grid-cols-2 gap-6 border-t border-zinc-800/80 pt-8">
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
                Build Your Defenses. <br />
                <span className="text-zinc-200">Name Your Price.</span>
              </h2>
              <p className="tb-lede max-w-2xl text-base">
                Stop waiting days for bloated sales quotes. Use our live configurator to architect your exact security ecosystem, see transparent retail pricing, and submit a custom bid directly to our engineers.
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
                    <p className="text-xs text-zinc-500 mt-1">Tell us what you want to pay. Our system reviews and counter-offers in minutes.</p>
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
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Infrastructure that never sleeps.</h2>
            <p className="tb-lede mt-4 text-sm sm:text-base">
              We don&apos;t just install hardware. We build resilient, self-healing ecosystems that scale effortlessly as your footprint grows.
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

      <section className="tb-section reveal-section is-revealed" data-reveal-id="plans" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <div className="tb-container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className={cn('tb-panel reveal-item relative p-5 sm:p-10', revealDelayClass(0))}>
            <h3 className="text-2xl font-semibold text-white sm:text-3xl">Operational clarity, not complexity.</h3>
            <p className="tb-lede mt-4 text-sm sm:text-base">
              Build a secure foundation with a service model that keeps technology dependable and aligned with your goals.
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
              <h2 className="mt-3 text-3xl font-semibold text-white">Featured hardware</h2>
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
                    <div className="group/product relative mb-4 flex h-32 sm:h-40 items-center justify-center overflow-hidden rounded-lg bg-zinc-900 p-2 border border-zinc-800">
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

      <section className="tb-section reveal-section is-revealed" data-reveal-id="about" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
        <div className="tb-container">
          <div className="mx-auto max-w-4xl space-y-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
            <h2 className="text-3xl font-semibold text-white mb-8">Goa & Maharashtra’s Trusted Technology Integrator</h2>
            <p>
              At TecBunny Solutions, we design, deploy, and manage professional technology systems that protect your premises, keep your networks reliable, and automate your environment. Working closely with leading security and network brands, we deliver customized security and IT solutions for hospitality venues, retail shops, industrial spaces, and residential properties across Goa and Maharashtra.
            </p>
            <p>
              Our security architectures are built with enterprise-grade equipment from CP Plus, Hikvision, and Dahua, offering high-definition IP cameras, smart perimeter security, and secure local or cloud NVR systems. We customize camera placement and coverage to ensure complete visual security and 24/7 reliability.
            </p>
            <p>
              For IT infrastructure, our engineers design high-performance wired and wireless networks, structured cabling layouts, and server setups to ensure zero-bottleneck operations. We also offer proactive Annual Maintenance Contracts (AMC) for IT, CCTV, and RFID Lock Systems, keeping your business systems secure and running smoothly at all times.
            </p>
          </div>
        </div>
      </section>

      <section className="tb-section reveal-section is-revealed" data-reveal-id="cta" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
        <div className="tb-container">
          <div className="tb-panel relative overflow-hidden p-6 sm:p-8 md:p-10">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className={cn('reveal-item', revealDelayClass(0))}>
                <span className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  <Sparkles size={14} /> Ready when you are
                </span>
                <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">Stop guessing with your security.</h3>
                <p className="tb-lede mt-4 text-sm sm:text-base">
                  Share your requirements and we will map a secure, scalable setup tailored to your environment.
                </p>
              </div>
              <div className={cn('reveal-item rounded-lg border border-zinc-800 bg-zinc-950/80 p-6 text-center', revealDelayClass(120))}>
                <p className="text-sm text-zinc-500">Talk to an advisor</p>
                <Link
                  href="/contact"
                  className="tb-button-primary mt-4 w-full"
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
