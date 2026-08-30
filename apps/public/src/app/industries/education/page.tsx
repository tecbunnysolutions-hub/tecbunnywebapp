import type { Metadata } from 'next';
import { 
  Award, 
  Wifi, 
  Shield, 
  Lock, 
  Server, 
  Cpu, 
  Layers, 
  Eye 
} from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { IndustryLandingPage } from '@/components/IndustryLandingPage';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Education & Campus Technology Solutions Goa | TecBunny',
    description: 'Campus-wide Wi-Fi networks, content-filtering firewalls, computer lab structured cabling, and comprehensive CCTV surveillance for schools and colleges in Goa.',
    keywords: [
      'school Wi-Fi Goa',
      'college campus network Goa',
      'school CCTV surveillance Goa',
      'computer lab networking Goa',
      'campus firewall content filtering',
      'TecBunny'
    ],
    path: '/industries/education',
    image: BRAND_LOGO_URL,
  });
}

export default function EducationIndustryPage() {
  return (
    <IndustryLandingPage
      industryKey="education"
      badge="Education & Campuses"
      title="Technology Infrastructure for"
      subtitle="Schools, Colleges & Training Institutes in Goa"
      heroLede="Create safe, high-speed learning environments with campus-wide Wi-Fi, intelligent content-filtering firewalls, structured computer lab networks, and comprehensive perimeter CCTV security."
      primaryCtaText="Request Campus Technology Assessment"
      problemsTitle="Technology Challenges in Educational Institutions"
      problemsSubtitle="Schools and colleges face heavy concurrent bandwidth demand, student web safety regulations, and vast perimeter security requirements."
      problems={[
        {
          title: "Uncontrolled Internet Access & Inappropriate Content",
          desc: "Without active layer-7 web filtering firewalls, students can access non-educational websites and exhaust school bandwidth.",
          impact: "Safety violations, distraction in classrooms, and bandwidth exhaustion."
        },
        {
          title: "Campus-Wide Coverage Gaps & Slow Lab Networks",
          desc: "Outdated cabling in computer labs and poor Wi-Fi coverage across auditoriums cause practical exam delays and network crashes.",
          impact: "Interrupted digital exams, student frustration, and hindered teaching."
        },
        {
          title: "Vulnerable Campus Gates & Unmonitored Corridors",
          desc: "Limited CCTV camera coverage across expansive sports grounds and entry gates increases safety risks for students and staff.",
          impact: "Student safety vulnerabilities and lack of video evidence during incidents."
        }
      ]}
      solutionsTitle="Engineered Campus Technology Ecosystem"
      solutionsSubtitle="Safe, scalable, and bandwidth-optimized infrastructure designed for modern educational institutions."
      solutions={[
        {
          title: "Campus-Wide Enterprise Wi-Fi & Content Filtering",
          desc: "Next-gen hardware firewalls with deep packet inspection that block malicious domains while prioritizing digital learning tools.",
          points: [
            "Bandwidth quotas and traffic shaping for lab computers",
            "Isolated staff, administration, and student networks",
            "High-capacity access points for auditoriums and libraries"
          ],
          icon: Wifi
        },
        {
          title: "Comprehensive Perimeter & Classroom CCTV",
          desc: "Full HD IP camera arrays with long-range night vision covering school gates, hallways, bus drop-off points, and sports complexes.",
          points: [
            "Central principal monitoring console and secure local storage",
            "Motion alerts at boundary walls after school hours",
            "Surge protection preventing lightning damage during monsoons"
          ],
          icon: Shield
        },
        {
          title: "High-Density Computer Lab Structured Cabling",
          desc: "Heavy-duty Cat6 cabling layouts engineered for 50-100+ lab computers with proper cable trays, patch panels, and surge protection.",
          points: [
            "Gigabit switching eliminating lag during online testing",
            "Color-coded wiring for rapid faculty troubleshooting",
            "Centralized UPS power distribution for clean electricity"
          ],
          icon: Server
        },
        {
          title: "Visitor Management & RFID Attendance",
          desc: "Automated gate visitor pass systems and contactless RFID smart cards for student and staff attendance logging.",
          points: [
            "Instant SMS notifications upon student gate transit",
            "Emergency lockdown integration with main entry gates",
            "Library book tracking and staff room access control"
          ],
          icon: Lock
        }
      ]}
      servicesTitle="Campus Technology Services"
      services={[
        {
          title: "Network Infrastructure",
          desc: "Campus Wi-Fi and lab structured cabling.",
          href: "/services/network-infrastructure",
          icon: Server
        },
        {
          title: "Physical Security",
          desc: "Perimeter cameras and central NVRs.",
          href: "/services/physical-security",
          icon: Shield
        },
        {
          title: "Smart Access Control",
          desc: "RFID gate and lab access locks.",
          href: "/services/smart-access-control",
          icon: Lock
        },
        {
          title: "System Administration",
          desc: "OS staging and lab PC deployment.",
          href: "/services/software-system-admin",
          icon: Cpu
        }
      ]}
      faqs={[
        {
          question: "Can your firewalls block adult content, gaming, and torrents on student Wi-Fi?",
          answer: "Yes, our next-generation firewalls utilize category-based filtering to block inappropriate websites, social media, and torrent downloads while ensuring educational portals run at high speed."
        },
        {
          question: "How do you protect outdoor cameras across large school grounds from lightning?",
          answer: "We install dedicated Surge Protection Devices (SPDs) and use shielded outdoor cables with proper grounding on all external camera runs to prevent lightning grid damage."
        },
        {
          question: "Can you wire our computer lab during school vacation or weekends?",
          answer: "Yes, we schedule cabling and installation work during school breaks, weekends, or evenings to ensure normal academic schedules are not disrupted."
        },
        {
          question: "Do you provide training for our school IT administrators?",
          answer: "Yes, our engineers provide complete hands-on handover training and documentation so school staff can easily manage camera feeds and student Wi-Fi access."
        }
      ]}
    />
  );
}
