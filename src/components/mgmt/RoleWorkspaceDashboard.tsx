'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  IndianRupee,
  MapPinned,
  PackageCheck,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

import { useAuth } from '@/lib/hooks';
import { ROLE_DISPLAY_NAME, type UserRole } from '@/lib/roles';

type WorkspaceKind =
  | 'sales-manager'
  | 'store-executive'
  | 'sales-agent'
  | 'service-manager'
  | 'service-engineer'
  | 'accounts';

interface WorkspaceAction {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface WorkspaceConfig {
  eyebrow: string;
  title: string;
  description: string;
  scope: string;
  primaryAction: WorkspaceAction;
  actions: WorkspaceAction[];
  focus: Array<{ label: string; value: string; icon: LucideIcon }>;
}

const WORKSPACES: Record<WorkspaceKind, WorkspaceConfig> = {
  'sales-manager': {
    eyebrow: 'Regional sales command',
    title: 'Move the territory forward.',
    description: 'Monitor regional order flow, support the sales team, and clear dispatch bottlenecks.',
    scope: 'Assigned sales area',
    primaryAction: { href: '/mgmt/manager/online-orders', title: 'Review dispatch queue', description: 'Open regional online orders', icon: PackageCheck },
    actions: [
      { href: '/mgmt/manager/salesperson', title: 'Sales team', description: 'Review team activity and assignments', icon: Users },
      { href: '/mgmt/manager/inventory', title: 'Regional inventory', description: 'Check available stock for fulfilment', icon: ShoppingBag },
      { href: '/mgmt/manager/reports', title: 'Performance reports', description: 'Read territory sales performance', icon: BarChart3 },
      { href: '/mgmt/manager/invoice-lookup', title: 'Invoice lookup', description: 'Find a customer invoice quickly', icon: FileSearch },
    ],
    focus: [
      { label: 'Access boundary', value: 'Regional', icon: MapPinned },
      { label: 'Team branch', value: 'Sales', icon: Users },
      { label: 'Dispatch control', value: 'Enabled', icon: CheckCircle2 },
    ],
  },
  'store-executive': {
    eyebrow: 'Retail operations',
    title: 'Your store desk, without the clutter.',
    description: 'Bill walk-ins, process assigned orders, and keep every pickup moving.',
    scope: 'Assigned storefront',
    primaryAction: { href: '/mgmt/sales-staff/quick-billing', title: 'Start quick billing', description: 'Open the point-of-sale flow', icon: Zap },
    actions: [
      { href: '/mgmt/sales-staff/order-tracking', title: 'Order fulfilment', description: 'Pick, pack, and track assigned orders', icon: PackageCheck },
      { href: '/mgmt/sales-staff/invoice-lookup', title: 'Invoice lookup', description: 'Retrieve a customer invoice', icon: Receipt },
      { href: '/mgmt/sales-staff/reports', title: 'Store reports', description: 'Review store-level activity', icon: BarChart3 },
    ],
    focus: [
      { label: 'Workspace', value: 'Storefront', icon: BriefcaseBusiness },
      { label: 'Billing mode', value: 'Ready', icon: Zap },
      { label: 'Pricing access', value: 'Locked', icon: ShieldCheck },
    ],
  },
  'sales-agent': {
    eyebrow: 'Independent sales',
    title: 'Orders and commission, clearly separated.',
    description: 'Place customer orders and track only the commission activity tied to your Agent ID.',
    scope: 'Personal agent account',
    primaryAction: { href: '/mgmt/sales-external/quick-billing', title: 'Create customer order', description: 'Place an order on behalf of a buyer', icon: ShoppingBag },
    actions: [
      { href: '/mgmt/sales-external/commission-report', title: 'My commission', description: 'Review personal order volume and earnings', icon: IndianRupee },
      { href: '/mgmt/sales-external/reports', title: 'Agent reports', description: 'View your own sales activity', icon: BarChart3 },
    ],
    focus: [
      { label: 'Data scope', value: 'Personal', icon: ShieldCheck },
      { label: 'Order mode', value: 'Delegated', icon: ShoppingBag },
      { label: 'Commission', value: 'Read only', icon: IndianRupee },
    ],
  },
  'service-manager': {
    eyebrow: 'Regional service command',
    title: 'Balance the field workload.',
    description: 'Dispatch regional tickets, coordinate engineers, and keep service milestones on schedule.',
    scope: 'Assigned service area',
    primaryAction: { href: '/mgmt/service-manager/tickets', title: 'Open regional tickets', description: 'Review and dispatch the service queue', icon: ClipboardCheck },
    actions: [
      { href: '/mgmt/service-manager/tickets', title: 'Dispatch board', description: 'Prioritize and assign active service work', icon: Wrench },
    ],
    focus: [
      { label: 'Access boundary', value: 'Regional', icon: MapPinned },
      { label: 'Team branch', value: 'Service', icon: Wrench },
      { label: 'Engineer dispatch', value: 'Enabled', icon: CheckCircle2 },
    ],
  },
  'service-engineer': {
    eyebrow: 'Field service day',
    title: 'Only the jobs assigned to you.',
    description: 'See today’s customer visits, update milestones, and submit field completion reports.',
    scope: 'Personal engineer queue',
    primaryAction: { href: '/mgmt/service-engineer/jobs', title: 'View assigned jobs', description: 'Open your field-service schedule', icon: Wrench },
    actions: [
      { href: '/mgmt/service-engineer/jobs', title: 'My service queue', description: 'Review assigned tickets and priorities', icon: ClipboardCheck },
    ],
    focus: [
      { label: 'Data scope', value: 'Assigned only', icon: ShieldCheck },
      { label: 'Field updates', value: 'Enabled', icon: CheckCircle2 },
      { label: 'Cross-region access', value: 'Blocked', icon: MapPinned },
    ],
  },
  accounts: {
    eyebrow: 'Finance workspace',
    title: 'Keep the operational ledger readable.',
    description: 'Use a focused finance workspace for invoices and reporting without administrative controls.',
    scope: 'Finance operations',
    primaryAction: { href: '/mgmt/accounts', title: 'Review finance workspace', description: 'Continue to the operational ledger', icon: Receipt },
    actions: [],
    focus: [
      { label: 'Workspace', value: 'Finance', icon: Receipt },
      { label: 'Reports', value: 'Read enabled', icon: BarChart3 },
      { label: 'System settings', value: 'Blocked', icon: ShieldCheck },
    ],
  },
};

interface RoleWorkspaceDashboardProps {
  kind: WorkspaceKind;
}

export function RoleWorkspaceDashboard({ kind }: RoleWorkspaceDashboardProps) {
  const { user } = useAuth();
  const config = WORKSPACES[kind];
  const role = (user?.role ?? 'customer') as UserRole;
  const PrimaryIcon = config.primaryAction.icon;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.6fr] lg:p-9">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">{config.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              {config.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{config.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-300">
                {user?.name || user?.email || 'Staff member'}
              </span>
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 font-semibold text-blue-200">
                {ROLE_DISPLAY_NAME[role] ?? role}
              </span>
              <span className="rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-400">{config.scope}</span>
            </div>
          </div>

          <Link
            href={config.primaryAction.href}
            className="group flex min-h-44 flex-col justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 p-5 transition-colors hover:border-blue-400/40 hover:bg-blue-500/15"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400 text-zinc-950">
              <PrimaryIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="flex items-center justify-between gap-3 text-base font-bold text-white">
                {config.primaryAction.title}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block text-sm text-blue-100/60">{config.primaryAction.description}</span>
            </span>
          </Link>
        </div>
      </section>

      <section aria-label="Access summary" className="grid gap-3 sm:grid-cols-3">
        {config.focus.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-blue-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-zinc-500">{item.label}</p>
                  <p className="truncate text-sm font-bold text-white">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {config.actions.length > 0 ? (
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Daily tools</p>
              <h2 className="mt-1 text-xl font-bold text-white">What do you need to do?</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {config.actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={`${action.href}-${action.title}`}
                  href={action.href}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-blue-300" />
                  </div>
                  <h3 className="mt-5 text-sm font-bold text-white">{action.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
