'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Camera, Headphones, Monitor, Network, Search, ShieldCheck, ShoppingBag, Smartphone, Wifi } from 'lucide-react';

const categories = [
  { title: 'Computers & Devices', detail: 'Buy • Repair • Upgrade', href: '/services/computers-mobiles', icon: Monitor },
  { title: 'Networking & Internet', detail: 'Wi-Fi • Network Setup • Support', href: '/services/networking-internet', icon: Wifi },
  { title: 'CCTV & Security', detail: 'Buy • Install • Repair', href: '/services/cctv-security', icon: Camera },
  { title: 'Business IT', detail: 'Infrastructure • AMC • IT Support', href: '/services/lifecycle-hardware', icon: Building2 },
  { title: 'Hotel & Resort Technology', detail: 'Wi-Fi • CCTV • Network • IT', href: '/services/smart-infrastructure', icon: Building2 },
  { title: 'Shop Products', detail: 'Computers • CCTV • Networking • Accessories', href: '/products', icon: ShoppingBag },
] as const;

const quickActions = [
  ['Repair my device', '/services/computers-mobiles', Smartphone], ['Install CCTV', '/services/cctv-security', Camera],
  ['Fix my Wi-Fi', '/services/networking-internet', Network], ['Request IT support', '/services/lifecycle-hardware', Headphones],
  ['Get a business solution', '/services/network-infrastructure', Building2], ['Talk to TecBunny', '/contact?intent=service_request&source=homepage', ShieldCheck],
] as const;

const popular = [
  ['CCTV Installation', '/services/cctv-security'], ['Wi-Fi & Networking', '/services/networking-internet'],
  ['Computer Repair', '/services/computers-mobiles'], ['IT Support & AMC', '/services/lifecycle-hardware'],
  ['Access Control', '/services/smart-access-control'], ['Hotel Technology', '/services/smart-infrastructure'],
];

export default function HomePage(_props: { initialPartnerBrands?: Array<{ name: string; logoUrl: string }>; initialHeroCarousel?: unknown }) {
  return <div className="bg-zinc-950 text-white">
    <section className="tb-premium-hero border-b border-zinc-800">
      <div className="tb-container py-14 sm:py-20 lg:py-24"><div className="max-w-3xl">
        <p className="tb-hero-reveal tb-hero-reveal--1 mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-sm font-semibold text-blue-200"><ShieldCheck size={16}/> Local technology team in Goa</p>
        <h1 className="tb-hero-reveal tb-hero-reveal--2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Technology &amp; security solutions for your business.</h1>
        <p className="tb-hero-reveal tb-hero-reveal--3 mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">TecBunny supplies, installs and supports computers, Wi-Fi, CCTV, access control and business IT for homes, shops, offices and hospitality.</p>
        <form action="/services" className="tb-hero-reveal tb-hero-reveal--4 mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-2 shadow-2xl"><Search className="ml-2 shrink-0 text-zinc-400"/><input name="query" aria-label="Search TecBunny services" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-base outline-none placeholder:text-zinc-500" placeholder="Search CCTV, laptop repair, Wi-Fi, AMC..."/><button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold hover:bg-blue-500">Search</button></form>
        <div className="tb-hero-reveal tb-hero-reveal--5 mt-5 flex flex-col gap-3 sm:flex-row"><Link href="/contact?intent=service_request&source=homepage_hero" className="tb-premium-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-bold hover:bg-blue-500">Get help <ArrowRight size={17}/></Link><Link href="#needs" className="tb-premium-button inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-700 px-5 font-bold hover:border-blue-400">Explore services</Link></div>
      </div></div>
    </section>
    <section id="needs" className="tb-container py-12 sm:py-16"><div className="mb-7"><p className="text-sm font-bold uppercase tracking-widest text-blue-400">Start here</p><h2 className="mt-2 text-3xl font-bold">What do you need today?</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map(({ title, detail, href, icon: Icon }) => <Link key={title} href={href} className="tb-service-card rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"><Icon className="tb-service-card__icon mb-7 text-blue-400" size={30}/><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm text-zinc-400">{detail}</p><span className="tb-service-card__link mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-300">Explore <ArrowRight size={15}/></span></Link>)}</div></section>
    <section className="border-y border-zinc-800 bg-zinc-900/40"><div className="tb-container py-12"><h2 className="text-2xl font-bold">Choose the way you want help</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{quickActions.map(([label, href, Icon]) => <Link key={label} href={href} className="flex min-h-14 items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 font-semibold hover:border-blue-500 hover:text-blue-200"><Icon size={20} className="text-blue-400"/>{label}<ArrowRight size={16} className="ml-auto"/></Link>)}</div></div></section>
    <section className="tb-container py-12 sm:py-16"><div className="mb-7"><p className="text-sm font-bold uppercase tracking-widest text-blue-400">Popular services</p><h2 className="mt-2 text-3xl font-bold">Get to the right service, faster.</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{popular.map(([label, href]) => <Link key={label} href={href} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 font-semibold hover:border-blue-500 hover:text-blue-200">{label}<ArrowRight size={16} className="float-right mt-1 text-blue-400"/></Link>)}</div></section>
    <section className="border-t border-zinc-800"><div className="tb-container grid gap-8 py-12 sm:grid-cols-[1fr_auto] sm:items-center"><div><h2 className="text-2xl font-bold">Not sure which solution you need?</h2><p className="mt-2 text-zinc-400">Tell us about your space or problem. TecBunny will help you find the practical next step.</p></div><Link href="/contact?intent=service_request&source=homepage_final" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 font-bold hover:bg-blue-500">Talk to TecBunny</Link></div></section>
  </div>;
}
