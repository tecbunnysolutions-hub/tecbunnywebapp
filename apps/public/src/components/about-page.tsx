import Link from 'next/link';
import { Camera, Network, Monitor, Key, Code, ArrowRight, MapPin, FileText, MessageSquare } from 'lucide-react';

const services = [
  { name: 'CCTV that covers what matters', detail: 'Plan camera positions, recording and viewing around your entrances, property and daily routine.', href: '/services/cctv-security', icon: Camera },
  { name: 'Practical computer and IT support', detail: 'Work through repairs, upgrades, backups and the devices your home or business relies on.', href: '/services/it-support', icon: Monitor },
  { name: 'Networking built for your space', detail: 'Understand weak Wi-Fi, plan cabling and choose access points around the rooms you use.', href: '/services/networking', icon: Network },
  { name: 'Access that is easier to manage', detail: 'Explore RFID locks and credentials with your users, doors and exit arrangements in mind.', href: '/services/rfid-locks', icon: Key },
  { name: 'Websites with a clear next step', detail: 'Help visitors understand your business, explore your offering and get in touch on any screen.', href: '/webdev', icon: Code },
];

export default function AboutPage() {
  return (
    <div className="tb-page">
      <section className="tb-hero border-b border-border">
        <div className="tb-container grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div><p className="tb-kicker">About TecBunny</p><h1 className="mt-5 text-4xl font-bold sm:text-5xl">Local people.<br /><span className="text-primary">Practical technology.</span></h1><p className="tb-lede mt-6 max-w-2xl">Technology should make your day easier. We help homes and small businesses plan, choose and look after the systems they use — from a camera at the gate to the network behind the office.</p><Link href="/contact?intent=help_me_choose&source=about" className="tb-button mt-8">Talk through your requirements <ArrowRight size={18} aria-hidden="true" /></Link></div>
          <aside className="tb-card p-7 sm:p-9"><MapPin className="text-primary" size={32} aria-hidden="true" /><h2 className="mt-5 text-2xl">Based in Pernem. Focused on your space.</h2><p className="mt-4 text-muted-foreground">We serve North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra. Share your location and the work you have in mind so we can discuss the practical next step.</p><Link href="/about/business-info" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">View our business information <ArrowRight size={16} aria-hidden="true" /></Link></aside>
        </div>
      </section>
      <section className="tb-container tb-section-space" aria-labelledby="about-approach">
        <p className="tb-kicker">Our approach</p><h2 id="about-approach" className="mt-3 text-3xl">Start with the problem. Make the options clear.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { icon: MessageSquare, title: 'Listen before recommending', description: 'Tell us what is happening, who uses the system and what you want to improve. Those details shape the recommendation.' },
            { icon: FileText, title: 'Put the scope in writing', description: 'Review the proposed equipment and work in a written quote. Ask questions before deciding what to go ahead with.' },
            { icon: MapPin, title: 'Work with local conditions', description: 'Walls, weather, power and the way you use a property can all affect the setup. We discuss those conditions when they matter.' },
          ].map(({ icon: Icon, title, description }) => <article key={title} className="tb-card p-6"><Icon className="text-primary" size={24} aria-hidden="true" /><h3 className="mt-5 text-xl">{title}</h3><p className="mt-3 text-muted-foreground">{description}</p></article>)}
        </div>
      </section>
      <section className="border-y border-border bg-card">
        <div className="tb-container tb-section-space"><p className="tb-kicker">What we help with</p><h2 className="mt-3 text-3xl">One team for connected requirements.</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(({ name, detail, href, icon: Icon }) => <article key={href} className="rounded-xl border border-border bg-background p-6"><Icon className="text-primary" size={24} aria-hidden="true" /><h3 className="mt-5 text-xl">{name}</h3><p className="mt-3 text-muted-foreground">{detail}</p><Link href={href} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">Explore this service <ArrowRight size={16} aria-hidden="true" /></Link></article>)}</div></div>
      </section>
      <section className="tb-container grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center tb-section-space"><div><h2 className="text-3xl">What would you like to improve?</h2><p className="mt-3 text-muted-foreground">A short description of the problem is enough to start a conversation.</p></div><Link href="/contact?intent=quote_request&source=about_final" className="tb-button">Discuss your project <ArrowRight size={18} aria-hidden="true" /></Link></section>
    </div>
  );
}
