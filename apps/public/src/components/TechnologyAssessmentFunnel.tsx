'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Sparkles,
  Server,
  Shield,
  Lock,
  Zap,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button, Input, Textarea, useToast } from '@tecbunny/ui';
import { useAnalytics } from '@tecbunny/core';

export const SERVICE_CATEGORIES = [
  { id: 'network-infrastructure', label: 'Network & IT Infrastructure', icon: Server, desc: 'Structured cabling, managed switches, Wi-Fi 6, firewalls' },
  { id: 'physical-security', label: 'CCTV & Surveillance Systems', icon: Shield, desc: 'IP cameras, NVR storage arrays, perimeter alerts' },
  { id: 'smart-access-control', label: 'Smart Access Control', icon: Lock, desc: 'Biometrics, RFID hotel locks, turnstiles, barrier gates' },
  { id: 'smart-infrastructure', label: 'Complete Smart Infrastructure', icon: Zap, desc: 'Integrated CCTV, locks, lighting automation, and networking' },
  { id: 'lifecycle-hardware', label: 'IT Hardware & Workstations', icon: Cpu, desc: 'Procurement, setup, AMC support, hardware refresh' },
  { id: 'software-system-admin', label: 'System Administration & Cloud', icon: Layers, desc: 'Active Directory, cloud backups, patch management, SLA' },
] as const;

export const INDUSTRY_OPTIONS = [
  'Hospitality (Hotels & Resorts)',
  'Corporate Offices & Co-working',
  'Education (Schools & Colleges)',
  'Healthcare & Clinics',
  'Retail & Commercial Outlets',
  'Real Estate & New Construction',
  'Manufacturing & Warehousing',
  'Other Business Enterprise'
] as const;

export const TIMELINE_OPTIONS = [
  { id: 'immediate', label: 'Immediate (Within 1-2 weeks)', badge: 'Urgent' },
  { id: '1_month', label: 'Within 1 Month', badge: 'Standard' },
  { id: '1_3_months', label: '1 - 3 Months', badge: 'Planning' },
  { id: 'exploring', label: 'Budgeting / Exploring Options', badge: 'Feasibility' }
] as const;

export const SCALE_OPTIONS = [
  'Small (1-20 Users / < 10 Cameras / Single Floor)',
  'Medium (20-100 Users / 10-40 Cameras / Multi-Floor)',
  'Large (100+ Users / 40+ Cameras / Multi-Building / Resort Campus)',
  'Custom Enterprise Scale'
] as const;

interface TechnologyAssessmentFunnelProps {
  defaultService?: string;
  defaultIndustry?: string;
  sourceContext?: string;
  className?: string;
}

export function TechnologyAssessmentFunnel({
  defaultService,
  defaultIndustry,
  sourceContext = 'assessment_page',
  className = ''
}: TechnologyAssessmentFunnelProps) {
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    // Step 1: Requirements
    service: defaultService || 'network-infrastructure',
    timeline: 'immediate',
    currentProblem: '',

    // Step 2: Scale & Industry
    industry: defaultIndustry || 'Hospitality (Hotels & Resorts)',
    scale: 'Medium (20-100 Users / 10-40 Cameras / Multi-Floor)',
    city: 'Goa (North/South)',
    budget: 'Flexible / Proposal Based',

    // Step 3: Contact Details
    name: '',
    company: '',
    email: '',
    phone: '',
    additionalNotes: '',
    privacyConsent: true,
  });

  // Track funnel start
  React.useEffect(() => {
    try {
      trackEvent('assessment_started', {
        source: sourceContext,
        defaultService: defaultService || 'none'
      });
    } catch {
      // safe fallback
    }
  }, [sourceContext, defaultService, trackEvent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.service) {
        toast({
          variant: 'destructive',
          title: 'Select a Service',
          description: 'Please select the primary technology solution you need.',
        });
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!formData.industry || !formData.city) {
        toast({
          variant: 'destructive',
          title: 'Missing Details',
          description: 'Please select your industry and property location.',
        });
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.company.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Contact Fields',
        description: 'Please enter your full name, company name, work email, and phone number.',
      });
      return;
    }

    if (!formData.privacyConsent) {
      toast({
        variant: 'destructive',
        title: 'Privacy Consent Required',
        description: 'Please agree to the privacy policy to proceed with your assessment request.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedServiceObj = SERVICE_CATEGORIES.find(s => s.id === formData.service);
      const serviceTitle = selectedServiceObj ? selectedServiceObj.label : formData.service;

      const formattedMessage = `
--- FREE TECHNOLOGY ASSESSMENT REQUEST ---
Service Requested: ${serviceTitle}
Industry: ${formData.industry}
Property Scale: ${formData.scale}
Location / City: ${formData.city}
Implementation Timeline: ${formData.timeline}
Estimated Budget: ${formData.budget}

Current Problem / Challenges:
${formData.currentProblem.trim() || 'Not specified'}

Additional Notes / Scope:
${formData.additionalNotes.trim() || 'None'}
      `.trim();

      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          company_name: formData.company.trim(),
          subject: `Technology Assessment: ${serviceTitle} - ${formData.company.trim()}`,
          message: formattedMessage,
          service_interest: serviceTitle,
          origin_path: typeof window !== 'undefined' ? window.location.pathname : '/assessment',
          form_identifier: 'technology_assessment_funnel',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment request.');
      }

      setIsSuccess(true);
      trackEvent('assessment_submitted', {
        service: formData.service,
        industry: formData.industry,
        timeline: formData.timeline,
      });

      toast({
        title: 'Assessment Request Confirmed!',
        description: 'Our enterprise solutions team will review your specifications and reach out within 1 business day.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not transmit your assessment request. Please call +91 96041 36010 or try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto backdrop-blur-md animate-fade-in ${className}`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400 font-mono">Assessment Intake Registered</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-tech">You&apos;re All Set for Review</h3>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light max-w-lg mx-auto">
            Our systems engineer is reviewing your infrastructure requirements for <strong className="text-white font-medium">{formData.company}</strong>. We will contact you via WhatsApp / Phone to schedule the assessment.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Estimated Response SLA:</span>
            <span className="font-semibold text-white">Same Business Day</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>Direct Engineering Line:</span>
            <a href="tel:+919604136010" className="font-semibold text-blue-400 hover:underline">+91 96041 36010</a>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>WhatsApp Quick Connect:</span>
            <a href="https://wa.me/919604136010?text=Hi%20TecBunny,%20I%20just%20submitted%20a%20technology%20assessment%20request." target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-400 hover:underline">
              Message Team Now &rarr;
            </a>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
            }}
            className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Submit Another Requirement
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
            <Link href="/services">Explore TecBunny Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl border border-zinc-850 bg-zinc-950/80 p-6 sm:p-10 md:p-12 backdrop-blur-xl shadow-2xl ${className}`}>
      {/* Progress Indicator */}
      <div className="mb-8 border-b border-zinc-900 pb-6">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          {[
            { step: 1, title: 'Scope & Need' },
            { step: 2, title: 'Property & Scale' },
            { step: 3, title: 'Contact Details' }
          ].map((item, idx) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div key={item.step} className="flex items-center gap-2 flex-1">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-colors ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : isCurrent 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}>
                  {isCompleted ? '✓' : item.step}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:inline ${
                  isCurrent ? 'text-white' : 'text-zinc-500'
                }`}>
                  {item.title}
                </span>
                {idx < 2 && (
                  <div className={`h-px flex-1 ml-2 transition-colors ${
                    isCompleted ? 'bg-emerald-500/30' : 'bg-zinc-850'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: REQUIREMENTS */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400 font-mono">Step 1 of 3</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-tech">What technology solutions does your business require?</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                Select the primary system category you would like evaluated or upgraded.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_CATEGORIES.map((service) => {
                const Icon = service.icon;
                const isSelected = formData.service === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, service: service.id }))}
                    className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500'
                        : 'border-zinc-850 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      isSelected 
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-850'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="text-sm font-bold text-white leading-snug">{service.label}</div>
                      <div className="text-xs text-zinc-400 font-light leading-normal">{service.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Timeline */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Target Implementation Timeline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIMELINE_OPTIONS.map((time) => {
                  const isSelected = formData.timeline === time.id;
                  return (
                    <button
                      key={time.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, timeline: time.id }))}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/15 text-white'
                          : 'border-zinc-850 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span>{time.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Problem Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block" htmlFor="current-problem">
                What problem or challenge are you currently facing? (Optional)
              </label>
              <Textarea
                id="current-problem"
                name="currentProblem"
                value={formData.currentProblem}
                onChange={handleChange}
                placeholder="e.g. Wi-Fi dead zones in resort guest rooms, outdated analog CCTV, need biometric access for 50 staff members, frequent network drops..."
                rows={3}
                className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white placeholder:text-zinc-600 text-sm rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <span>Continue to Property Details</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PROPERTY & SCALE */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400 font-mono">Step 2 of 3</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-tech">Property Details & Project Scale</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                Helps our engineering team determine equipment density, cabling requirements, and site surveyor dispatch.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Industry */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="industry-select">
                  Industry / Property Type *
                </label>
                <select
                  id="industry-select"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-[#09090B] border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                >
                  {INDUSTRY_OPTIONS.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Property Scale */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="scale-select">
                  Estimated Requirement Scale *
                </label>
                <select
                  id="scale-select"
                  name="scale"
                  value={formData.scale}
                  onChange={handleChange}
                  className="w-full bg-[#09090B] border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                >
                  {SCALE_OPTIONS.map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>

              {/* City / Location */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="city-input">
                  Project Location / City *
                </label>
                <Input
                  id="city-input"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Panaji, Goa / Anjuna / Mapusa / Mumbai"
                  required
                  className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white rounded-xl h-11"
                />
              </div>

              {/* Budget (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="budget-select">
                  Target Budget Allocation (Optional)
                </label>
                <select
                  id="budget-select"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full bg-[#09090B] border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                >
                  <option value="Flexible / Proposal Based">Flexible / Proposal Based</option>
                  <option value="Under ₹1,00,000">Under ₹1,00,000</option>
                  <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000</option>
                  <option value="₹3,00,000 - ₹10,00,000">₹3,00,000 - ₹10,00,000</option>
                  <option value="₹10,00,000+ (Enterprise Scale)">₹10,00,000+ (Enterprise Scale)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-white rounded-xl h-12 px-6"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <span>Continue to Contact Info</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400 font-mono">Step 3 of 3</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-tech">Where should we deliver the assessment proposal?</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                We will send the technical blueprint and connect with you to arrange a complimentary site survey.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="contact-name">
                  Full Name *
                </label>
                <Input
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
                  disabled={isSubmitting}
                  className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="company-name">
                  Company / Organization Name *
                </label>
                <Input
                  id="company-name"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Azure Palms Resort Goa"
                  required
                  disabled={isSubmitting}
                  className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="work-email">
                  Work Email Address *
                </label>
                <Input
                  id="work-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul@azurepalms.com"
                  required
                  disabled={isSubmitting}
                  className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="phone-number">
                  Phone / WhatsApp Number *
                </label>
                <Input
                  id="phone-number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  required
                  disabled={isSubmitting}
                  className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="additional-notes">
                Additional Requirements or Floorplan Notes (Optional)
              </label>
              <Textarea
                id="additional-notes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Mention any specific brands requested (Cisco, Hikvision, Ubiquiti), architectural drawings ready, or key installation dates..."
                rows={3}
                disabled={isSubmitting}
                className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white placeholder:text-zinc-600 text-sm rounded-xl"
              />
            </div>

            <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.privacyConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacyConsent: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500/40 accent-blue-600"
                />
                <span className="text-xs text-zinc-400 leading-relaxed">
                  I agree that TecBunny Solutions may contact me via Phone, WhatsApp, or Email regarding this technology assessment. We adhere strictly to our{' '}
                  <Link href="/info/policies/privacy" target="_blank" className="text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and never share your details with third parties.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-white rounded-xl h-12 px-6"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <span>Transmitting Details...</span>
                ) : (
                  <>
                    <span className="uppercase tracking-wider font-tech font-bold">Request Free Technology Assessment</span>
                    <Send size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
