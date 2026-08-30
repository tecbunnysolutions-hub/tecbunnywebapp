'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';
import { Button } from '@tecbunny/ui';
import { useAnalytics } from '@tecbunny/core';

export interface CaseStudy {
  id: string;
  clientType: string;
  industry: string;
  location: string;
  challenge: string;
  environment: string;
  approach: string;
  solution: string;
  implementation: string;
  result: string;
  technologies: string[];
}

export const ARCHITECTURE_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'hospitality-coastal-resort',
    clientType: 'Boutique Luxury Resort',
    industry: 'Hospitality',
    location: 'North Goa (Coastal Belt)',
    challenge: 'Guest Wi-Fi signal dropouts caused by dense laterite walls and salt-mist corrosion degrading outdoor analog security cameras.',
    environment: '45-key property with outdoor pool, beachfront restaurant, and thick 400mm laterite stone masonry.',
    approach: 'High-density Wi-Fi 6 heatmapping with dedicated ceiling access points per cluster and IP67 weather-sealed low-light ColorVu IP cameras.',
    solution: 'Gigabit fiber backbone connecting Ubiquiti UniFi 6 APs, isolated Guest/POS/Admin VLANs, and 4K IP NVR with RAID-1 redundancy.',
    implementation: 'Staged 4-day deployment during low-occupancy window with structured Cat6 LSZH cabling in concealed PVC conduits.',
    result: '100% property-wide Wi-Fi coverage with zero guest dead zones, isolated POS billing security, and clear 24/7 low-light perimeter surveillance.',
    technologies: ['Wi-Fi 6 (802.11ax)', 'ColorVu IP Cameras', 'VLAN Segmentation', 'PoE+ Managed Switches', 'Cat6 LSZH Cabling']
  },
  {
    id: 'corporate-office-coworking',
    clientType: 'Multi-Tenant Tech Hub',
    industry: 'Corporate Offices',
    location: 'Panaji / Porvorim',
    challenge: 'Unpredictable ISP downtime halting daily video conferences and unmanaged access control leading to security logging gaps.',
    environment: '3-floor facility hosting 80+ daily workstations and shared conference rooms.',
    approach: 'Dual-ISP WAN load balancer with automated sub-second failover and centralized biometric facial recognition attendance.',
    solution: 'Fortinet Next-Gen Firewall with dual fiber links, 48-port Gigabit patch panels, and RFID/biometric door controllers synced with HRMS.',
    implementation: 'Weekend deployment with zero workday operational downtime and full port-mapping documentation handed over.',
    result: 'Zero network interruption during primary ISP outages, sub-second door transit speeds, and exportable employee attendance audit trails.',
    technologies: ['Dual-WAN Auto-Failover', 'Facial Recognition Terminals', '42U Server Rack Cabling', 'Network Bandwidth Throttling']
  }
];

export function CaseStudySection({
  title = "Architecture & Engineering Project Framework",
  subtitle = "How our certified engineers design, deploy, and support mission-critical technology infrastructure across commercial properties in Goa.",
  className = ""
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const { trackEvent } = useAnalytics();

  return (
    <section className={`py-16 sm:py-24 bg-zinc-950 border-t border-zinc-900 ${className}`}>
      <div className="container mx-auto px-6 max-w-screen-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-blue-400 font-mono">
              <Sparkles size={14} /> Project Architecture
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              {title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              {subtitle}
            </p>
          </div>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-lg shadow-blue-500/20 self-start md:self-auto">
            <Link 
              href="/assessment" 
              onClick={() => trackEvent('resource_cta_clicked', { cta: 'request_similar_project', page: 'case_studies' })}
            >
              Request a Similar Project &rarr;
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {ARCHITECTURE_CASE_STUDIES.map((study) => (
            <div 
              key={study.id} 
              className="rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-7 sm:p-9 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 shadow-xl"
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-5">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                      {study.industry}
                    </span>
                    <h3 className="text-xl font-bold text-white font-tech mt-1">
                      {study.clientType}
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-750 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
                    <MapPin size={13} className="text-blue-400" />
                    <span>{study.location}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <div>
                    <span className="font-semibold text-rose-400 uppercase tracking-wider text-[11px] block mb-1">Business Challenge:</span>
                    <p className="text-zinc-300 bg-rose-950/10 border border-rose-900/20 rounded-xl p-3.5">{study.challenge}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-blue-400 uppercase tracking-wider text-[11px] block mb-1">TecBunny Solution &amp; Approach:</span>
                    <p className="text-zinc-300 bg-blue-950/10 border border-blue-900/20 rounded-xl p-3.5">{study.solution}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] block mb-1">Operational Result:</span>
                    <p className="text-zinc-300 bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-3.5">{study.result}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-semibold">Technologies Deployed:</span>
                  <div className="flex flex-wrap gap-2">
                    {study.technologies.map((tech) => (
                      <span key={tech} className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-300 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Facing a similar infrastructure challenge?</span>
                <Link
                  href={`/assessment?industry=${encodeURIComponent(study.industry)}&context=${encodeURIComponent(study.id)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => {
                    trackEvent('case_study_cta_clicked', { caseStudy: study.id, industry: study.industry, ctaLocation: 'case_study_card' });
                    trackEvent('resource_cta_clicked', { cta: 'case_study_assessment', caseStudy: study.id });
                  }}
                >
                  Request a Similar Project &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center text-xs text-zinc-400 max-w-3xl mx-auto">
          <p>
            <strong className="text-zinc-300">Verified Project Framework</strong> — Every case study represents genuine engineering architectures executed by TecBunny Solutions Pvt. Ltd. Specific client entity identities are protected under NDA agreements.
          </p>
        </div>
      </div>
    </section>
  );
}
