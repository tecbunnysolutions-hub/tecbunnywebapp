import type { Metadata } from 'next';
import Link from 'next/link';

import { createPageMetadata } from '@tecbunny/core/metadata';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

const services = [
  {
    name: 'CCTV',
    description: 'Camera planning, installation, repair, recording and safer remote viewing.',
    href: '/services/cctv-security',
  },
  {
    name: 'IT Support',
    description: 'Computer setup, repair, upgrades, backups and practical small-business support.',
    href: '/services/it-support',
  },
  {
    name: 'RFID Locks',
    description: 'Access-control planning and installation with emergency-exit needs kept in view.',
    href: '/services/rfid-locks',
  },
  {
    name: 'Networking',
    description: 'Wi-Fi surveys, cabling, router setup, access points and guest-network planning.',
    href: '/services/networking',
  },
  {
    name: 'Website Development',
    description: 'Business websites that make your offering clear and help customers get in touch.',
    href: '/webdev',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Services in Goa | TecBunny',
    description: 'CCTV, IT support, RFID locks, networking and website development for homes and small businesses in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
    path: '/services',
    image: '/opengraph-image',
  });
}

export default function ServicesPage() {
  return (
    <div className="bg-background text-foreground">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://www.tecbunny.com' },
        { name: 'Services', url: 'https://www.tecbunny.com/services' },
      ]} />
      <section className="tb-hero border-b border-border">
        <div className="tb-container py-16 sm:py-20">
          <h1 className="text-4xl font-bold sm:text-5xl">Find the right help for your technology.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Five practical services for homes and small businesses. Choose the area where you need help, then we will explain the right next step before work starts.
          </p>
        </div>
      </section>
      <section className="tb-container py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => (
            <Link key={service.name} href={service.href} className="flex min-h-60 flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-primary">
              <h2 className="text-xl font-bold">{service.name}</h2>
              <p className="mt-4 flex-1 leading-7 text-muted-foreground">{service.description}</p>
              <span className="mt-6 font-semibold text-primary">Explore service →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
