import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/core/server';
import { Suspense } from 'react';

import FaqsClient from '@/components/FaqsClient';
import { Skeleton } from "@tecbunny/ui";

export const revalidate = 60; // Revalidate at most once every minute

type FaqRow = {
  id: string;
  category: string | null;
  question: string;
  answer: string;
  display_order: number | null;
};

async function fetchFaqs() {
  const supabase = isSupabaseServiceConfigured
    ? await createServiceClient()
    : await createClient();

  const { data: faqs, error } = await supabase
    .from('cms_faqs')
    .select('id, category, question, answer, display_order')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('category', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205') {
      return [];
    }

    console.error('Error loading FAQs from DB:', error);
    return [];
  }

  return ((faqs || []) as FaqRow[]).map((faq) => ({
    ...faq,
    category: faq.category ?? 'General',
    display_order: faq.display_order ?? 0,
  }));
}

export default async function FaqsPage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl min-h-screen">
      {/* Header section with explicit bounding height to prevent CLS */}
      <div className="text-center mb-12 min-h-[120px] flex flex-col justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Quickly find answers to common queries about our system, pricing, and services.
        </p>
      </div>

      {/* Suspense wrapper with a layout-stable skeleton fallback matching exact bounds */}
      <Suspense fallback={<FaqsSkeleton />}>
        <FaqsLoader />
      </Suspense>
    </div>
  );
}

async function FaqsLoader() {
  const faqs = await fetchFaqs();
  return <FaqsClient initialFaqs={faqs} />;
}

// Layout-stable skeleton skeleton loader to prevent layout shifts (CLS)
function FaqsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Search box placeholder */}
      <div className="max-w-xl mx-auto h-12 bg-muted/40 rounded-full border border-muted/50 w-full" />

      {/* Categories filter placeholder */}
      <div className="flex justify-center gap-2 h-10 w-64 mx-auto bg-muted/20 rounded-full" />

      {/* Simulated Accordion items with exact structural dimensions */}
      <div className="space-y-4 min-h-[400px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[60px] bg-muted/30 border border-muted/45 rounded-xl w-full"
          />
        ))}
      </div>
    </div>
  );
}
