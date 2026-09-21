'use client';

// Lucide icons are passed as props from server-component industry pages to
// IndustryLandingPage (a client component). Icons imported from
// 'lucide-react' inside a server component are *server* references and
// cannot cross the boundary ("Functions cannot be passed directly to Client
// Components"). Re-exporting them from this 'use client' module turns them
// into client references, which React can serialize as props.
export {
  Activity,
  Award,
  Briefcase,
  Building2,
  Cpu,
  Eye,
  FileText,
  Headphones,
  Key,
  Layers,
  Lock,
  Server,
  Shield,
  ShoppingBag,
  Terminal,
  Wifi,
  Zap,
} from 'lucide-react';
