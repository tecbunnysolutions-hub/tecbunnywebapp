'use client';

import React from 'react';
import Link from 'next/link';
import { Share2, Zap, Shield, Cpu, Network, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { Badge } from "@tecbunny/ui";
import { useViralAttribution } from '@/hooks/use-viral-attribution';
import { toast } from '@/hooks/use-toast';
import { InteractiveTopologyDiagram } from './InteractiveTopologyDiagram';

interface BlueprintShowcaseProps {
  blueprint: any;
}

export function BlueprintShowcase({ blueprint }: BlueprintShowcaseProps) {
  const { config_payload: config, id } = blueprint;
  const { trackLanding } = useViralAttribution();

  React.useEffect(() => {
    trackLanding(id);
  }, [id, trackLanding]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'TecBunny security setup', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied', description: 'You can paste this link into a message when you’re ready.' });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast({ title: 'Share this saved layout', description: 'Copy the page address from your browser to share it.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Visual Showcase Panel */}
      <div className="lg:col-span-2 space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Network className="w-64 h-64 text-primary" />
          </div>

          <div className="relative z-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Public Shared Blueprint</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {config.cameraCount}x Node {config.systemType} Architecture
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              A saved layout for {config.premiseType} requirements. Review the proposed equipment and discuss the details for your site.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Cpu, label: 'Resolution', value: config.resolution },
              { icon: Shield, label: 'Storage', value: config.storage },
              { icon: Network, label: 'Topology', value: config.cameraCount > 16 ? 'Multi-Switch' : 'Single-Node' },
              { icon: CheckCircle2, label: 'Plan', value: 'Saved layout' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border">
                <stat.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Diagram Block */}
        <InteractiveTopologyDiagram config={config} />
      </div>

      {/* Sidebar Inbound Conversion */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-md sticky top-28">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" /> Make it fit your space
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share your location and requirements with our team. We can discuss equipment, placement and the next step for a site-specific quote.
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-lg rounded-xl transition-all shadow-lg shadow-primary/20">
                <Link href={`/contact?subject=sales&source=blueprint&message=${encodeURIComponent(`I would like to discuss saved blueprint ${id}.`)}`}>Discuss this layout</Link>
              </Button>
              <Button onClick={handleShare} variant="outline" className="w-full border-border text-muted-foreground h-12">
                <Share2 className="mr-2 h-4 w-4" /> Share Design Layout
              </Button>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-xs text-foreground">PI</div>
                <div>
                  <p className="text-xs font-bold text-foreground">Creator: {blueprint.profiles?.name || 'Community member'}</p>
                  <p className="text-[10px] text-muted-foreground">Blueprint author</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                CCTV design layouts are subject to final site survey dimensions and structural layout parameters.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
