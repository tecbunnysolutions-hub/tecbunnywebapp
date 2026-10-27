import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, Network, Key } from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { PROJECT_PHOTOS } from '@/content/homepage-proof';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({ title: 'Technology Projects & Planning | TecBunny', description: 'Explore TecBunny project references when available and learn what to consider for CCTV, Wi-Fi and access-control work in Goa.', path: '/portfolio', image: '/opengraph-image' });
}

const planningNotes = [
  { icon: Network, title: 'Wi-Fi for a larger home', description: 'Start with the rooms, walls and outdoor areas that need coverage. Review cabling, access-point placement and how devices move around the property.', href: '/services/networking' },
  { icon: Camera, title: 'CCTV around an entrance', description: 'Decide what you need to see and when you need to see it. Camera position, lighting, storage and power arrangements shape a useful system.', href: '/services/cctv-security' },
  { icon: Key, title: 'Access for a shared workspace', description: 'Plan who needs access, how credentials are issued and what happens during a power failure or emergency exit.', href: '/services/rfid-locks' },
];

export default function PortfolioPage() {
  return <div className="tb-page">
    <BreadcrumbJsonLd items={[{ name: 'Home', url: 'https://www.tecbunny.com' }, { name: 'Portfolio', url: 'https://www.tecbunny.com/portfolio' }]} />
    <section className="tb-hero border-b border-border"><div className="tb-container"><p className="tb-kicker">Projects and practical planning</p><h1 className="mt-5 max-w-3xl text-4xl font-bold sm:text-5xl">Every space needs its own plan.</h1><p className="tb-lede mt-5 max-w-3xl">A working system starts with the details: the entrance you need to see, the room where Wi-Fi drops, or the door your team uses every day.</p><Link href="/contact?intent=quote_request&source=portfolio" className="tb-button mt-8">Tell us about your space <ArrowRight size={18} aria-hidden="true" /></Link></div></section>
    <section className="tb-container py-14 sm:py-20" aria-labelledby="project-reference-title"><h2 id="project-reference-title" className="text-3xl">Project references</h2>
      {PROJECT_PHOTOS.length ? <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{PROJECT_PHOTOS.map(photo => <li key={photo.src} className="tb-card overflow-hidden"><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" /><div className="p-5"><h3 className="text-xl">{photo.title}</h3><p className="mt-2 text-muted-foreground">{photo.location}</p></div></li>)}</ul> : <div className="tb-card mt-7 p-6 sm:p-8"><h3 className="text-xl">Want to discuss work similar to yours?</h3><p className="mt-3 max-w-2xl text-muted-foreground">Public project photos are not available here yet. Tell us what you are planning and ask our team about relevant experience and any references we can share.</p><Link href="/contact?intent=project_reference&source=portfolio" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">Ask about a project reference <ArrowRight size={16} aria-hidden="true" /></Link></div>}
    </section>
    <section className="border-y border-border bg-card"><div className="tb-container py-14 sm:py-20"><p className="tb-kicker">Planning examples</p><h2 className="mt-3 text-3xl">Start with the questions that matter.</h2><p className="mt-4 max-w-2xl text-muted-foreground">These are example requirements to help you plan a conversation.</p><div className="mt-8 grid gap-5 md:grid-cols-3">{planningNotes.map(({icon: Icon, title, description, href}) => <article key={title} className="rounded-xl border border-border bg-background p-6"><Icon size={26} className="text-primary" aria-hidden="true" /><h3 className="mt-5 text-xl">{title}</h3><p className="mt-3 text-muted-foreground">{description}</p><Link href={href} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">Explore the service <ArrowRight size={16} aria-hidden="true" /></Link></article>)}</div></div></section>
  </div>;
}
