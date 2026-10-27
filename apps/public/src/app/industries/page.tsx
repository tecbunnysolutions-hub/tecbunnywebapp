import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  Briefcase,
  Award,
  Activity,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Server,
  Lock,
  Wifi
} from 'lucide-react';
import { Button } from '@tecbunny/ui';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from "@tecbunny/core/brand";
import { TrustSection } from '@/components/TrustSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Industry Solutions | Technology Infrastructure | TecBunny',
    description: 'Tailored technology infrastructure, networking, security, and smart building solutions for hotels, corporate offices, healthcare, schools, and retail in Goa.',
    keywords: [
      'industry technology solutions',
      'hotel IT infrastructure Goa',
      'office networking Goa',
      'school CCTV installation',
      'hospital IT network Goa',
      'retail POS networking',
      'TecBunny'
    ],
    path: '/industries',
    image: BRAND_LOGO_URL,
  });
}

const INDUSTRIES = [
  {
    key: 'hospitality',
    title: 'Hospitality & Resorts',
    desc: 'High-density guest Wi-Fi, RFID door locks, ColorVu IP security, and smart room automation for luxury hotels and resorts across Goa.',
    href: '/industries/hospitality',
    icon: Building2,
    highlights: ['Property-Wide Guest Wi-Fi', 'Contactless RFID Keycards', 'Pool & Perimeter CCTV', 'GRMS Energy Automation'],
    badge: 'Popular Vertical'
  },
  {
    key: 'offices',
    title: 'Corporate Offices & Co-working',
    desc: 'High-speed Wi-Fi 6, clean server rack architectures, biometric attendance, and redundant dual-ISP failover for modern workspaces.',
    href: '/industries/offices',
    icon: Briefcase,
    highlights: ['Multi-WAN Auto Failover', 'Biometric & RFID Turnstiles', 'Cat6 Structured Cabling', 'Network Bandwidth Throttling'],
    badge: 'Enterprise Focus'
  },
  {
    key: 'education',
    title: 'Education & Campuses',
    desc: 'Comprehensive campus-wide wireless coverage, computer lab networking, content-filtering firewalls, and perimeter surveillance for schools.',
    href: '/industries/education',
    icon: Award,
    highlights: ['Content Filtering Firewalls', 'Campus Surveillance Networks', 'Computer Lab Cabling', 'Visitor Access Management'],
    badge: 'Institutional'
  },
  {
    key: 'healthcare',
    title: 'Healthcare & Hospitals',
    desc: 'Strictly segregated, privacy-focused clinical VLANs, UPS-backed server setups, and dependable support for clinics and diagnostic centers.',
    href: '/industries/healthcare',
    icon: Activity,
    highlights: ['Isolated Patient Data VLANs', 'UPS Battery Redundancy', 'Restricted Area Smart Locks', 'Continuous HD Recording'],
    badge: 'Mission Critical'
  },
  {
    key: 'retail',
    title: 'Retail & Commercial',
    desc: 'High-uptime POS connectivity, anti-theft HD surveillance feeds, customer guest Wi-Fi portals, and multi-store central monitoring.',
    href: '/industries/retail',
    icon: ShoppingBag,
    highlights: ['POS Line Redundancy', 'Loss Prevention Cameras', 'Captive Guest Portals', 'Centralized Store Analytics'],
    badge: 'Commercial'
  },
  {
    key: 'builders',
    title: 'Builders & Real Estate Developers',
    desc: 'Pre-construction structured cabling, fiber risers, automated vehicle gates, and turn-key builder technology commissioning.',
    href: '/industries/builders',
    icon: Building2,
    highlights: ['Low-Voltage CAD Schematics', 'Vertical Fiber Risers', 'Perimeter ANPR & Barriers', 'As-Built Cable Certification'],
    badge: 'Pre-Construction'
  }
];

export default function IndustriesIndexPage() {
  return (
    <div className="relative min-h-screen bg-card text-muted-foreground selection:bg-primary/20 selection:text-primary overflow-hidden tb-page-bottom">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Industries', url: 'https://www.tecbunny.com/industries' },
        ]}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--overlay))_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[48rem] w-[48rem] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/4 h-[50rem] w-[50rem] rounded-full bg-primary/5 blur-[180px]" />
      </div>

      {/* Header Hero */}
      <section className="relative tb-subpage-hero border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Building2 size={14} />
              <span>Tailored B2B Technology Architectures</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-tech leading-tight text-foreground">
              Industry-Specific <br />
              <span className=" text-primary">
                Technology Solutions
              </span>
            </h1>

            <p className="text-base sm:text-lg font-light leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Every vertical faces distinct operational challenges. We engineer tailored networking, physical security, access control, and automation systems aligned with your industry requirements.
            </p>

            <div className="pt-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary text-primary-foreground font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-primary/20">
                <Link href="/assessment">Request Industry Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="tb-section-space">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.key}
                  className="rounded-3xl border border-border bg-background/60 p-8 flex flex-col justify-between transition-all duration-300 hover:border-primary/30 hover:bg-card/20 group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                        <Icon size={28} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-border bg-card/80 text-muted-foreground font-mono">
                        {ind.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-foreground font-tech">
                        {ind.title}
                      </h2>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                        {ind.desc}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Key Capabilities:</span>
                      <ul className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
                        {ind.highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary text-primary-foreground" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border">
                    <Link
                      href={ind.href}
                      className="w-full flex items-center justify-between py-2.5 text-xs font-bold uppercase tracking-wider text-primary group-hover:text-foreground transition-colors"
                    >
                      <span>Explore {ind.title} Solutions</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process pointer + trust — compact; per-industry detail lives on each vertical landing page,
          full lifecycle on /services#process */}
      <HowItWorksSection
        variant="canonical-link"
        title="How industry deployments run"
        subtitle="Every vertical follows our structured 8-step engineering lifecycle."
      />
      <TrustSection variant="compact" />
    </div>
  );
}
