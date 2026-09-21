'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Server,
  Zap,
  Layers,
  Building2,
  Activity,
  ShoppingBag,
  Wifi,
  Clock,
  Lock,
  Cpu
} from 'lucide-react';

import { cn, revealDelayClass } from "@tecbunny/core/utils";
import { COMPANY_STATS } from '@tecbunny/core/company-stats';
import { OptimizedImage, Button } from "@tecbunny/ui";
import { RegionalTrustBanner } from './RegionalTrustBanner';
import { HeroRotator } from './home/HeroRotator';
import { HowItWorksSection } from './HowItWorksSection';

const DynamicBehavioralCouponPopup = dynamic(() => import('./BehavioralCouponPopup').then(mod => mod.BehavioralCouponPopup), { ssr: false });
const DynamicAmbientEffects = dynamic(() => import('./home/AmbientEffects').then(mod => mod.AmbientEffects), { ssr: false });
const DynamicHeroVisuals = dynamic(() => import('./home/HeroVisuals').then(mod => mod.HeroVisuals), { ssr: false });

// Below-the-fold sections are code-split into separate chunks but still server-rendered for SEO.
const HeroCarousel = dynamic(() => import('./HeroCarousel'));
const CaseStudySection = dynamic(() => import('./CaseStudySection').then(mod => mod.CaseStudySection));

// Canonical solutions taxonomy — mirrors the Solutions menu in the site header
// (components/layout/Header.tsx navLinks) so homepage pillars never diverge from nav.
const FEATURE_PILLARS = [
  {
    title: 'Network & IT Infrastructure',
    desc: 'Structured cabling, Wi-Fi 6, VLANs, firewalls, and managed switching.',
    icon: Server,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/network-infrastructure',
  },
  {
    title: 'Physical Security & CCTV',
    desc: 'IP surveillance, NVR/DVR systems, perimeter monitoring, and low-light cameras.',
    icon: ShieldCheck,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/physical-security',
  },
  {
    title: 'Smart Access Control',
    desc: 'RFID keycards, biometric terminals, smart door locks, and visitor management.',
    icon: Lock,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/smart-access-control',
  },
  {
    title: 'Smart Infrastructure for Hotels',
    desc: 'Guest-room automation, GRMS energy control, and hospitality integrations.',
    icon: Building2,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/smart-infrastructure',
  },
  {
    title: 'Lifecycle Hardware Management',
    desc: 'Enterprise procurement, workstation staging, AMC support, and secure asset refresh.',
    icon: Cpu,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/lifecycle-hardware',
  },
  {
    title: 'Software & System Administration',
    desc: 'Patch audits, backups, endpoint security, and remote system administration.',
    icon: Layers,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/services/software-system-admin',
  },
  {
    title: 'Enterprise Redundancy Solutions',
    desc: 'Dual-ISP failover, UPS power conditioning, and business-continuity engineering.',
    icon: Zap,
    accent: 'from-zinc-900 to-zinc-950',
    href: '/solutions',
  },
];

export default function HomePage({
  initialPartnerBrands = [],
  initialHeroCarousel = null,
}: {
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
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">
                <ShieldCheck size={13} />
                Enterprise IT &amp; security partner in Goa
              </div>

              <h1 className="text-3xl font-extrabold leading-[0.98] text-white sm:text-4xl md:text-5xl xl:text-6xl font-tech tracking-tight" aria-label="Secure operations. Smarter systems. Built for business continuity.">
                <span className="glitch-text block pb-3 text-blue-400" data-text="Secure operations.">Secure operations.</span>
                <span className="block text-zinc-100">Smarter systems.</span>
              </h1>

              <HeroRotator />

              <p className="tb-lede max-w-2xl text-base sm:text-xl text-zinc-300">
                TecBunny helps hotels, offices, clinics, schools, and growing businesses in Goa and Maharashtra keep their CCTV, networks, smart access, and IT systems running securely with clear support and practical upgrades.
              </p>

              <ul className="grid gap-2 pl-5 text-sm text-zinc-300 sm:grid-cols-2">
                <li className="list-disc">CCTV, NVR and access-control installations</li>
                <li className="list-disc">Wi‑Fi, LAN and structured cabling design</li>
                <li className="list-disc">Managed IT support and AMC care plans</li>
                <li className="list-disc">Smart infrastructure for hospitality and offices</li>
              </ul>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-zinc-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5">
                  <ShieldCheck size={12} className="text-blue-400" /> Professional installations
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5">
                  <Clock size={12} className="text-blue-400" /> Fast site response
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5">
                  <Wifi size={12} className="text-blue-400" /> Network-first support
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-12 px-6 text-sm shadow-xl shadow-blue-500/25">
                  <Link href="/assessment">
                    GET YOUR FREE TECHNOLOGY ASSESSMENT &rarr;
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold rounded-xl h-12 px-5 text-xs">
                  <Link href="/contact?subject=sales&service=enterprise_solutions&intent=enterprise_consultation&source=homepage_hero">
                    TALK TO AN ENGINEER
                  </Link>
                </Button>
              </div>

              <div className="rounded-xl border border-zinc-850 bg-zinc-950/70 p-3.5">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-400 block mb-1.5">Free Assessment Includes:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Site &amp; cabling review</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Security coverage check</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Network bottleneck audit</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Hardware recommendations</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Technology upgrade roadmap</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Itemized budget estimate</span>
                </div>
              </div>

              <div className="grid gap-4 pt-2 sm:grid-cols-3">
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
                    Talk to an Engineer
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

              <div className="grid max-w-lg grid-cols-3 gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="group border-r border-zinc-800 pr-3 last:border-r-0 last:pr-0">
                  <p className="text-2xl font-black text-white font-tech group-hover:text-blue-400 transition-colors">{COMPANY_STATS.sitesSecured}+</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Sites secured</p>
                </div>
                <div className="group border-r border-zinc-800 pr-3 last:border-r-0 last:pr-0">
                  <p className="text-2xl font-black text-white font-tech group-hover:text-blue-400 transition-colors">{COMPANY_STATS.supportAvailability}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Remote support</p>
                </div>
                <div className="group">
                  <p className="text-2xl font-black text-white font-tech group-hover:text-blue-400 transition-colors">Goa</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Coverage</p>
                </div>
              </div>
            </div>

            <DynamicHeroVisuals />
          </div>
        </div>
      </section>

      {/* The configurator is a standalone application at /customised-setups —
          the homepage only links to it and ships zero configurator code. */}
      <section className="tb-section relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '120px' }}>
        <div className="tb-container relative z-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-zinc-950/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-blue-400 sm:mt-0" />
              <p className="text-sm text-zinc-300">
                <span className="font-semibold text-white">Custom IT configurator:</span>{' '}
                design your setup, name your price, and download a formal PDF quote on the dedicated tool.
              </p>
            </div>
            <Link href="/customised-setups" className="tb-button-primary shrink-0">
              Open Configurator
              <ArrowRight size={16} className="ml-2" />
            </Link>
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
              Product Brands We Deploy
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
            <span className="tb-kicker">Solutions</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">What services does TecBunny provide?</h2>
            <p className="tb-lede mt-4 text-sm sm:text-base">
              We cover the core technology layers businesses rely on most: network cabling, CCTV, access control, smart infrastructure, and managed IT support.
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
            <Link
              href="/services"
              className={cn(
                'tb-card reveal-item flex flex-col items-start justify-between border-dashed p-6 transition-colors hover:border-blue-500/40',
                revealDelayClass(FEATURE_PILLARS.length * 90)
              )}
            >
              <span className="text-lg font-semibold text-white">View all solutions &amp; services</span>
              <span className="mt-6 tb-text-link text-xs uppercase tracking-[0.2em]">
                All Solutions <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Enterprise service tracks — the canonical capability hubs. Detailed,
          keyword-specific content (CCTV pricing, Wi-Fi setup, AMC scope,
          smart-home/SMB services) lives on the linked service pages, not here. */}
      <section className="tb-section reveal-section is-revealed" data-reveal-id="service-tracks" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <div className="tb-container">
          <div className="mb-10 max-w-2xl">
            <span className="tb-kicker">What we deliver</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">What does TecBunny deliver for businesses in Goa?</h2>
            <p className="tb-lede mt-4 text-sm sm:text-base">
              We bring together network, security, automation, and managed support into one accountable delivery model with clear service phases and support coverage.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Network &amp; IT Infrastructure</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Structured cabling, high-density Wi-Fi, VLAN segmentation, and managed switching for offices, hotels, and clinics across Goa.
              </p>
              <Link href="/services/network-infrastructure" className="tb-text-link text-xs uppercase tracking-[0.2em] inline-flex items-center gap-1.5">
                Explore network infrastructure <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Physical Security &amp; CCTV</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                IP surveillance, NVR/DVR systems, perimeter monitoring, and low-light camera coverage engineered per site.
              </p>
              <Link href="/services/physical-security" className="tb-text-link text-xs uppercase tracking-[0.2em] inline-flex items-center gap-1.5">
                Explore security &amp; CCTV <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Smart Access &amp; Building Automation</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                RFID keycards, biometric terminals, smart locks, and guest-room automation for hospitality and commercial properties.
              </p>
              <Link href="/services/smart-access-control" className="tb-text-link text-xs uppercase tracking-[0.2em] inline-flex items-center gap-1.5">
                Explore access control <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Lifecycle Hardware &amp; Managed IT</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Procurement, staging, AMC maintenance, and secure asset refresh — managed IT support with defined response SLAs.
              </p>
              <Link href="/services/lifecycle-hardware" className="tb-text-link text-xs uppercase tracking-[0.2em] inline-flex items-center gap-1.5">
                Explore lifecycle &amp; AMC <ChevronRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className="tb-section reveal-section is-revealed" data-reveal-id="hardware" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
        <div className="tb-container">
          <div className="tb-panel flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="tb-kicker">Storefront</span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">Need hardware?</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Browse our catalog of business hardware — CCTV kits, NVRs, laptops, and core components. Genuine products, GST invoice, and delivery eligibility confirmed at checkout.
              </p>
            </div>
            <Link href="/products" className="tb-button-secondary shrink-0 inline-flex items-center gap-2">
              Browse Hardware <ArrowRight size={16} />
            </Link>
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
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/30 p-7 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
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

      {/* B2B case studies — full 8-step lifecycle and trust details live on /assessment and /industries */}
      <CaseStudySection />

      {/* 4-step delivery summary — the complete 8-step lifecycle lives on /services#process */}
      <HowItWorksSection
        variant="summary"
        title="How We Deliver"
        subtitle="Four accountable phases from first survey to continuous SLA care."
      />

      <section className="tb-section reveal-section is-revealed" data-reveal-id="about" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
        <div className="tb-container">
          <div className="mx-auto max-w-4xl space-y-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
            <h2 className="text-3xl font-semibold text-white mb-8 font-tech">One Team, One Partner for All Your IT and Tech Needs</h2>
            <p>
              At TecBunny, we are a team of CCTV experts, IT engineers, and support staff. We started by fitting CCTV cameras and access control for hotels, hospitals, schools, and offices — today we run full IT systems, keep your data safe, and link CCTV, networks, and smart office tools to work as one. One team, one point of call, in Goa and across India.
            </p>
            <p>
              We deploy genuine enterprise hardware from Hikvision, Dahua, CP Plus, Cisco, Ubiquiti, and Fortinet through established distribution channels. Based in Pernem, North Goa, we know local conditions — humidity, power cuts, and dust — and every job comes with a clear SLA, fair pricing, and one account manager.
            </p>
          </div>
        </div>
      </section>

      <section className="tb-section reveal-section is-revealed" data-reveal-id="faq" style={{ contentVisibility: 'auto', containIntrinsicSize: '700px' }}>
        <div className="tb-container">
          <div className="mb-10 max-w-2xl">
            <span className="tb-kicker">FAQ</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl font-tech">How do businesses in Goa choose the right IT and security partner?</h2>
          </div>
          <dl className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you set up Wi-Fi networks in Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We set up Wi-Fi, LAN networks, and cable runs for offices, hotels, and commercial properties across Goa. We use Ubiquiti, Cisco, and Fortinet gear. Every network job comes with a 90-day free support period and a full handover report.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">What does an AMC plan cover?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">An AMC (Annual Maintenance Contract) covers your CCTV or IT kit for the full year. It can include planned check-ups, remote support, on-site fixes, and audit reports, with response targets defined in your plan. It helps reduce ad hoc repairs and keeps your gear maintained.</dd>
            </div>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <dt className="text-sm font-semibold text-white">Do you serve areas outside Goa?</dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">Yes. We serve clients in Mumbai, Pune, and Nashik for large IT and CCTV jobs. We also run remote IT support for firms across India. For jobs outside Goa, we can send a team or work with a local vendor under our watch. Call us to get a fast quote.</dd>
            </div>
          </dl>
          <p className="mt-8 text-sm text-zinc-500">
            More questions?{' '}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
              See all FAQs or ask us directly &rarr;
            </Link>
          </p>
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
                  Request a free, no-obligation technology assessment. Our engineering team will review your property blueprint, calculate network density, and provide an itemized proposal within 24 hours.
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
