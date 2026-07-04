import { requireSalesSession } from '@/lib/server-role-guard';
import { WhatsAppInbox } from '@/components/chat/WhatsAppInbox';

export default async function SalesWhatsAppPage() {
  const session = await requireSalesSession();

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90">My WhatsApp Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">Viewing conversations automatically routed to you</p>
        </div>
      </div>
      
      {/* Pass the logged in sales agent ID to filter chats */}
      <WhatsAppInbox userId={session.user.id} />
    </div>
  );
}
