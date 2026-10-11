import type { Metadata } from 'next';
import Link from 'next/link';

import { createPageMetadata } from '@tecbunny/core/metadata';

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
    description: 'Mobile-first business websites with source-code handover and free hosting.',
    href: '/webdev',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Services in Goa | TecBunny',
    description: 'CCTV, IT support, RFID locks, networking and website development for homes and small businesses in North Goa and the Sawantwadi area.',
    path: '/services',
    image: '/opengraph-image',
  });
}

export default function ServicesPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="tb-container py-16 sm:py-20">
          <h1 className="text-4xl font-bold sm:text-5xl">TecBunny services</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">
            Five practical services for homes and small businesses. Choose the area where you need help, then we will explain the right next step before work starts.
          </p>
        </div>
      </section>
      <section className="tb-container py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => (
            <Link key={service.name} href={service.href} className="flex min-h-60 flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-400">
              <h2 className="text-xl font-bold">{service.name}</h2>
              <p className="mt-4 flex-1 leading-7 text-zinc-300">{service.description}</p>
              <span className="mt-6 font-semibold text-blue-300">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
