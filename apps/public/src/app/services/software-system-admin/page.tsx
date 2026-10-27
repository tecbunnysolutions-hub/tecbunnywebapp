import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Server,
  Database,
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Terminal,
  Settings,
  ShieldCheck,
  HelpCircle,
  Layers
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { TrustSection } from '@/components/TrustSection';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Software & System Administration Services Goa | TecBunny',
    description: 'Enterprise OS deployments, Active Directory & identity management, patch management, cloud backups, and disaster recovery strategies in Goa.',
    keywords: [
      'system administration Goa',
      'OS deployment',
      'Active Directory management',
      'cloud backup disaster recovery',
      'IT support SLA Goa',
      'TecBunny'
    ],
    path: '/services/software-system-admin',
    image: '/brand.png',
  });
}

const FAQS = [
  {
    question: "Can TecBunny manage our Microsoft 365 or Google Workspace migrations?",
    answer: "Yes, our engineers handle complete email and cloud workspace migrations with careful mailbox migration and verification, planned MX record cutovers, and two-factor authentication enforcement across staff devices."
  },
  {
    question: "How do you protect our corporate databases from ransomware?",
    answer: "We deploy immutable, air-gapped 3-2-1 backup architectures: 3 copies of your data, stored on 2 different media types, with 1 copy stored in an encrypted off-site cloud repository protected against ransomware encryption."
  },
  {
    question: "Do you offer remote helpdesk support for day-to-day employee issues?",
    answer: "Yes, our managed system administration contracts include direct helpdesk access for your staff, addressing email configuration, VPN connections, printer drivers, and software errors quickly."
  },
  {
    question: "How do you handle security patch management?",
    answer: "We schedule automated, staged operating system and firmware security updates outside business hours, testing updates first to ensure line-of-business applications do not crash."
  }
];

export default function SoftwareSystemAdminPage() {
  const subServices = [
    {
      title: "Enterprise OS Deployment & Fleet Staging",
      subtitle: "Systematic provisioning and standardization of Windows, macOS, and Linux client environments.",
      icon: Terminal,
      gradient: "from-primary/20 via-primary/10 to-transparent",
      border: "hover:border-primary/35",
      points: [
        {
          label: "Automated Staging Scripts",
          desc: "Flash corporate OS builds with standard apps, security policies, and licensed tools pre-configured."
        },
        {
          label: "Software License Compliance",
          desc: "Centralized volume tracking for Microsoft 365, Adobe, and CAD software preventing license violations."
        },
        {
          label: "Virtual Desktop Infrastructure (VDI)",
          desc: "Deploy and manage secure virtual machines in the cloud, allowing remote workers safe database access."
        }
      ]
    },
    {
      title: "Active Directory & Identity (IAM)",
      subtitle: "Centralized credential governance, Single Sign-On (SSO), and role-based permissions.",
      icon: Lock,
      gradient: "from-primary/20 via-primary/10 to-transparent",
      border: "hover:border-primary/35",
      points: [
        {
          label: "Role-Based Access Control (RBAC)",
          desc: "Enforce least-privilege principles so employees access only the departmental folders they need."
        },
        {
          label: "Multi-Factor Authentication (MFA)",
          desc: "Mandatory hardware key or authenticator app prompts securing all corporate email and cloud logins."
        },
        {
          label: "Instant Deprovisioning",
          desc: "Revoke all email, VPN, and database access in a single click when an employee departs."
        }
      ]
    },
    {
      title: "Automated Cloud Backups & Disaster Recovery",
      subtitle: "3-2-1 immutable backup strategies protecting against hardware failures and ransomware.",
      icon: Database,
      gradient: "from-success/20 via-success/10 to-transparent",
      border: "hover:border-success/35",
      points: [
        {
          label: "Immutable Snapshot Vaults",
          desc: "Write-once-read-many (WORM) storage that cannot be modified or encrypted by ransomware."
        },
        {
          label: "Sub-Hour Recovery Point Objectives (RPO)",
          desc: "Frequent automated differential backups minimizing lost data during unexpected outages."
        },
        {
          label: "Routine Disaster Drills",
          desc: "Quarterly recovery validation drills ensuring databases can be restored without corruptions."
        }
      ]
    },
    {
      title: "24/7 Managed Monitoring & Helpdesk",
      subtitle: "Proactive server health tracking and rapid employee troubleshooting support.",
      icon: Activity,
      gradient: "from-warning/20 via-accent/10 to-transparent",
      border: "hover:border-warning/35",
      points: [
        {
          label: "Real-Time Server Telemetry",
          desc: "Automated alerts for CPU spikes, low disk space, and failing disk arrays before crashes occur."
        },
        {
          label: "Staged Patch Management",
          desc: "Tested security updates deployed during maintenance windows to maintain compliance."
        },
        {
          label: "Direct SLA Support Desk",
          desc: "Friendly, expert remote and on-site support resolving staff technical tickets rapidly."
        }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-card text-muted-foreground selection:bg-primary/20 selection:text-primary overflow-hidden tb-page-bottom">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Services', url: 'https://www.tecbunny.com/services' },
          { name: 'Software & System Administration', url: 'https://www.tecbunny.com/services/software-system-admin' },
        ]}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--overlay))_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-primary/5 blur-[180px]" />
      </div>

      {/* Hero Section */}
      <section className="relative tb-subpage-hero border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} className="animate-pulse" />
              <span>Identity, Cloud Backups &amp; Managed IT SLA</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Software &amp; System <br />
              <span className=" text-primary">
                Administration
              </span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              Keep your servers, identity management, and cloud backups running reliably with enterprise Active Directory management, immutable disaster recovery, and dedicated SLA helpdesk support.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary text-primary-foreground font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-primary/20">
                <Link href="#assessment-funnel">Discuss Your Technology Requirements</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground rounded-xl px-8 text-sm h-12">
                <Link href="#services-grid">Explore System Offerings &darr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Solve */}
      <section className="tb-section-space border-b border-border bg-background/40">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono">
              Systems Challenges
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">
              What System Administration Problems We Solve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              Protect your business data and eliminate day-to-day software bottlenecks.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">01 / Security</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Ransomware &amp; Unverified Backups</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Backups stored on local shared folders get encrypted during ransomware attacks. We deploy immutable, air-gapped cloud backups designed to make recovery possible even after a ransomware attack.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">02 / Access</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Lingering Ex-Employee Access</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Disorganized passwords allow former staff to access sensitive company files. We implement centralized IAM Single Sign-On with instant one-click deprovisioning.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">03 / Support</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Unanswered IT Support Tickets</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Employees losing hours to printer errors, VPN drops, and software crashes. Our direct SLA support desk resolves issues quickly with same-day response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services-grid" className="tb-section-space">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-[0.35em] text-primary font-bold font-mono">Offerings</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">Our System Administration Capabilities</h2>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base font-light">
              Identity governance, automated cloud backups, patch management, and dedicated SLA IT helpdesk support.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {subServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-3xl border border-border bg-background/60 p-8 sm:p-10 transition-all duration-300 ${service.border} group`}
                >
                  <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${service.gradient} blur-3xl opacity-60 pointer-events-none transition-all duration-300 group-hover:scale-110`} />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border text-foreground">
                        <Icon size={22} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-tech mb-2">{service.title}</h3>
                      <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed max-w-md">{service.subtitle}</p>

                      <div className="space-y-4 border-t border-border pt-6">
                        {service.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex gap-4">
                            <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-bold text-foreground tracking-wide">{pt.label}</h4>
                              <p className="text-xs text-muted-foreground font-light leading-relaxed">{pt.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Structured Lifecycle */}
      <HowItWorksSection
        variant="canonical-link"
        title="How managed system administration works"
        subtitle="Onboarding audit, patch cadence, and SLA-backed support — see the full lifecycle on our services page."
      />

      {/* Trust Section */}
      <TrustSection />

      {/* FAQ Section with JSON-LD Schema */}
      <section className="tb-section-space border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono flex items-center gap-2">
              <HelpCircle size={14} /> Clear Answers
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">
              Frequently Asked Questions: System Administration
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-background/60 p-6 space-y-2">
                <h3 className="text-sm font-bold text-foreground font-tech">{faq.question}</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: FAQS.map((faq) => ({
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

      {/* Intake Funnel */}
      <section id="assessment-funnel" className="tb-section-space bg-background/20">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-primary font-bold font-mono">Proposal Intake</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">Discuss Your Technology Requirements</h2>
            <p className="text-muted-foreground text-sm sm:text-base font-light">
              Submit your systems administration requirements below. Your enquiry is securely routed to our enterprise solutions team.
            </p>
          </div>
          <TechnologyAssessmentFunnel defaultService="software-system-admin" sourceContext="service_system_admin" />
        </div>
      </section>
    </div>
  );
}
