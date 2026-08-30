import type { Metadata } from 'next';
import { 
  Shield, 
  Server, 
  Lock, 
  Wifi, 
  Cpu, 
  Layers, 
  Activity 
} from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { IndustryLandingPage } from '@/components/IndustryLandingPage';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Healthcare & Hospital Technology Solutions Goa | TecBunny',
    description: 'Mission-critical hospital networking, isolated patient data VLANs, pharmacy access control, and 24/7 CCTV surveillance for clinics in Goa.',
    keywords: [
      'hospital network Goa',
      'clinic IT support Goa',
      'healthcare CCTV Goa',
      'pharmacy access control',
      'medical data VLAN segregation',
      'TecBunny'
    ],
    path: '/industries/healthcare',
    image: BRAND_LOGO_URL,
  });
}

export default function HealthcareIndustryPage() {
  return (
    <IndustryLandingPage
      industryKey="healthcare"
      badge="Healthcare & Hospitals"
      title="Technology Infrastructure for"
      subtitle="Hospitals, Clinics & Diagnostic Centers in Goa"
      heroLede="Guarantee 24/7 digital uptime and data privacy with isolated medical VLANs, restricted pharmacy access control, continuous CCTV security, and zero-downtime server setups."
      primaryCtaText="Request Healthcare IT Assessment"
      problemsTitle="Critical Technology Risks in Healthcare Facilities"
      problemsSubtitle="Healthcare operations cannot tolerate network downtime or data leaks. Substandard equipment puts patient care and regulatory compliance at risk."
      problems={[
        {
          title: "Network Latency & PACS/EMR Sync Stoppages",
          desc: "Slow medical imaging file transfers (PACS) and electronic medical record (EMR) delays leave doctors waiting during critical consultations.",
          impact: "Delayed diagnoses, patient wait times, and emergency care friction."
        },
        {
          title: "Unsecured Wi-Fi & Patient Data Leakage",
          desc: "Allowing guest patients and critical diagnostic machines on the same unsegmented network creates severe cybersecurity and compliance vulnerabilities.",
          impact: "Data privacy compliance violations and potential ransomware infection."
        },
        {
          title: "Uncontrolled Access to Pharmacies & ICU Wards",
          desc: "Traditional key locks on medicine storage rooms and ICUs leave no audit trail of who accessed restricted pharmaceuticals.",
          impact: "Medicine pilferage risks, unauthorized access, and safety audit failures."
        }
      ]}
      solutionsTitle="Mission-Critical Healthcare Technology Ecosystem"
      solutionsSubtitle="Engineered for high reliability, data protection, and strict regulatory standards."
      solutions={[
        {
          title: "Isolated Medical VLANs & Gigabit Backbone",
          desc: "Strictly segregated logical networks isolating patient diagnostic machines (X-Ray, MRI, Ultrasound), staff EMR portals, and guest Wi-Fi.",
          points: [
            "Prioritized QoS bandwidth for critical life-support and monitoring feeds",
            "10G fiber backbone between diagnostic wings and server rooms",
            "Next-gen firewalls preventing unauthorized external network probes"
          ],
          icon: Server
        },
        {
          title: "Restricted Biometric & RFID Pharmacy Access",
          desc: "High-security biometric door controllers for operating theaters, ICUs, and medicine inventory rooms with instant audit logging.",
          points: [
            "Time-stamped entry logs recording every staff access attempt",
            "Emergency break-glass unlock linked to central fire safety",
            "Anti-passback rules preventing shared keycard misuse"
          ],
          icon: Lock
        },
        {
          title: "24/7 Patient Ward & Perimeter Surveillance",
          desc: "High-resolution IP CCTV cameras covering entrance corridors, emergency driveways, pharmacy counters, and parking zones.",
          points: [
            "Local RAID storage preserving footage for 30 to 90 days",
            "Night-vision clarity under low hospital night lighting",
            "Privacy masking ensuring sensitive patient areas remain unrecorded"
          ],
          icon: Shield
        },
        {
          title: "Power Surge Redundancy & Clean Infrastructure",
          desc: "Centralized online double-conversion UPS battery banks ensuring seamless operation through sudden Goa utility grid power dips.",
          points: [
            "Zero switchover transfer time protecting sensitive medical PCs",
            "Rack-mounted equipment with active temperature monitoring",
            "Same-day emergency on-site technician response SLA"
          ],
          icon: Activity
        }
      ]}
      servicesTitle="Healthcare Technology Services"
      services={[
        {
          title: "Network Infrastructure",
          desc: "Hospital Gigabit network and VLAN isolation.",
          href: "/services/network-infrastructure",
          icon: Server
        },
        {
          title: "Physical Security",
          desc: "24/7 CCTV and entrance surveillance.",
          href: "/services/physical-security",
          icon: Shield
        },
        {
          title: "Smart Access Control",
          desc: "Pharmacy and ICU biometric locks.",
          href: "/services/smart-access-control",
          icon: Lock
        },
        {
          title: "System Administration",
          desc: "Encrypted backups and server care.",
          href: "/services/software-system-admin",
          icon: Cpu
        }
      ]}
      faqs={[
        {
          question: "How do you ensure patient medical records (EMR) remain confidential?",
          answer: "We configure strict Layer-3 firewall policies that completely isolate medical servers and PACS imaging systems from public or guest internet access."
        },
        {
          question: "Can access control locks integrate with hospital emergency fire alarms?",
          answer: "Yes, all our electromagnetic and biometric door locks include automated fail-safe interfaces that instantly release all doors upon fire alarm activation."
        },
        {
          question: "Do you offer emergency response agreements for hospital networks?",
          answer: "Yes, our healthcare SLA agreements include priority emergency dispatch and on-shelf local spares in Goa to address critical network or camera outages."
        },
        {
          question: "Can your CCTV cameras mask private patient examination areas?",
          answer: "Yes, our enterprise camera systems support digital privacy masking, blacking out private patient beds or examination tables while recording corridor transit."
        }
      ]}
    />
  );
}
