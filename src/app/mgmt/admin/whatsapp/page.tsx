import { requireAdminSession } from '@/lib/server-role-guard';
import { WhatsAppInbox } from '@/components/chat/WhatsAppInbox';

export default async function AdminWhatsAppPage() {
  await requireAdminSession();

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90">WhatsApp Omnichannel</h1>
          <p className="text-sm text-muted-foreground mt-1">Superadmin View - Monitoring all active conversations globally</p>
        </div>
      </div>
      
      <WhatsAppInbox />
    </div>
  );
}
