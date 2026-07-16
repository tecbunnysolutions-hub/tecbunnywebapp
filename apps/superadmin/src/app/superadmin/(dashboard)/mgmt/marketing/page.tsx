'use client';

import React from 'react';
import { OffersManagement, AutoOffersManagement, AdminCoupons } from '@tecbunny/admin-ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tecbunny/ui";
import { Megaphone, Percent, Ticket } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Target</h1>
          <p className="text-muted-foreground">
            Manage your marketing campaigns, offers, and coupons.
          </p>
        </div>
      </div>

      <Tabs defaultValue="offers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            General Offers
          </TabsTrigger>
          <TabsTrigger value="auto_offers" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Auto Offers
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Coupons
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="offers">
          <OffersManagement />
        </TabsContent>
        
        <TabsContent value="auto_offers">
          <AutoOffersManagement />
        </TabsContent>
        
        <TabsContent value="coupons">
          <AdminCoupons />
        </TabsContent>
      </Tabs>
    </div>
  );
}
