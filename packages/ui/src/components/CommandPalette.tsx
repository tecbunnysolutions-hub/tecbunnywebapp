'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  Settings,
  User,
  Package,
  ShoppingBag,
  FileText,
  Megaphone,
  ClipboardList,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { commandActionGroups, enterpriseActions, type EnterpriseActionId } from './enterprise-actions';
import { trackProductEvent } from '../product-telemetry';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command';

const ACTION_ICONS: Record<EnterpriseActionId, LucideIcon> = {
  createFieldOrder: ShoppingBag,
  leadCenter: User,
  findInvoice: FileText,
  orderOperations: ClipboardList,
  salesDashboard: ShoppingBag,
  inventory: Package,
  accounts: Calculator,
  serviceTickets: Wrench,
  staffOperations: User,
  broadcastDesk: Megaphone,
  adminSettings: Settings,
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {commandActionGroups.map((group, index) => (
            <React.Fragment key={group.heading}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.heading}>
                {group.actionIds.map((actionId) => {
                  const action = enterpriseActions[actionId];
                  const Icon = ACTION_ICONS[actionId];

                  return (
                    <CommandItem
                      key={action.id}
                      onSelect={() => runCommand(() => {
                        trackProductEvent('command_palette_action_selected', {
                          actionId: action.id,
                          href: action.href,
                        });
                        router.push(action.href);
                      })}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{action.label}</span>
                      {'shortcut' in action && action.shortcut ? <CommandShortcut>{action.shortcut}</CommandShortcut> : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
