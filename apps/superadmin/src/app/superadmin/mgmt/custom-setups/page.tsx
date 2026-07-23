"use client";

import { useState } from 'react';
import { DollarSign, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tecbunny/ui";
import CustomSetupPriceManager from '@/components/superadmin/CustomSetupPriceManager';
import CustomSetupOffersManager from '@/components/superadmin/CustomSetupOffersManager';

export default function CustomSetupsPage() {
  const [activeTab, setActiveTab] = useState<'prices' | 'offers'>('prices');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Customised Setups Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Superadmin portal controls for setup pricing matrices, hardware component overrides, base fees, and promotional discounts.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'prices' | 'offers')} className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl grid grid-cols-2 max-w-md">
          <TabsTrigger
            value="prices"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 py-2 transition-all"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Price Management
          </TabsTrigger>
          <TabsTrigger
            value="offers"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 py-2 transition-all"
          >
            <Tag className="w-3.5 h-3.5" />
            Promotional Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="mt-0 focus-visible:outline-none">
          <CustomSetupPriceManager />
        </TabsContent>

        <TabsContent value="offers" className="mt-0 focus-visible:outline-none">
          <CustomSetupOffersManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}