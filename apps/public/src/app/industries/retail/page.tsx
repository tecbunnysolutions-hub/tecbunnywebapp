import type { Metadata } from 'next';
import { 
  ShoppingBag, 
  Shield, 
  Wifi, 
  Lock, 
  Server, 
  Eye, 
  Zap, 
  Activity 
} from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { IndustryLandingPage } from '@/components/IndustryLandingPage';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Retail & Commercial Technology Solutions Goa | TecBunny',
    description: 'High-uptime POS billing network resilience, anti-theft CCTV camera systems, captive customer Wi-Fi portals, and multi-store monitoring in Goa.',
    keywords: [
      'retail CCTV Goa',
      'POS network setup Goa',
      'store customer Wi-Fi',
      'commercial store security Goa',
      'retail shop automation',
      'TecBunny'
    ],
    path: '/industries/retail',
    image: BRAND_LOGO_URL,
  });
}

export default function RetailIndustryPage() {
  return (
    <IndustryLandingPage
      industryKey="retail"
      badge="Retail & Commercial"
      title="Technology Infrastructure for"
      subtitle="Retail Stores, Showrooms & Commercial Outlets in Goa"
      heroLede="Maximize transaction uptime and protect your stock with redundant POS connectivity, crystal-clear cash-counter CCTV surveillance, customer guest Wi-Fi portals, and multi-store central monitoring."
      primaryCtaText="Request Retail Technology Assessment"
      problemsTitle="Technology Vulnerabilities in Commercial Retail"
      problemsSubtitle="Retail businesses lose revenue and inventory when billing systems drop or store blind spots are exploited."
      problems={[
        {
          title: "POS Billing Terminal Offline Freezes",
          desc: "Internet outages or flaky Wi-Fi freeze billing machines and card swipers during peak evening shopping hours.",
          impact: "Abandoned customer carts, checkout queues, and lost retail sales revenue."
        },
        {
          title: "Cash-Counter Blind Spots & Shoplifting Losses",
          desc: "Low-resolution analog cameras fail to clearly display currency denominations or identify shoplifters concealing merchandise.",
          impact: "Direct inventory shrinkage, cash discrepancies, and unprovable disputes."
        },
        {
          title: "Difficulty Monitoring Multiple Store Outlets",
          desc: "Store owners struggle to view live feeds, sales activity, and staff attendance across multiple retail locations from one phone app.",
          impact: "Lack of centralized oversight and increased management travel time."
        }
      ]}
      solutionsTitle="Engineered Retail Technology Ecosystem"
      solutionsSubtitle="Built for seamless transaction speed, tight inventory security, and multi-store control."
      solutions={[
        {
          title: "Resilient POS Connectivity & Dual-WAN Backup",
          desc: "Dedicated wired Cat6 drops to all cash registers with 4G/LTE automatic failover routers to ensure card swipes never fail.",
          points: [
            "Prioritized billing bandwidth isolated from customer phones",
            "UPS power backup keeping POS terminals running during brownouts",
            "Fast transaction speeds with sub-10ms gateway response"
          ],
          icon: Server
        },
        {
          title: "High-Resolution Cash Counter & Aisle CCTV",
          desc: "Wide-angle and varifocal 4K cameras focused directly on cash drawers, customer faces, and high-value product shelves.",
          points: [
            "Crystal-clear currency note and coin visibility",
            "Motion alerts for stock rooms and loading bays after closing",
            "Multi-store live feed viewing from a single iOS/Android smartphone app"
          ],
          icon: Shield
        },
        {
          title: "Captive Customer Wi-Fi & Marketing Portals",
          desc: "High-speed guest Wi-Fi with branded splash pages that collect visitor phone numbers for seasonal promotional campaigns.",
          points: [
            "Bandwidth rate-limiting per customer device",
            "Automated guest isolation protecting internal POS terminals",
            "Social media check-in integration boosting brand visibility"
          ],
          icon: Wifi
        },
        {
          title: "Stockroom Access Control & Electronic Article Alarms",
          desc: "RFID and PIN-pad door locks restricting backroom inventory access to authorized store managers only.",
          points: [
            "Audit logs tracking exact time staff entered inventory rooms",
            "Instant notifications when back doors are left propped open",
            "Integration with store closing and opening alarm routines"
          ],
          icon: Lock
        }
      ]}
      servicesTitle="Retail Technology Services"
      services={[
        {
          title: "Network Infrastructure",
          desc: "POS network cabling and Wi-Fi portals.",
          href: "/services/network-infrastructure",
          icon: Server
        },
        {
          title: "Physical Security",
          desc: "Cash-counter cameras and multi-store NVR.",
          href: "/services/physical-security",
          icon: Shield
        },
        {
          title: "Smart Access Control",
          desc: "Stockroom RFID and staff access locks.",
          href: "/services/smart-access-control",
          icon: Lock
        },
        {
          title: "Hardware Management",
          desc: "Billing PC setup and retail printer care.",
          href: "/services/lifecycle-hardware",
          icon: ShoppingBag
        }
      ]}
      faqs={[
        {
          question: "Can I watch camera feeds from all my retail stores on my phone?",
          answer: "Yes, our NVR solutions support centralized cloud remote viewing, allowing you to monitor multiple store locations live on one mobile application."
        },
        {
          question: "Can your CCTV cameras clearly read cash bills at the register?",
          answer: "Yes, we install dedicated high-resolution varifocal cameras mounted directly above cash drawers to ensure clear visibility of all currency exchanges."
        },
        {
          question: "How do you protect POS billing from internet outages?",
          answer: "We deploy failover routers with automated 4G/5G backup SIMs that instantly take over if your primary broadband connection goes down."
        },
        {
          question: "Do you install retail systems outside regular store opening hours?",
          answer: "Yes, we can perform installation after store closing hours or early mornings so your daily retail customer operations are not interrupted."
        }
      ]}
    />
  );
}
