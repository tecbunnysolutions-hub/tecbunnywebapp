import type { Metadata } from 'next';
import { 
  Server, 
  Wifi, 
  Lock, 
  Shield, 
  Cpu, 
  Layers, 
  Briefcase, 
  Terminal, 
  Key 
} from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { IndustryLandingPage } from '@/components/IndustryLandingPage';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Corporate Office & Co-Working IT Infrastructure Goa | TecBunny',
    description: 'High-speed office networking, dual-ISP auto-failover, biometric attendance systems, server rack installations, and managed IT support in Goa.',
    keywords: [
      'office networking Goa',
      'co-working Wi-Fi Goa',
      'biometric access control Panaji',
      'server rack installation Goa',
      'office IT support Goa',
      'Cat6 structured cabling',
      'TecBunny'
    ],
    path: '/industries/offices',
    image: BRAND_LOGO_URL,
  });
}

export default function OfficesIndustryPage() {
  return (
    <IndustryLandingPage
      industryKey="offices"
      badge="Offices & Co-working"
      title="Technology Infrastructure for"
      subtitle="Corporate Offices & Co-Working Spaces in Goa"
      heroLede="Boost productivity and secure your workplace with high-density Wi-Fi 6, clean server rack setups, biometric attendance tracking, and dual-ISP failover that keeps your business running 24/7."
      primaryCtaText="Request Office Network Assessment"
      problemsTitle="Common IT & Infrastructure Failures in Workplaces"
      problemsSubtitle="Modern workspaces rely entirely on digital uptime. Substandard cabling and consumer routers create expensive operational slowdowns."
      problems={[
        {
          title: "Single-Point Internet Drops during Work Hours",
          desc: "Relying on a single ISP connection causes sudden work stoppages during video conferences, client presentations, and cloud CRM updates.",
          impact: "Lost employee billable hours and missed client deadlines."
        },
        {
          title: "Unorganized Server Racks & Cable Spaghetti",
          desc: "Tangled patch cables and unlabelled switch ports make troubleshooting simple network faults take hours instead of minutes.",
          impact: "Prolonged IT downtime, overheating equipment, and increased maintenance costs."
        },
        {
          title: "Inaccurate Attendance Logs & Unrestricted Visitor Access",
          desc: "Manual register books or sluggish fingerprint scanners create morning entry queues and leave server rooms vulnerable to unauthorized entry.",
          impact: "Payroll discrepancies, entry bottlenecks, and data security risks."
        }
      ]}
      solutionsTitle="Engineered Corporate Workplace IT Solutions"
      solutionsSubtitle="Structured cabling, intelligent routing, and tight physical security built to scale with your team."
      solutions={[
        {
          title: "Multi-WAN Dual ISP Automatic Failover",
          desc: "We configure enterprise gateways that monitor primary and secondary internet lines, automatically routing traffic in milliseconds if one ISP drops.",
          points: [
            "Seamless Zoom and VoIP calls with zero dropped sessions",
            "Bandwidth load balancing across broadband and leased lines",
            "Dedicated firewall policies isolating corporate data from guest access"
          ],
          icon: Server
        },
        {
          title: "Certified Structured Cat6 & 10G Fiber Cabling",
          desc: "Complete physical layer deployments with patch panels, cable managers, and ventilated server racks tested to Fluke performance standards.",
          points: [
            "Clean color-coded cable runs with indelible port labeling",
            "High-airflow rack enclosures with centralized UPS battery backup",
            "Full as-built network topology diagrams delivered at handover"
          ],
          icon: Layers
        },
        {
          title: "Biometric Access & Multi-Floor Time-Attendance",
          desc: "High-speed optical fingerprint and 0.2s facial recognition terminals that sync directly with HR payroll software.",
          points: [
            "Restricted keycard access for server rooms and executive suites",
            "Real-time building occupancy logs and automated fire alarm unlock",
            "Fast contactless transit reducing reception desk morning congestion"
          ],
          icon: Lock
        },
        {
          title: "Managed Enterprise Wi-Fi 6 & VLAN Segmentation",
          desc: "High-density access points capable of supporting 100+ concurrent laptops, smartphones, and IoT devices per zone without lag.",
          points: [
            "Separate VLANs for Engineering, Finance, VoIP, and Guests",
            "Automated RF optimization eliminating local frequency interference",
            "Centralized cloud controller with real-time bandwidth analytics"
          ],
          icon: Wifi
        }
      ]}
      servicesTitle="Corporate Workplace Services"
      services={[
        {
          title: "Network Infrastructure",
          desc: "Core routing and structured cabling.",
          href: "/services/network-infrastructure",
          icon: Server
        },
        {
          title: "Smart Access Control",
          desc: "Biometrics and server room locks.",
          href: "/services/smart-access-control",
          icon: Lock
        },
        {
          title: "Hardware Management",
          desc: "Workstation procurement and AMC.",
          href: "/services/lifecycle-hardware",
          icon: Cpu
        },
        {
          title: "System Administration",
          desc: "Active directory and cloud backup.",
          href: "/services/software-system-admin",
          icon: Terminal
        }
      ]}
      caseStudy={{
        title: "Smart Biometrics & RFID Lock Integration for Financial Hub",
        location: "Panaji, Goa",
        challenge: "80+ daily employees causing reception bottlenecks and unverified entries into the physical accounts archive.",
        solution: "Installed glass-door biometric readers, server room electromagnetic locks, and automated audit logging.",
        outcome: "Front-desk queue reduced by 85%, complete compliance auditing, and fail-safe fire release integration."
      }}
      faqs={[
        {
          question: "Can you configure dual-ISP failover with our existing internet providers?",
          answer: "Yes. We configure managed routers and firewalls to accept multiple WAN connections (e.g. BSNL, Airtel, local fiber) and automate instantaneous failover."
        },
        {
          question: "How do you ensure server room security?",
          answer: "We deploy electromagnetic door locks with multi-factor biometric/card authentication, anti-tailgating sensors, and dedicated HD CCTV surveillance."
        },
        {
          question: "Can our remote workers securely connect to the office server?",
          answer: "Yes, we configure encrypted SSL-VPN tunnels on your corporate hardware firewall, giving remote employees fast and secure access to local files."
        },
        {
          question: "Do you offer on-site IT support agreements for offices?",
          answer: "Yes, our Annual Maintenance Contracts provide same-day on-site troubleshooting, routine preventive check-ups, and guaranteed local spare swaps in Goa."
        }
      ]}
    />
  );
}
