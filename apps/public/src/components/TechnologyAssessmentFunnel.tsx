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
  PhoneCall,
  Mail, 
  Sparkles,
  Server,
  Shield,
  Lock,
  Zap,
  Cpu,
  Layers,
  HelpCircle,
  MessageSquare,
  FileText
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

export const BUSINESS_TYPE_OPTIONS = [
  'Hospitality / Hotels & Resorts',
  'Corporate Office / Co-working',
  'Education / School / College',
  'Healthcare / Clinic / Hospital',
  'Retail / Commercial Outlet',
  'Real Estate / Builder / Developer',
  'Manufacturing / Warehouse',
  'Other Business Enterprise'
] as const;

export const PROJECT_STAGE_OPTIONS = [
  'Just researching / evaluating options',
  'Planning this quarter',
  'Ready to request a proposal',
  'Urgent implementation needed'
] as const;

export const PROJECT_SIZE_OPTIONS = [
  'Single-site / small rollout',
  '10-25 devices / moderate footprint',
  '25-100 devices / multi-floor deployment',
  '100+ devices / multi-site enterprise',
  'Custom enterprise specification'
] as const;

function resolveDefaultIndustry(str?: string): string {
  if (!str) return 'Hospitality (Hotels & Resorts)';
  const s = str.toLowerCase();
  if (s.includes('hosp') || s.includes('hotel') || s.includes('resort')) return 'Hospitality (Hotels & Resorts)';
  if (s.includes('corp') || s.includes('office') || s.includes('co-work')) return 'Corporate Offices & Co-working';
  if (s.includes('educ') || s.includes('school') || s.includes('college')) return 'Education (Schools & Colleges)';
  if (s.includes('health') || s.includes('clinic') || s.includes('hospital')) return 'Healthcare & Clinics';
  if (s.includes('retail') || s.includes('shop') || s.includes('commercial')) return 'Retail & Commercial Outlets';
  if (s.includes('build') || s.includes('real estate') || s.includes('construct') || s.includes('developer')) return 'Real Estate & New Construction';
  if (s.includes('manufactur') || s.includes('warehous')) return 'Manufacturing & Warehousing';
  return str;
}

function resolveDefaultService(str?: string): string {
  if (!str) return 'network-infrastructure';
  const s = str.toLowerCase();
  if (s.includes('cctv') || s.includes('surveillance') || s.includes('security') || s.includes('physical-security')) return 'physical-security';
  if (s.includes('lock') || s.includes('access') || s.includes('smart-access-control')) return 'smart-access-control';
  if (s.includes('smart-infra') || s.includes('smart_infrastructure') || s.includes('automation')) return 'smart-infrastructure';
  if (s.includes('hardware') || s.includes('amc') || s.includes('workstation') || s.includes('lifecycle')) return 'lifecycle-hardware';
  if (s.includes('sysadmin') || s.includes('system') || s.includes('cloud') || s.includes('software')) return 'software-system-admin';
  return 'network-infrastructure';
}

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
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null);

  const initialService = React.useMemo(() => resolveDefaultService(defaultService), [defaultService]);
  const initialIndustry = React.useMemo(() => resolveDefaultIndustry(defaultIndustry), [defaultIndustry]);

  const [formData, setFormData] = React.useState({
    // Step 1: Requirements
    service: initialService,
    timeline: '',
    businessType: '',
    projectStage: '',
    currentProblem: '',

    // Step 2: Scale & Industry
    industry: initialIndustry,
    scale: '',
    projectSize: '',
    city: '',
    budget: 'Flexible / Proposal Based',

    // Step 3: Contact Details
    name: '',
    company: '',
    email: '',
    phone: '',
    additionalNotes: '',
    privacyConsent: true,
  });

  // Load form progress from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('assessment_form_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.completedStep && parsed.completedStep > 1) {
          setCurrentStep(Math.min(parsed.completedStep, 3) as 1 | 2 | 3);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Track funnel start
  React.useEffect(() => {
    try {
      trackEvent('assessment_started', {
        source: sourceContext,
        service: initialService,
        industry: initialIndustry,
      });
    } catch {
      // safe fallback
    }
  }, [sourceContext, initialService, initialIndustry, trackEvent]);

  // Save form progress to localStorage on every change
  React.useEffect(() => {
    try {
      localStorage.setItem('assessment_form_progress', JSON.stringify({
        ...formData,
        completedStep: currentStep,
      }));
    } catch {
      // safe fallback
    }
  }, [formData, currentStep]);

  // Track abandoned assessment on page leave (only if progress made but not submitted)
  React.useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isSuccess || currentStep === 1 && !formData.email.trim()) {
        return; // Don't track if submitted or haven't made progress
      }

      // Only send if user has provided email (indicates abandonment, not just browsing)
      if (formData.email.trim() && currentStep < 3) {
        try {
          await fetch('/api/abandoned-assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email.trim(),
              name: formData.name.trim(),
              company: formData.company.trim(),
              phone: formData.phone.trim(),
              completedStep: currentStep,
              service: formData.service,
              timeline: formData.timeline,
              businessType: formData.businessType,
              industry: formData.industry,
              projectStage: formData.projectStage,
              projectSize: formData.projectSize,
              city: formData.city,
              budget: formData.budget,
              currentProblem: formData.currentProblem,
              sourceContext: sourceContext,
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
              referrer: typeof document !== 'undefined' ? document.referrer : '',
            }),
            // Use keepalive to ensure request completes even if page unloads
            keepalive: true,
          });
        } catch {
          // Silent fallback - don't block page unload
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, currentStep, isSuccess, sourceContext]);

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
      if (!formData.timeline) {
        toast({
          variant: 'destructive',
          title: 'Select Timeline',
          description: 'Please select your target implementation timeline.',
        });
        return;
      }
      if (!formData.businessType) {
        toast({
          variant: 'destructive',
          title: 'Select Business Type',
          description: 'Please tell us what kind of business or property this project is for.',
        });
        return;
      }
      if (!formData.projectStage) {
        toast({
          variant: 'destructive',
          title: 'Select Project Stage',
          description: 'Please tell us where your project stands today.',
        });
        return;
      }
      if (!formData.email.trim()) {
        toast({
          variant: 'destructive',
          title: 'Email Required',
          description: 'Please provide your work email so we can send the assessment proposal.',
        });
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!formData.industry) {
        toast({
          variant: 'destructive',
          title: 'Select Industry',
          description: 'Please select your industry or property type.',
        });
        return;
      }
      if (!formData.scale) {
        toast({
          variant: 'destructive',
          title: 'Select Project Scale',
          description: 'Please select your estimated requirement scale.',
        });
        return;
      }
      if (!formData.projectSize) {
        toast({
          variant: 'destructive',
          title: 'Select Approximate Project Size',
          description: 'Please estimate the project footprint or device count.',
        });
        return;
      }
      if (!formData.city.trim()) {
        toast({
          variant: 'destructive',
          title: 'Enter Location',
          description: 'Please specify your project location or city.',
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
Business Type: ${formData.businessType}
Project Stage: ${formData.projectStage}
Property Scale: ${formData.scale}
Approximate Project Size: ${formData.projectSize}
Location / City: ${formData.city}
Implementation Timeline: ${formData.timeline}
Estimated Budget: ${formData.budget}

Current Problem / Challenges:
${formData.currentProblem.trim() || 'Not specified'}

Additional Notes / Scope:
${formData.additionalNotes.trim() || 'None'}
      `.trim();

      // Use FormData for multipart submission (supports file upload)
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('email', formData.email.trim().toLowerCase());
      submitFormData.append('phone', formData.phone.trim());
      submitFormData.append('company_name', formData.company.trim());
      submitFormData.append('subject', `Technology Assessment: ${serviceTitle} - ${formData.company.trim()}`);
      submitFormData.append('message', formattedMessage);
      submitFormData.append('service_interest', serviceTitle);
      submitFormData.append('business_type', formData.businessType);
      submitFormData.append('project_stage', formData.projectStage);
      submitFormData.append('project_size', formData.projectSize);
      submitFormData.append('origin_path', typeof window !== 'undefined' ? window.location.pathname : '/assessment');
      submitFormData.append('form_identifier', 'technology_assessment_funnel');
      
      // Append file if present
      if (attachedFile) {
        submitFormData.append('file', attachedFile);
      }

      const response = await fetch('/api/contact-messages-with-file', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit assessment request.');
      }

      setIsSuccess(true);
      trackEvent('assessment_submitted', {
        service: formData.service,
        industry: formData.industry,
        timeline: formData.timeline,
        hasDocument: Boolean(attachedFile),
      });

      // Clear localStorage after successful submission
      try {
        localStorage.removeItem('assessment_form_progress');
      } catch {
        // safe fallback
      }

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Please upload a project document or blueprint smaller than 10MB.',
      });
      e.target.value = '';
      return;
    }

    // Validate type
    const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.pdf')) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Format',
        description: 'Allowed formats: PDF, PNG, JPG, WEBP blueprints.',
      });
      e.target.value = '';
      return;
    }

    setAttachedFile(file);

    toast({
      title: 'Document Ready for Upload',
      description: `${file.name} will be securely uploaded with your assessment request.`,
    });
  };

  if (isSuccess) {
    return (
      <div className={`rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950 p-8 sm:p-12 text-center space-y-8 max-w-3xl mx-auto backdrop-blur-md animate-fade-in shadow-2xl ${className}`}>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 size={44} />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 font-mono">Assessment Request Confirmed</span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-tech">Your Requirements Are in Engineering Review</h3>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light max-w-xl mx-auto">
            Our certified systems engineering team has received your project specifications for <strong className="text-white font-medium">{formData.company || 'your facility'}</strong>.
          </p>
        </div>

        {/* 3-Step What Happens Next Roadmap */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">What Happens Next:</h4>
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="space-y-1.5 border-l-2 border-blue-500 pl-3">
              <span className="font-bold text-white block">1. Technical Scoping</span>
              <p className="text-zinc-400 font-light leading-relaxed">Our engineer analyzes your location, device count, and cabling requirements.</p>
            </div>
            <div className="space-y-1.5 border-l-2 border-indigo-500 pl-3">
              <span className="font-bold text-white block">2. Preliminary BOQ</span>
              <p className="text-zinc-400 font-light leading-relaxed">We generate an itemized Bill of Materials with Tier-1 OEM hardware options.</p>
            </div>
            <div className="space-y-1.5 border-l-2 border-emerald-500 pl-3">
              <span className="font-bold text-white block">3. Site Survey Booking</span>
              <p className="text-zinc-400 font-light leading-relaxed">We coordinate an on-site physical inspection across Goa to finalize cable paths.</p>
            </div>
          </div>
        </div>

        {/* Immediate Connect Box */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white font-tech">Want to discuss your requirement immediately?</h4>
            <p className="text-xs text-zinc-400 mt-1">Speak directly with our enterprise solutions desk during business hours.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/919604136010?text=Hi%20TecBunny,%20I%20just%20submitted%20a%20technology%20assessment%20request%20and%20would%20like%20to%20discuss%20it."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('assessment_success_whatsapp_clicked', { service: formData.service, industry: formData.industry, source: sourceContext })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
            >
              <MessageSquare size={16} />
              <span>Connect on WhatsApp</span>
            </a>
            <a
              href="tel:+919604136010"
              onClick={() => trackEvent('assessment_success_phone_clicked', { service: formData.service, industry: formData.industry, source: sourceContext })}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-850 text-white font-semibold px-6 py-3 text-xs uppercase tracking-wider transition-colors"
            >
              <PhoneCall size={16} />
              <span>Call +91 96041 36010</span>
            </a>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
              setAttachedFile(null);
            }}
            className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl h-11 text-xs"
          >
            Submit Another Requirement
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-11 text-xs">
            <Link href="/">Return to Homepage</Link>
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
                Target Implementation Timeline *
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

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="business-type-select">
                  Business Type *
                </label>
                <select
                  id="business-type-select"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full bg-[#09090B] border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                >
                  <option value="">-- Select business type --</option>
                  {BUSINESS_TYPE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="project-stage-select">
                  Project Stage *
                </label>
                <select
                  id="project-stage-select"
                  name="projectStage"
                  value={formData.projectStage}
                  onChange={handleChange}
                  className="w-full bg-[#09090B] border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                >
                  <option value="">-- Select project stage --</option>
                  {PROJECT_STAGE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
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

            {/* Work Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="step1-email">
                Work Email Address *
              </label>
              <Input
                id="step1-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. contact@yourcompany.com"
                required
                disabled={isSubmitting}
                className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white rounded-xl h-11"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-light">We'll send the preliminary technical assessment and site survey schedule to this email.</p>
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
                  <option value="">-- Select Industry --</option>
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
                  <option value="">-- Select Project Scale --</option>
                  {SCALE_OPTIONS.map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>

              {/* Approximate Project Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="project-size-select">
                  Approximate Project Size *
                </label>
                <select
                  id="project-size-select"
                  name="projectSize"
                  value={formData.projectSize}
                  onChange={handleChange}
                  className="w-full bg-[#09090B] border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                >
                  <option value="">-- Select approximate size --</option>
                  {PROJECT_SIZE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
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

            {/* Optional Project Document / Blueprint Upload */}
            <div className="space-y-2 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5" htmlFor="project-document">
                  <FileText size={14} className="text-blue-400" />
                  <span>Attach Floorplan / BOQ / Blueprint (Optional)</span>
                </label>
                <span className="text-[10px] font-mono text-zinc-500">PDF, PNG, JPG (Max 10MB)</span>
              </div>
              <input
                id="project-document"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileUpload}
                disabled={isSubmitting}
                className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border file:border-zinc-700 file:bg-zinc-850 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800 cursor-pointer"
              />
              {attachedFile && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 size={12} />
                  <span>Selected: {attachedFile.name} ({Math.round(attachedFile.size / 1024)} KB)</span>
                </p>
              )}
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

            <div className="pt-2 text-center">
              <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span>No obligation. Your information is used solely to evaluate your technical requirements and deliver your itemized proposal.</span>
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
