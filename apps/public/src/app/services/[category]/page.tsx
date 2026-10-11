import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';

type ServiceItem = { name: string; detail: string; intent: 'sales' | 'repair' };

const categories: Record<string, { title: string; intro: string; items: ServiceItem[]; deepLink?: { label: string; href: string } }> = {
  'computers-mobiles': {
    title: 'Computers & Mobiles',
    intro: 'Get the right device, accessories, repair or upgrade without the guesswork. Serving homes and businesses across Goa.',
    items: [
      { name: 'Laptop & desktop sales', detail: 'New systems with GST billing. We help you pick the right spec for your budget and transfer your data.', intent: 'sales' },
      { name: 'Computer accessories', detail: 'Keyboards, mice, storage, monitors and more, from our store in Parcem, Pernem.', intent: 'sales' },
      { name: 'Mobile phones & accessories', detail: 'Phones and accessories with GST invoices and warranty support.', intent: 'sales' },
      { name: 'Computer & laptop repair', detail: 'Screen, battery, storage and software issues. We diagnose first, then give you a fixed quote before work begins.', intent: 'repair' },
      { name: 'Mobile repair', detail: 'Screen, battery and charging repairs, with a quote before any work starts.', intent: 'repair' },
      { name: 'Parts & upgrades', detail: 'RAM, SSD and other upgrades supplied and installed, including data migration.', intent: 'sales' },
    ],
  },
  'networking-internet': {
    title: 'Networking & Internet',
    intro: 'Reliable internet and Wi-Fi for homes, shops and businesses across Goa.',
    items: [
      { name: 'Wi-Fi setup & repair', detail: 'Fix dead zones, drops and slow speeds. We check your space, then set up or repair the network.', intent: 'repair' },
      { name: 'Router, repeater & range extender', detail: 'Supplied and configured to match your space and ISP plan.', intent: 'sales' },
      { name: 'Network configuration', detail: 'Secure setup: strong passwords, guest networks and parental controls.', intent: 'sales' },
      { name: 'Networking installation', detail: 'Cabling, switches and access points for homes, shops and offices, with a labelled handover.', intent: 'sales' },
      { name: 'Jio AirFiber new connection', detail: 'We help you book, place and configure a new Jio AirFiber connection.', intent: 'sales' },
      { name: 'Jio AirFiber repair', detail: 'Diagnosis and repair of AirFiber setups, including relocation and re-cabling.', intent: 'repair' },
    ],
  },
  'cctv-security': {
    title: 'CCTV & Security',
    intro: 'Protect your home, shop or workplace with a setup that fits your space. We supply, install and repair CCTV across Goa.',
    items: [
      { name: 'CCTV cameras', detail: 'Dome, bullet and PTZ cameras supplied with GST billing.', intent: 'sales' },
      { name: 'IP & Wi-Fi cameras', detail: 'App-view cameras for homes and shops, configured on your network and phone.', intent: 'sales' },
      { name: 'DVR & NVR systems', detail: 'Recorders sized for your camera count and how many days of footage you want to keep.', intent: 'sales' },
      { name: 'CCTV installation', detail: 'Full installation with cabling, configuration and handover. Standard home setups of up to 8 cameras are typically completed within 24 to 48 hours after confirmation.', intent: 'sales' },
      { name: 'CCTV repair', detail: 'Camera, cable, recorder and power repairs. We diagnose first and quote before work begins.', intent: 'repair' },
      { name: 'Security solutions', detail: 'Access control, video door phones and alarm integration for homes and small businesses.', intent: 'sales' },
    ],
    deepLink: { label: 'Planning a larger commercial or multi-site project? See our physical security capabilities', href: '/services/physical-security' },
  },
};

export function generateStaticParams() { return Object.keys(categories).map((category) => ({ category })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const data = categories[category];
  if (!data) return {};
  return createPageMetadata({
    title: `${data.title} in Goa | TecBunny`,
    description: `${data.intro} ${data.items.slice(0, 4).map((i) => i.name).join(', ')} and more from TecBunny in Goa.`,
    path: `/services/${category}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params; const data = categories[category]; if (!data) notFound();
  const contactHref = (item?: ServiceItem) =>
    `/contact?subject=${item?.intent === 'repair' ? 'repair' : 'sales'}&service=${category}&intent=service_request&source=service_category${item ? `&message=${encodeURIComponent(`I need help with ${item.name}.`)}` : ''}`;
  return <div className="bg-zinc-950 text-white"><section className="border-b border-zinc-800 bg-[radial-gradient(circle_at_80%_0%,rgba(37,99,235,.22),transparent_36%)]"><div className="tb-container py-14 sm:py-20"><Link href="/services" className="text-sm font-semibold text-blue-300 hover:text-white">← All services</Link><h1 className="mt-5 text-4xl font-bold sm:text-5xl">{data.title}</h1><p className="mt-5 max-w-2xl text-lg text-zinc-300">{data.intro}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={contactHref()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-bold hover:bg-blue-500">Request service <ArrowRight size={17}/></Link><a href="tel:+919604136010" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 font-bold hover:border-blue-400"><Phone size={17}/> Call TecBunny</a></div></div></section><section className="tb-container py-12 sm:py-16"><h2 className="text-2xl font-bold">What we can help with</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((item) => <div key={item.name} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><CheckCircle2 className="mb-4 text-blue-400" size={22}/><h3 className="text-lg font-bold">{item.name}</h3><p className="mt-2 text-sm text-zinc-400">{item.detail}</p><Link href={contactHref(item)} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-blue-300">{item.intent === 'repair' ? 'Book a repair' : 'Get a quote'} <ArrowRight size={15}/></Link></div>)}</div>{data.deepLink && <p className="mt-8 text-sm text-zinc-400"><Link href={data.deepLink.href} className="font-semibold text-blue-300 hover:text-white">{data.deepLink.label} →</Link></p>}</section><section className="border-t border-zinc-800 bg-zinc-900/40"><div className="tb-container py-12"><h2 className="text-2xl font-bold">How it works</h2><ol className="mt-6 grid gap-4 sm:grid-cols-3">{['Tell us what you need', 'We confirm the right service and give you a clear quote', 'We do the work and hand over with documentation'].map((step,index) => <li key={step} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"><span className="text-sm font-bold text-blue-400">0{index + 1}</span><p className="mt-2 font-semibold">{step}</p></li>)}</ol><p className="mt-6 text-sm text-zinc-400">Serving Pernem, Mapusa, Panaji and the rest of Goa. Quotes are free and there is no obligation to proceed.</p></div></section></div>;
}