'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, User, ShoppingBag, FileSearch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from "../lib/utils";
import { enterpriseActions, quickActionIds, type EnterpriseActionId } from './enterprise-actions';

const ACTION_ICONS: Record<EnterpriseActionId, LucideIcon> = {
  createFieldOrder: ShoppingBag,
  leadCenter: User,
  findInvoice: FileSearch,
  orderOperations: ShoppingBag,
  salesDashboard: ShoppingBag,
  inventory: ShoppingBag,
  accounts: FileSearch,
  serviceTickets: FileSearch,
  staffOperations: User,
  broadcastDesk: User,
  adminSettings: User,
};

const ACTION_COLORS: Partial<Record<EnterpriseActionId, string>> = {
  leadCenter: 'bg-primary text-primary-foreground hover:bg-primary',
  createFieldOrder: 'bg-success text-success-foreground hover:bg-success',
  findInvoice: 'bg-warning text-warning-foreground hover:bg-warning',
};

export function FloatingQuickActions() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const actions = quickActionIds.map((actionId) => ({
    ...enterpriseActions[actionId],
    icon: ACTION_ICONS[actionId],
    color: ACTION_COLORS[actionId] ?? 'bg-primary text-primary-foreground hover:bg-primary',
  }));

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in-0 duration-200">
          {actions.map((action, i) => (
            <div
              key={action.label}
              className="flex items-center gap-3 group animate-in slide-in-from-bottom-2 fade-in-0"
              style={{ animationDelay: `${(actions.length - i) * 50}ms`, animationFillMode: 'both' }}
            >
              <span className="px-2.5 py-1 text-xs font-semibold text-foreground bg-card rounded-md shadow-sm border border-border/50">
                {action.label}
              </span>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(action.href);
                }}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform hover:scale-110",
                  action.color
                )}
                title={action.label}
                aria-label={action.label}
              >
                <action.icon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-2xl shadow-primary/20 transition-all duration-300",
          open ? "bg-card text-muted-foreground rotate-45" : "bg-primary text-primary-foreground hover:bg-primary hover:scale-105"
        )}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
      >
        {open ? <Plus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
