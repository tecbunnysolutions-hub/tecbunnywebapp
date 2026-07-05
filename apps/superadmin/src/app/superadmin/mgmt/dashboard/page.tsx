import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { 
  Cpu, CreditCard, ClipboardList, Users, UserCheck, 
  Key, ArrowRight, FileText, Share2, Ticket, Wrench, 
  Globe, Building, Percent, Activity, Sliders
} from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { verifySuperadminSessionToken } from '@/lib/auth/superadmin-session';

export const dynamic = 'force-dynamic';

export default async function SuperadminDashboard() {
  const cookieStore = await cookies();
  const superadminCookie = cookieStore.get('superadmin-session')?.value;
  const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));

  if (!isSuperadmin) {
    redirect('/superadmin/login');
  }

  const supabase = createServiceClient();

  // Fetch telemetry counts from DB safely
  let userCount = 0;
  let adminCount = 0;
  let recentLogs: any[] = [];

  try {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    userCount = count || 0;

    const { count: admins } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin']);
    adminCount = admins || 0;

    const { data: logs } = await supabase
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    recentLogs = logs || [];
  } catch (e) {
    console.error('Superadmin dashboard data fetch failed:', e);
  }

  const managementBlocks = [
    {
      title: 'User Management',
      description: 'CRUD controls over Admin profiles, Staff accounts, and Customer tables.',
      href: '/superadmin/mgmt/users',
      icon: Users,
    },
    {
      title: 'Product Management',
      description: 'Comprehensive CRUD authority over store catalogs, dynamic base tiers, and pricing books.',
      href: '/superadmin/mgmt/products',
      icon: Wrench,
    },
    {
      title: 'Payment Management',
      description: 'Exclusive access to edit payment gateway credentials, webhook receivers, and keys.',
      href: '/superadmin/mgmt/payment-settings',
      icon: CreditCard,
    },
    {
      title: 'Website Management',
      description: 'Authority to modify frontend code constants, asset rendering parameters, and page modules.',
      href: '/superadmin/mgmt/settings?section=website',
      icon: Globe,
    },
    {
      title: 'Brand Management',
      description: 'Configuration of company logo images, asset paths, and brand identity metadata.',
      href: '/superadmin/mgmt/settings?section=brand',
      icon: Key,
    },
    {
      title: 'Policies Management',
      description: 'Content management over legally binding site links (Terms, Privacy, Refund policies).',
      href: '/superadmin/mgmt/policies',
      icon: FileText,
    },
    {
      title: 'AI Configurations',
      description: 'Full control over dynamic system prompt definitions, temperatures, and model choices.',
      href: '/superadmin/mgmt/ai-config',
      icon: Cpu,
    },
    {
      title: 'Social Media Management',
      description: 'Configurations for integrated external links, tracker pixels, and visual handles.',
      href: '/superadmin/mgmt/social-media',
      icon: Share2,
    },
    {
      title: 'Offers Management',
      description: 'CRUD over site-wide promotional parameters, automated campaigns, and coupons.',
      href: '/superadmin/mgmt/offers',
      icon: Ticket,
    },
    {
      title: 'Marketing Management',
      description: 'Access to target configurations, lead tracking engines, and analytical tags.',
      href: '/superadmin/mgmt/marketing',
      icon: Activity,
    },
    {
      title: 'Company Management',
      description: 'Adjustments to legal identity details (GSTIN, COI, registered business addresses).',
      href: '/superadmin/mgmt/settings?section=company',
      icon: Building,
    },
    {
      title: 'Tax Management',
      description: 'Control over dynamic multi-tier tax matrices and systemic percentage calculations.',
      href: '/superadmin/mgmt/settings?section=tax',
      icon: Percent,
    },
    {
      title: 'All Reports',
      description: 'System-wide analytical breakdowns, full metrics, and salesperson performance logs.',
      href: '/superadmin/mgmt/reports',
      icon: ClipboardList,
    },
    {
      title: 'Custom Setup Management',
      description: 'Authority over architectural structures mapping modular custom dynamic configurations.',
      href: '/superadmin/mgmt/custom-setups',
      icon: Sliders,
    },
    {
      title: 'Project Pipeline',
      description: 'Add, update, delete, and manage upcoming/pipeline investment projects and generate PDF summaries.',
      href: '/projects',
      icon: ClipboardList,
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">System Administration</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">Configure protected system parameters, inspect governance data, and manage core orchestration controls.</p>
      </div>

      {/* Grid Layout: Stats & Logs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-5 lg:col-span-2 lg:space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-lg sm:p-5">
              <div className="flex items-center justify-between mb-3 text-zinc-400">
                <span className="text-xs uppercase tracking-wider font-semibold">Total Users</span>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="text-3xl font-bold text-white font-mono">{userCount}</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-lg sm:p-5">
              <div className="flex items-center justify-between mb-3 text-zinc-400">
                <span className="text-xs uppercase tracking-wider font-semibold">Privileged Accounts</span>
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-3xl font-bold text-white font-mono">{adminCount}</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-lg sm:p-5">
              <div className="flex items-center justify-between mb-3 text-zinc-400">
                <span className="text-xs uppercase tracking-wider font-semibold">Security Core</span>
                <Key className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                Active & Enforced
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log Panel */}
        <div className="row-span-2 h-fit rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-lg sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-primary" />
              Root Audit Logs
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Live</span>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center italic">No security events recorded.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-primary font-mono uppercase font-semibold">{log.event_type}</span>
                    <span className="text-zinc-500 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-300 truncate">
                    {log.event_data?.setting_key ? `Key: ${log.event_data.setting_key}` : 'Event data modified'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 14 Management Blocks Grid */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">Management Consoles</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {managementBlocks.map((block) => {
              const IconComponent = block.icon;
              return (
                <article key={block.title} className="group flex min-h-52 flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-md transition-all hover:border-primary/30 sm:p-5">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <IconComponent className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{block.title}</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {block.description}
                    </p>
                  </div>
                  <Link 
                    href={block.href}
                    className="mt-4 inline-flex items-center gap-1 text-[11px] text-primary group-hover:text-primary font-semibold transition-colors uppercase tracking-wider"
                  >
                    Open Console <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
