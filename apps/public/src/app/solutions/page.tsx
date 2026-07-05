'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Server,
  Wifi,
  Lock,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CaseStudy {
  title: string;
  category: string;
  location: string;
  scope: string;
  results: string;
  icon: any;
}

export default function SolutionsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '', // WhatsApp number
    companyName: '',
    gstin: '',
    budget: '₹1.5L - ₹5L',
    details: ''
  });
  const [propertyType, setPropertyType] = React.useState<'resort' | 'coworking' | 'office' | 'restaurant'>('resort');
  const [dailyRevenue, setDailyRevenue] = React.useState<number>(150000);
  const [downtimeHours, setDowntimeHours] = React.useState<number>(4);
  const [affectedSystems, setAffectedSystems] = React.useState<string[]>(['wifi', 'pos']);

  const calculateDowntimeLoss = () => {
    const hourlyRevenue = dailyRevenue / 24;
    const propertyImpactCoefficients = {
      resort: 0.85,
      coworking: 0.95,
      office: 0.60,
      restaurant: 0.50
    };

    let systemMultiplier = 0.2;
    if (affectedSystems.includes('wifi')) systemMultiplier += 0.35;
    if (affectedSystems.includes('pos')) systemMultiplier += 0.30;
    if (affectedSystems.includes('cctv')) systemMultiplier += 0.10;
    if (affectedSystems.includes('bookings')) systemMultiplier += 0.25;

    const baseLoss = hourlyRevenue * downtimeHours * propertyImpactCoefficients[propertyType] * systemMultiplier;
    const operationalOverhead = (dailyRevenue * 0.05) * (downtimeHours / 24);
    return Math.round(baseLoss + operationalOverhead);
  };

  const getDowntimeRiskLevel = (loss: number) => {
    const ratio = loss / dailyRevenue;
    if (ratio < 0.05) return { text: 'Low Impact', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (ratio < 0.15) return { text: 'Moderate Financial Risk', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    return { text: 'CRITICAL OPERATIONAL EXPOSURE', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  const handleSystemToggle = (system: string) => {
    setAffectedSystems(prev => 
      prev.includes(system) ? prev.filter(s => s !== system) : [...prev, system]
    );
  };

  const applyCalculatorToForm = () => {
    const computedLoss = calculateDowntimeLoss();
    const systemNames = affectedSystems.map(s => {
      if (s === 'wifi') return 'Guest Wi-Fi';
      if (s === 'pos') return 'POS / Billing System';
      if (s === 'cctv') return 'CCTV Security';
      if (s === 'bookings') return 'Online Booking Engine';
      return s;
    }).join(', ');

    setForm(prev => ({
      ...prev,
      details: `We ran the Downtime Cost Calculator. Details:
- Property Type: ${propertyType.toUpperCase()}
- Daily Revenue: ₹${dailyRevenue.toLocaleString('en-IN')}
- Selected Outage: ${downtimeHours} hours
- Systems Affected: ${systemNames || 'None'}
- Computed Financial Loss Risk: ₹${computedLoss.toLocaleString('en-IN')}

We require an infrastructure redundancy proposal with direct SLAs to prevent this downtime.`
    }));

    const formElement = document.getElementById('b2b-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }

    toast({
      title: 'Calculator Data Applied!',
      description: 'The results have been pre-filled in your onboarding request requirements below.',
    });
  };

  const caseStudies: CaseStudy[] = [
    {
      title: "6-Node Mesh Network for Heritage Estate",
      category: "Networking & IT Infrastructure",
      location: "Anjuna, North Goa",
      scope: "Fitted shielded Cat6 outdoor lines and managed Digisol access points through 18-inch Portuguese-style stone walls.",
      results: "Sub-50ms seamless roaming handoffs with sustained 450+ Mbps download coverage over a 12,000 sq ft footprint.",
      icon: Wifi
    },
    {
      title: "8-Camera Enterprise Perimeter CCTV surveillance",
      category: "Physical Security Systems",
      location: "Parra, Goa",
      scope: "Deployed ColorVu IP cameras, surge protection devices (SPDs), and centralized battery backup to withstand Goa grid fluctuations.",
      results: "Continuous security coverage during utility outages, instant perimeter alerts, and high-resolution color night-vision feeds.",
      icon: ShieldCheck
    },
    {
      title: "Smart Biometrics & RFID Lock Integration",
      category: "Facility Access Control",
      location: "Panaji, Goa",
      scope: "Installed glass-door biometric fingerprint/card readers integrated with localized central server auditing logs.",
      results: "Log-in automation for 80+ daily transits, reducing front-desk log queues by 85% with fail-safe fire alarm release mapping.",
      icon: Lock
    }
  ];

  const timelineSteps = [
    {
      phase: "01",
      title: "On-Site Survey & Compliance Audit",
      desc: "Our senior field engineers inspect your property, mapping cabling pathways, walls, and power parameters in detail."
    },
    {
      phase: "02",
      title: "Technical Blueprint & BOM Design",
      desc: "We deliver a detailed Bill of Materials (BOM) detailing hardware specifications, layout blueprints, and flat-rate costs."
    },
    {
      phase: "03",
      title: "Structured Cabling & Hardware Deploy",
      desc: "Our in-house team pulls heavy-duty FTP/STP runs, mounts hardware, and constructs clean rack installations."
    },
    {
      phase: "04",
      title: "Commissioning & Optimization",
      desc: "We configure subnets, firewalls, camera NVR alerts, and biometric card databases, executing strict load and handoff checks."
    },
    {
      phase: "05",
      title: "SLA Support & Maintenance Lifecycle",
      desc: "Enjoy peace of mind with direct SLA-backed support, scheduled health audits, and fast local engineering dispatch."
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.companyName || !form.details) {
      toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: 'Please provide name, email, phone, company legal name, and project scope.',
      });
      return;
    }

    // Basic GSTIN validation if provided
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin.toUpperCase())) {
      toast({
        variant: 'destructive',
        title: 'Invalid GSTIN Format',
        description: 'Please check your 15-digit GSTIN and try again.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedMessage = `
--- B2B ENTERPRISE LEAD ---
Company Legal Name: ${form.companyName.trim()}
GSTIN: ${form.gstin.trim() || 'Not Provided'}
Estimated Budget: ${form.budget}
Contact Person: ${form.name.trim()}
WhatsApp / Contact Number: ${form.phone.trim()}

Project Requirements / Scope:
${form.details.trim()}
      `.trim();

      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company_name: form.companyName.trim(),
          subject: `B2B Enterprise Onboarding - ${form.companyName.trim()}`,
          message: formattedMessage,
          origin_path: '/solutions',
          form_identifier: 'b2b_enterprise_onboarding',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding form.');
      }

      setIsSuccess(true);
      toast({
        title: 'Enterprise Onboarding Submitted!',
        description: 'Our senior solutions architect will contact you on WhatsApp shortly.',
      });

      setForm({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        gstin: '',
        budget: '₹1.5L - ₹5L',
        details: ''
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Unable to route B2B lead. Please contact support@tecbunny.com directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden py-16 sm:py-24">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[48rem] w-[48rem] rounded-full bg-blue-500/5 blur-[170px]" />
        <div className="absolute -right-40 top-1/4 h-[50rem] w-[50rem] rounded-full bg-indigo-500/5 blur-[200px]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 sm:px-8">
        {/* Page Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
            <Building2 size={14} className="text-blue-400" />
            <span>Corporate Solutions Division</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-tech leading-tight text-white">
            Enterprise IT & Physical <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">Infrastructure</span>
          </h1>
          <p className="text-base sm:text-lg font-light leading-relaxed text-zinc-400 max-w-2xl mx-auto">
            Secure, scalable, and SLA-backed infrastructure engineering for resorts, hotels, and office spaces across Goa and Maharashtra.
          </p>
        </section>

        {/* Corporate Case Studies Bento Grid */}
        <section className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">Proof of capability</span>
            <h2 className="text-2xl font-bold font-tech text-white mt-1">Verified Corporate Case Studies</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((cs, idx) => {
              const IconComp = cs.icon;
              return (
                <div key={idx} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <IconComp size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={11} className="text-zinc-600" />
                        {cs.location}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1 leading-snug">{cs.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">{cs.scope}</p>
                  </div>
                  <div className="mt-6 border-t border-zinc-900/80 pt-4 bg-blue-500/5 -mx-6 -mb-6 p-6 rounded-b-2xl">
                    <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">Handoff Metric</span>
                    <p className="text-xs text-zinc-300 font-medium mt-1 leading-relaxed">{cs.results}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Deployment Timeline */}
        <section className="space-y-12">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">Our Methodology</span>
            <h2 className="text-2xl font-bold font-tech text-white mt-1">Project Deployment Timeline</h2>
            <p className="text-xs text-zinc-450 mt-2 font-light">
              We manage every deployment through a structured, 5-phase engineering process backed by local Goan technicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="p-5 bg-zinc-900/20 border border-zinc-900/50 rounded-2xl relative overflow-hidden flex flex-col gap-3">
                <span className="text-3xl font-black text-zinc-800 font-mono absolute -right-2 -top-2 opacity-30 select-none">{step.phase}</span>
                <h3 className="text-xs font-bold text-white mt-2 leading-snug font-tech">{step.title}</h3>
                <p className="text-[11px] text-zinc-500 font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* B2B Institutional Downtime Cost Calculator */}
        <section className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-8 relative overflow-hidden space-y-8">
          <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">Financial Risk Assessment</span>
            <h2 className="text-2xl font-bold font-tech text-white">Institutional Downtime Cost Calculator</h2>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-2xl">
              Select your business parameters to project estimated financial exposure from network infrastructure outages during North Goa's high tourist seasons.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Property Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['resort', 'coworking', 'office', 'restaurant'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type)}
                      className={`h-11 rounded-xl text-xs font-semibold capitalize border transition-all duration-200
                        ${propertyType === type
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800 text-zinc-400'
                        }
                      `}
                    >
                      {type === 'resort' ? 'Resort / Hotel' : type === 'coworking' ? 'Co-working' : type === 'office' ? 'Office' : 'Restaurant'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Average Daily Revenue</span>
                  <span className="font-bold text-white font-mono">₹{dailyRevenue.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1000000"
                  step="10000"
                  value={dailyRevenue}
                  onChange={(e) => setDailyRevenue(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-zinc-650 font-mono">
                  <span>₹20,000</span>
                  <span>₹5,00,000</span>
                  <span>₹10,00,000</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Estimated Outage Duration</span>
                  <span className="font-bold text-white font-mono">{downtimeHours} Hour{downtimeHours > 1 ? 's' : ''}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={downtimeHours}
                  onChange={(e) => setDowntimeHours(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-zinc-650 font-mono">
                  <span>1 Hour</span>
                  <span>12 Hours</span>
                  <span>24 Hours</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Affected Critical Systems</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'wifi', label: 'Guest Wi-Fi / Hotspot' },
                    { id: 'pos', label: 'Billing / POS Terminals' },
                    { id: 'cctv', label: 'CCTV Feed Monitoring' },
                    { id: 'bookings', label: 'Front-Desk Booking Sync' }
                  ].map((sys) => (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => handleSystemToggle(sys.id)}
                      className={`h-11 px-4 rounded-xl text-xs font-semibold text-left border transition-all duration-200 flex items-center justify-between
                        ${affectedSystems.includes(sys.id)
                          ? 'border-blue-500/40 bg-blue-500/5 text-white'
                          : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:border-zinc-900'
                        }
                      `}
                    >
                      <span>{sys.label}</span>
                      <span className={`h-4 w-4 rounded border flex items-center justify-center text-[10px]
                        ${affectedSystems.includes(sys.id)
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-zinc-855 bg-zinc-900'
                        }
                      `}>
                        {affectedSystems.includes(sys.id) && '✓'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-5 p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Risk Assessment Report</span>
                  {(() => {
                    const risk = getDowntimeRiskLevel(calculateDowntimeLoss());
                    return (
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded border tracking-wider font-tech ${risk.color}`}>
                        {risk.text}
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Direct Financial Exposure</span>
                  <div className="text-4xl font-extrabold text-white font-tech tracking-tight">
                    ₹{calculateDowntimeLoss().toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-zinc-550 font-light block">Estimated direct loss + operational overhead recovery.</span>
                </div>

                <div className="border-t border-zinc-900/80 pt-4 space-y-2">
                  <span className="text-[9px] font-extrabold uppercase text-blue-400 tracking-widest block">Technical Justification</span>
                  <p className="text-[11px] text-zinc-450 leading-relaxed font-light font-sans">
                    Consumer router chipsets lack multi-WAN failover capability and thermal resistance required for continuous Goan grid fluctuation loads. Switching to managed Ubiquiti switches with automated dual-ISP backup lines reduces downtime probability to sub-0.01%.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={applyCalculatorToForm}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Apply to Redundancy Proposal</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Split Layout: Lead Capture & Enterprise FAQ */}
        <section id="b2b-form-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Intake Form */}
          <div className="lg:col-span-7 bg-zinc-950/60 border border-zinc-900 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />

            <div className="mb-6 space-y-2">
              <h2 className="text-xl font-bold font-tech text-white">Enterprise Onboarding Form</h2>
              <p className="text-xs text-zinc-400 font-light">
                Request a formal consultation, dynamic quotation, or physical site survey for your facility in Goa.
              </p>
            </div>

            {isSuccess ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4 max-w-xl mx-auto animate-fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-bold text-white">Lead Successfully Logged</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Thanks for reaching out! Our enterprise operations team is reviewing your property setup and will connect with you on WhatsApp / Email within 24 hours.
                </p>
                <Button 
                  onClick={() => setIsSuccess(false)}
                  variant="outline" 
                  className="border-zinc-850 text-zinc-400 hover:bg-zinc-900"
                >
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Company Legal Name *</label>
                    <Input 
                      name="companyName"
                      required
                      placeholder="e.g., Marriott Goa Resort"
                      value={form.companyName}
                      onChange={handleChange}
                      className="bg-zinc-950 border-zinc-900 text-xs rounded-xl focus:border-blue-500 text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">GSTIN (For Tax Credit) (Optional)</label>
                    <Input 
                      name="gstin"
                      maxLength={15}
                      placeholder="e.g., 30AAMCT1608G1ZO"
                      value={form.gstin}
                      onChange={handleChange}
                      className="bg-zinc-950 border-zinc-900 text-xs rounded-xl focus:border-blue-500 text-white placeholder:text-zinc-700 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">WhatsApp Contact Number *</label>
                    <Input 
                      name="phone"
                      required
                      placeholder="e.g., +91 96041 36010"
                      value={form.phone}
                      onChange={handleChange}
                      className="bg-zinc-950 border-zinc-900 text-xs rounded-xl focus:border-blue-500 text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Estimated Project Budget *</label>
                    <select
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      className="w-full h-10 px-3 bg-zinc-950 border border-zinc-900 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-zinc-300 cursor-pointer"
                    >
                      <option value="₹50k - ₹1.5L">₹50k - ₹1.5L</option>
                      <option value="₹1.5L - ₹5L">₹1.5L - ₹5L</option>
                      <option value="₹5L - ₹15L">₹5L - ₹15L</option>
                      <option value="₹15L+">₹15L+ (Enterprise Scale)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Contact Name *</label>
                    <Input 
                      name="name"
                      required
                      placeholder="e.g., Shubham Bhisaji"
                      value={form.name}
                      onChange={handleChange}
                      className="bg-zinc-950 border-zinc-900 text-xs rounded-xl focus:border-blue-500 text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Corporate Email *</label>
                    <Input 
                      name="email"
                      type="email"
                      required
                      placeholder="e.g., manager@resort.com"
                      value={form.email}
                      onChange={handleChange}
                      className="bg-zinc-950 border-zinc-900 text-xs rounded-xl focus:border-blue-500 text-white placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Project Requirements & Scope *</label>
                  <Textarea 
                    name="details"
                    required
                    rows={4}
                    placeholder="Describe your structural layout, estimated number of access points/cameras, and timeline constraints..."
                    value={form.details}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-900 text-xs rounded-xl focus:border-blue-500 text-white placeholder:text-zinc-700"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Routing Lead...</span>
                  ) : (
                    <>
                      <span>Submit Enterprise Request</span>
                      <Send size={12} />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: FAQ / SLA Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold font-tech text-white flex items-center gap-2">
                <FileCheck size={16} className="text-emerald-500" />
                Why TecBunny Enterprise?
              </h3>
              <ul className="space-y-3.5 text-xs text-zinc-400 font-light leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="text-emerald-500 shrink-0 font-bold">&radic;</span>
                  <span><strong>Official Compliance</strong>: Private Limited corporate entity holding valid GSTIN and CIN registrations in Goa.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-emerald-500 shrink-0 font-bold">&radic;</span>
                  <span><strong>Tax Credits</strong>: Automatically matching GST invoices to verify your business input tax credit.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-emerald-500 shrink-0 font-bold">&radic;</span>
                  <span><strong>Dedicated SLAs</strong>: Same-day troubleshooting response windows with local hardware spares kept on-shelf.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-zinc-950/20 border border-zinc-900/40 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold font-tech text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-blue-500" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4 divide-y divide-zinc-900">
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-bold text-white">Do you charge for site surveys?</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-light">Site surveys are fully free for all locations within Pernem, Mapusa, Siolim, Anjuna, Parra, and Panaji.</p>
                </div>
                <div className="space-y-1.5 pt-4">
                  <h4 className="text-xs font-bold text-white">What hardware brands do you configure?</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-light">We configure authorized enterprise hardware including Digisol, HFCL IO, TP-Link Omada, Hikvision, CP Plus, and Honeywell.</p>
                </div>
                <div className="space-y-1.5 pt-4">
                  <h4 className="text-xs font-bold text-white">Do you offer Net-30 payment terms?</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-light">Yes, corporate clients with valid trade licenses and clean credit audit profiles can request Net-30 invoicing terms upon onboarding.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
