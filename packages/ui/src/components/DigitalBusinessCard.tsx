import * as React from 'react';
import { QrCode, Phone, Mail, Globe, MapPin, Share2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export interface DigitalBusinessCardProps {
  salesExec: {
    id: string;
    name: string;
    title: string;
    phone: string;
    email: string;
    company: string;
    website: string;
    address: string;
  };
}

export function DigitalBusinessCard({ salesExec }: DigitalBusinessCardProps) {
  // Mock QR code URL (in a real app, this would be generated linking to the lead capture page with ?ref=salesExec.id)
  const leadCaptureUrl = `https://tecbunny.com/contact?ref=${salesExec.id}`;

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto items-center md:items-stretch">
      {/* Front of Card */}
      <Card className="w-80 h-[480px] flex flex-col overflow-hidden bg-gradient-to-br from-primary to-card text-foreground relative shadow-2xl">
        <div className="absolute top-0 right-0 p-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="p-8 pb-4 flex-1 z-10 flex flex-col justify-end">
          <div className="mb-auto mt-4">
            <div className="w-16 h-16 bg-card/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-border/20">
              <span className="text-2xl font-black tracking-tighter text-primary">TB</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-1">{salesExec.name}</h2>
          <p className="text-primary font-medium tracking-wide text-sm uppercase">{salesExec.title}</p>
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary my-6"></div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary" />
              <span>{salesExec.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary" />
              <span>{salesExec.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-primary" />
              <span>{salesExec.website}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-xs leading-tight">{salesExec.address}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Back / Digital Actions */}
      <Card className="w-80 h-[480px] p-8 flex flex-col items-center justify-center text-center bg-card border-dashed shadow-xl">
        <div className="w-48 h-48 bg-muted rounded-xl p-4 border flex items-center justify-center mb-6 relative group cursor-pointer overflow-hidden">
          <QrCode className="w-full h-full text-foreground" />
          <div className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="font-bold text-sm">Scan to Connect</span>
            <span className="text-[10px] mt-1 opacity-80">{leadCaptureUrl}</span>
          </div>
        </div>

        <h3 className="font-bold text-foreground mb-2">Connect with {salesExec.name.split(' ')[0]}</h3>
        <p className="text-xs text-muted-foreground mb-8">Scan the QR code to instantly save my contact details and request a consultation.</p>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 text-xs h-9">Download vCard</Button>
          <Button className="flex-1 text-xs h-9 bg-primary hover:bg-primary text-primary-foreground">
            <Share2 className="w-3 h-3 mr-2" /> Share
          </Button>
        </div>
      </Card>
    </div>
  );
}
