import type { Metadata } from 'next';
import { 
  Building2, 
  Shield, 
  Lock, 
  Zap, 
  Server, 
  Layers, 
  FileText, 
  Activity,
  Cpu
} from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { IndustryLandingPage } from '@/components/IndustryLandingPage';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Builders & Real Estate Technology Infrastructure Goa | TecBunny',
    description: 'Pre-construction structured cabling, fiber backbone, perimeter CCTV, and access control engineering for builders, developers, and commercial projects in Goa.',
    keywords: [
      'builder IT cabling Goa',
      'real estate technology infrastructure',
      'commercial development CCTV Goa',
      'fiber backbone riser cabling',
      'smart building automation builders Goa',
      'pre-construction tech consultation Goa',
      'TecBunny'
    ],
    path: '/industries/builders',
    image: BRAND_LOGO_URL,
  });
}

export default function BuildersIndustryPage() {
  return (
    <IndustryLandingPage
      industryKey="builders"
      badge="Builders & Commercial Developers"
      title="Technology Infrastructure Planned"
      subtitle="Before Your Commercial Project Opens"
      heroLede="Eliminate costly post-construction rework with engineered low-voltage blueprints, vertical fiber risers, perimeter smart security, and turn-key technology commissioning for real estate developments in Goa."
      primaryCtaText="Request Project Technology Assessment"
      problemsTitle="Pre-Construction Technology Risks in Real Estate Projects"
      problemsSubtitle="Planning low-voltage infrastructure during the concrete and conduit phase saves months of project delays and thousands in rework costs."
      problems={[
        {
          title: "Missing Conduits & Concrete Rework",
          desc: "Neglecting low-voltage cable conduit paths before concrete pouring forces expensive wall cutting, unsightly external surface trunking, and fire-code issues.",
          impact: "Project delivery delays, compromised interior aesthetics, and thousands in unplanned civil rectification costs."
        },
        {
          title: "Inadequate Vertical Shaft & Riser Sizing",
          desc: "Underestimating riser shaft capacity prevents clean vertical fiber distribution, leaving multi-story buildings unable to deliver Gigabit throughput to individual units.",
          impact: "Severe network bottlenecking, vendor disputes during handover, and poor tenant satisfaction."
        },
        {
          title: "Perimeter Security & Gate Automation Gaps",
          desc: "Failing to lay power and data trenching to entry gates early leaves parking barriers, ANPR cameras, and pedestrian turnstiles disconnected from central security.",
          impact: "Unsecured facility perimeters, delayed occupancy certificates, and expensive asphalt trenching after handover."
        }
      ]}
      solutionsTitle="Engineered Low-Voltage Solutions for Developers"
      solutionsSubtitle="TecBunny partners directly with architects, general contractors, and MEP consultants from initial blueprint CAD design to final testing."
      solutions={[
        {
          title: "Structured Cabling & Fiber Riser Blueprints",
          desc: "Full low-voltage CAD schematics with Cat6A/OM4 fiber riser calculations, MDF/IDF closet layout plans, and Fluke certification reports.",
          points: [
            "Pure copper Cat6/Cat6A LSZH cabling meeting TIA/EIA standards",
            "Dedicated MDF server room design with clean cable tray routing",
            "Individual port mapping and termination labeling schedules"
          ],
          icon: Layers
        },
        {
          title: "Perimeter CCTV & Smart Gate Entry",
          desc: "Trench-ready fiber and PoE+ cabling for motorized boom barriers, long-range RFID vehicle tags, ANPR cameras, and security guard kiosk consoles.",
          points: [
            "Surge-protected Ethernet SPDs on all outdoor gate camera runs",
            "Fast 1.5s boom barriers with anti-tailgating vehicle loop detectors",
            "Central security control room console setup with multi-monitor matrix"
          ],
          icon: Shield
        },
        {
          title: "Turn-Key Commissioning & As-Built Documentation",
          desc: "Complete operational testing, labeled patch panels, user acceptance testing (UAT), and full CAD as-built drawings handed to facility management.",
          points: [
            "Zero-defect commissioning handover signed off before occupancy",
            "Comprehensive O&M manuals and equipment serial registries",
            "Seamless transition into AMC preventive maintenance coverage"
          ],
          icon: Cpu
        }
      ]}
      servicesTitle="Developer Technology Services"
      services={[
        {
          title: "Smart Infrastructure",
          desc: "Low-voltage architectural design, vertical fiber risers, and smart building automation.",
          href: "/services/smart-infrastructure",
          icon: Building2
        },
        {
          title: "Network Infrastructure",
          desc: "Structured Cat6/fiber rack cabling and enterprise switching.",
          href: "/services/network-infrastructure",
          icon: Server
        },
        {
          title: "Physical Security",
          desc: "4K ColorVu perimeter IP camera systems and security control rooms.",
          href: "/services/physical-security",
          icon: Shield
        },
        {
          title: "Smart Access Control",
          desc: "Automated boom barriers, pedestrian turnstiles, and RFID lock systems.",
          href: "/services/smart-access-control",
          icon: Lock
        }
      ]}
      faqs={[
        {
          question: "When should developers involve TecBunny in a construction project?",
          answer: "The ideal time is during architectural and MEP blueprint finalization before concrete casting begins. This ensures all conduit runs, riser shafts, floor boxes, and MDF server rooms are properly sized, saving significant money compared to post-construction retrofits."
        },
        {
          question: "Do you coordinate with our MEP contractors and architects?",
          answer: "Yes. Our project engineers participate in site MEP coordination meetings, review CAD electrical drawings, mark low-voltage conduits, and supervise cable pulling to ensure strict adherence to structured cabling standards."
        },
        {
          question: "Do you provide as-built drawings and cable test certification?",
          answer: "Yes. Every developer project handover includes certified Fluke Networks cable test reports, labeled patch panel port maps, equipment serial number rosters, and CAD as-built network diagrams."
        },
        {
          question: "Can you provide post-handover AMC support for the society or building management?",
          answer: "Yes. We offer seamless transitions into Annual Maintenance Contracts (AMC) with defined response SLAs for residential societies, commercial complexes, and hospitality facilities."
        }
      ]}
    />
  );
}
