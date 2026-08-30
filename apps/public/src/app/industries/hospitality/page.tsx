import type { Metadata } from 'next';
import { 
  Wifi, 
  Shield, 
  Lock, 
  Zap, 
  Server, 
  Headphones, 
  Eye, 
  Key, 
  Activity 
} from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { IndustryLandingPage } from '@/components/IndustryLandingPage';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Hospitality & Resort Technology Solutions Goa | TecBunny',
    description: 'Specialized technology integration for hotels and resorts in Goa. High-density guest Wi-Fi, RFID smart door locks, ColorVu IP CCTV, and room automation.',
    keywords: [
      'hotel Wi-Fi Goa',
      'resort CCTV Goa',
      'hotel RFID locks Goa',
      'hospitality IT infrastructure',
      'GRMS guest room management',
      'hotel network support Goa',
      'TecBunny'
    ],
    path: '/industries/hospitality',
    image: BRAND_LOGO_URL,
  });
}

export default function HospitalityIndustryPage() {
  return (
    <IndustryLandingPage
      industryKey="hospitality"
      badge="Hospitality & Resorts"
      title="Technology Infrastructure for"
      subtitle="Hotels, Resorts & Luxury Villas in Goa"
      heroLede="Deliver flawless guest experiences with high-density Wi-Fi that eliminates dead zones, contactless RFID door locks, 24/7 ColorVu CCTV surveillance, and energy-saving room automation."
      primaryCtaText="Request Hotel Technology Assessment"
      problemsTitle="Common Technology Headaches Faced by Goa Resorts"
      problemsSubtitle="Hospitality properties encounter unique environmental and operational technology hurdles that damage guest satisfaction scores."
      problems={[
        {
          title: "Guest Wi-Fi Dead Zones & Slow Roaming",
          desc: "Thick Portuguese-style laterite stone walls and expansive outdoor lawns cause signal drops, buffer loops, and negative TripAdvisor reviews.",
          impact: "Guest dissatisfaction, negative OTA reviews, and front-desk complaint congestion."
        },
        {
          title: "Corrosion & Power Surge CCTV Failures",
          desc: "High coastal humidity, saline sea air, and frequent monsoon power grid spikes destroy consumer-grade camera optics and power supplies.",
          impact: "Security blind spots during critical incidents and expensive frequent hardware replacements."
        },
        {
          title: "Unreliable Room Keycards & Lock Desync",
          desc: "Older magnetic stripe or unencrypted RFID locks lose synchronization, forcing frustrated guests back to the reception desk after check-in.",
          impact: "Front-desk queues, guest delays, and security log auditing blind spots."
        }
      ]}
      solutionsTitle="Engineered Hospitality Technology Ecosystem"
      solutionsSubtitle="A unified, enterprise-grade architecture designed specifically for coastal resort climates and demanding hospitality workflows."
      solutions={[
        {
          title: "High-Density Seamless Mesh Wireless",
          desc: "We deploy enterprise Wi-Fi 6 access points with sub-50ms roaming algorithms, enabling uninterrupted video streaming across multi-acre resort grounds.",
          points: [
            "Bandwidth management & guest captive portal with OTP login",
            "Separate, isolated staff and PMS billing VLANs",
            "Weatherproof IP67 outdoor APs covering pools and beachfronts"
          ],
          icon: Wifi
        },
        {
          title: "ColorVu Low-Light IP Surveillance",
          desc: "Full property perimeter and common area coverage providing 24/7 high-resolution color feeds even in pitch darkness with zero IR glare.",
          points: [
            "AI line-crossing alerts for restricted beach entry points",
            "Centralized monitoring control rooms with RAID storage redundancy",
            "Lightning & surge protection devices (SPDs) on all external cable runs"
          ],
          icon: Shield
        },
        {
          title: "Encrypted RFID Hospitality Locks & Access",
          desc: "Heavy-duty European-standard mortise RFID smart locks that integrate with your Property Management System (PMS) for instant key issuance.",
          points: [
            "Contactless Mifare RFID cards and BLE smartphone unlock ready",
            "Master key override and detailed audit log generation",
            "Fail-safe emergency release connected to the central fire alarm"
          ],
          icon: Lock
        },
        {
          title: "Guest Room Management & Energy Automation (GRMS)",
          desc: "Intelligent welcome lighting scenes, keycard power saver switches, and automated climate shutoffs when patio doors are opened.",
          points: [
            "Reduces HVAC electricity consumption by up to 25-30%",
            "Custom touch switch panels with 'Do Not Disturb' & 'Make Up Room' indicators",
            "Central front-desk dashboard tracking room occupancy and status"
          ],
          icon: Zap
        }
      ]}
      servicesTitle="Hospitality Technology Services"
      services={[
        {
          title: "Network Infrastructure",
          desc: "Structured cabling and managed routing.",
          href: "/services/network-infrastructure",
          icon: Server
        },
        {
          title: "Physical Security",
          desc: "ColorVu cameras and NVR arrays.",
          href: "/services/physical-security",
          icon: Shield
        },
        {
          title: "Smart Access Control",
          desc: "RFID locks and turnstile gates.",
          href: "/services/smart-access-control",
          icon: Lock
        },
        {
          title: "Smart Infrastructure",
          desc: "Integrated GRMS and room automation.",
          href: "/services/smart-infrastructure",
          icon: Zap
        }
      ]}
      caseStudy={{
        title: "6-Node Enterprise Mesh Network for Anjuna Heritage Estate",
        location: "Anjuna, North Goa",
        challenge: "18-inch thick heritage stone walls and expansive 12,000 sq ft footprint causing severe Wi-Fi dropouts for international guests.",
        solution: "Fitted shielded Cat6 outdoor lines, discrete PoE ceiling access points, and multi-VLAN guest isolation.",
        outcome: "Sub-50ms roaming across the entire estate with sustained 450+ Mbps throughput and zero guest Wi-Fi complaints."
      }}
      faqs={[
        {
          question: "How do you handle Wi-Fi through thick Portuguese laterite stone walls?",
          answer: "We perform active RF heatmapping during the on-site survey and run discrete Cat6 cables directly to individual room access points or high-gain corridor arrays, eliminating signal degradation through dense stone."
        },
        {
          question: "Can your RFID door locks integrate with our existing PMS system?",
          answer: "Yes, our hotel locks support standard SDK and API integrations with popular hospitality Property Management Systems for automated key encoding upon check-in."
        },
        {
          question: "Do you offer Annual Maintenance Contracts (AMC) for resorts in Goa?",
          answer: "Yes, our hospitality AMCs include scheduled monthly preventive maintenance, on-site emergency troubleshooting, and local hardware spare swap guarantees in Goa."
        },
        {
          question: "How long does a typical resort CCTV or network deployment take?",
          answer: "For a 20-50 room boutique hotel or resort, installation and Fluke cable certification typically take 5 to 10 working days, scheduled to avoid disturbing active guests."
        }
      ]}
    />
  );
}
