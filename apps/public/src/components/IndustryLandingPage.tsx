'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  PhoneCall, 
  HelpCircle,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@tecbunny/ui';
import { useAnalytics } from '@tecbunny/core';
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { TrustSection } from '@/components/TrustSection';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

export interface IndustryProblem {
  title: string;
  desc: string;
  impact: string;
}

export interface IndustrySolution {
  title: string;
  desc: string;
  points: string[];
  icon: LucideIcon;
}

export interface IndustryServiceLink {
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
}

export interface IndustryFaq {
  question: string;
  answer: string;
}

export interface IndustryLandingPageProps {
  industryKey: string;
  badge: string;
  title: string;
  subtitle: string;
  heroLede: string;
  primaryCtaText: string;
  problemsTitle: string;
  problemsSubtitle: string;
  problems: IndustryProblem[];
  solutionsTitle: string;
  solutionsSubtitle: string;
  solutions: IndustrySolution[];
  servicesTitle: string;
  services: IndustryServiceLink[];
  caseStudy?: {
    title: string;
    location: string;
    challenge: string;
    solution: string;
    outcome: string;
  };
  faqs: IndustryFaq[];
}

export function IndustryLandingPage({
  industryKey,
  badge,
  title,
  subtitle,
  heroLede,
  primaryCtaText,
  problemsTitle,
  problemsSubtitle,
  problems,
  solutionsTitle,
  solutionsSubtitle,
  solutions,
  servicesTitle,
  services,
  caseStudy,
  faqs,
}: IndustryLandingPageProps) {
  const { trackEvent } = useAnalytics();

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pb-20">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <WhatsAppFloatingButton defaultContext={badge} defaultService={badge} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>{badge}</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              {title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                {subtitle}
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              {heroLede}
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-500/20 text-sm h-12">
                <Link 
                  href="#assessment-funnel"
                  onClick={() => trackEvent('industry_cta_clicked', { industry: industryKey, ctaLocation: 'hero_primary', ctaText: primaryCtaText })}
                >
                  {primaryCtaText}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl px-8 text-sm h-12">
                <Link 
                  href="#solutions-section"
                  onClick={() => trackEvent('industry_cta_clicked', { industry: industryKey, ctaLocation: 'hero_secondary', ctaText: 'Explore Solutions' })}
                >
                  Explore Industry Solutions &darr;
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Points Section */}
      <section className="py-16 sm:py-20 border-b border-zinc-900 bg-zinc-950/40">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-red-400 font-mono flex items-center gap-2">
              <AlertTriangle size={14} /> Critical Challenges
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              {problemsTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              {problemsSubtitle}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((prob, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-red-500/10 bg-red-950/10 p-6 flex flex-col justify-between transition-all hover:border-red-500/25"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
                    Pain Point {idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-white font-tech">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {prob.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-red-500/10 text-[11px] text-zinc-400 font-medium">
                  <strong className="text-red-300">Business Impact:</strong> {prob.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrated Solutions Grid */}
      <section id="solutions-section" className="py-16 sm:py-20">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono">
              Engineered Architecture
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              {solutionsTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              {solutionsSubtitle}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {solutions.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-850 bg-zinc-950/60 p-8 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30 group"
                >
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-xl font-bold text-white font-tech">
                      {sol.title}
                    </h3>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                      {sol.desc}
                    </p>

                    <ul className="space-y-2.5 pt-2 border-t border-zinc-900">
                      {sol.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Relevant Services Strip */}
      <section className="py-12 border-y border-zinc-900 bg-zinc-950/60">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-500 font-mono">
              Core Capabilities
            </span>
            <h3 className="text-xl font-bold text-white font-tech mt-1">
              {servicesTitle}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <Link
                  key={idx}
                  href={srv.href}
                  className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/60 group block"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 group-hover:text-white group-hover:bg-blue-600 transition-colors">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {srv.title}
                      </h4>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        View Service &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Structured 8-Step Lifecycle */}
      <HowItWorksSection />

      {/* Genuine Case Study Section (if available) */}
      {caseStudy && (
        <section className="py-16 sm:py-20 border-t border-zinc-900">
          <div className="container mx-auto px-6 max-w-screen-2xl">
            <div className="rounded-3xl border border-zinc-850 bg-gradient-to-br from-zinc-950 via-zinc-900/40 to-zinc-950 p-8 sm:p-12">
              <div className="max-w-3xl space-y-6">
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-400 font-mono flex items-center gap-2">
                  <ShieldCheck size={16} /> Verified Deployment Case Study
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-tech">
                  {caseStudy.title}
                </h3>
                <span className="text-xs text-zinc-400 font-mono block">
                  Location: {caseStudy.location}
                </span>

                <div className="grid gap-6 sm:grid-cols-3 pt-4 border-t border-zinc-850">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">The Challenge</h4>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">{caseStudy.challenge}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">The Solution</h4>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">{caseStudy.solution}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">The Outcome</h4>
                    <p className="text-xs text-emerald-400 font-medium leading-relaxed">{caseStudy.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <TrustSection />

      {/* Industry FAQ Section with JSON-LD Schema */}
      <section className="py-16 sm:py-20 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono flex items-center gap-2">
              <HelpCircle size={14} /> Clear Answers
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              Frequently Asked Questions: {badge}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              Common questions answered by our solutions engineering team.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-zinc-850 bg-zinc-950/60 p-6 space-y-2"
              >
                <h3 className="text-sm font-bold text-white font-tech">
                  {faq.question}
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* FAQ JSON-LD Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                  },
                })),
              }),
            }}
          />
        </div>
      </section>

      {/* Assessment Funnel Section */}
      <section id="assessment-funnel" className="py-16 sm:py-24">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono">
              Free Site Survey & Consultation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              Get Your {badge} Technology Assessment
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">
              Tell us about your property layout and requirements. Our engineering team will review your specifications and schedule a site survey.
            </p>
          </div>

          <TechnologyAssessmentFunnel 
            defaultIndustry={badge} 
            sourceContext={`industry_${industryKey}`} 
          />
        </div>
      </section>
    </div>
  );
}
