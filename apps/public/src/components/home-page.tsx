'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera, Code, Key, Monitor, Network, Star } from 'lucide-react';

import { CUSTOMER_REVIEWS, FALLBACK_BRANDS, GOOGLE_REVIEWS_URL, PROJECT_PHOTOS } from '@/content/homepage-proof';
import { STARTING_PRICES, formatInr, type StartingPrice } from '@/content/pricing';

const services = [
  { title: 'CCTV', detail: 'Plan cameras around gates, entries, parking and the recordings you need to review.', href: '/services/cctv-security', icon: Camera },
  { title: 'IT Support', detail: 'Practical help with computer setup, repair, upgrades, backups and small-office support.', href: '/services/it-support', icon: Monitor },
  { title: 'RFID Locks', detail: 'Manage access with cards or credentials while keeping emergency exit arrangements in view.', href: '/services/rfid-locks', icon: Key },
  { title: 'Networking', detail: 'Find the cause of weak Wi-Fi before planning access points, cabling or router changes.', href: '/services/networking', icon: Network },
  { title: 'Website Development', detail: 'Mobile-first websites with source-code handover, free hosting and clear domain costs.', href: '/webdev', icon: Code },
] as const;

export default function HomePage({ initialPartnerBrands = [], startingPrices = STARTING_PRICES }: { initialPartnerBrands?: Array<{ name: string; logoUrl: string }>; initialHeroCarousel?: unknown; startingPrices?: readonly StartingPrice[] }) {
  const brandLogos = initialPartnerBrands.filter((brand) => brand.logoUrl);
  return (
    <div className="bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="tb-container py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">TecBunny Solutions, Goa</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">CCTV, IT, RFID locks, networking and websites for Goa</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300">One local team for the technology your home or small business runs on. We listen to the problem, review the practical options and confirm the work in writing before it starts.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="https://wa.me/919604136010?text=Hello%20TecBunny%2C%20I%20would%20like%20to%20discuss%20a%20technology%20requirement." target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-5 font-bold hover:bg-emerald-500">WhatsApp us</a>
              <Link href="/contact?intent=quote_request&source=homepage_hero" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-600 px-5 font-bold hover:border-blue-400">Request a quote</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="tb-container py-14 sm:py-20">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">Our services</p>
          <h2 className="mt-2 text-3xl font-bold">Choose the help you need</h2>
          <p className="mt-3 max-w-3xl leading-7 text-zinc-400">Each service starts with the site, device or business need in front of you. That means a CCTV view is planned around the area you need to see, a Wi-Fi fix starts with coverage, and a website starts with what visitors need to understand.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map(({ title, detail, href, icon: Icon }) => (
            <article key={title} className="flex min-h-72 flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <Icon className="text-blue-400" size={30} />
              <h3 className="mt-8 text-xl font-bold">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{detail}</p>
              <Link href={href} className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-blue-300 hover:text-blue-200">Learn more <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="tb-container py-14 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">Starting prices</p>
          <h2 className="mt-2 text-3xl font-bold">Know the starting point before you ask</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPrices.map((price) => (
              <article key={price.id} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{price.service}</p>
                <h3 className="mt-2 font-bold">{price.label}</h3>
                <p className="mt-3 text-3xl font-bold text-blue-300"><span className="mr-1 text-sm font-medium text-zinc-400">from</span>{formatInr(price.amount)}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-zinc-400">{price.summary}</p>
                <Link href={price.href} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-blue-300 hover:text-blue-200">See details <ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
          <p className="mt-5 text-sm text-zinc-500">Final price depends on your requirements and is confirmed in a written quote before work starts.</p>
        </div>
      </section>

      {PROJECT_PHOTOS.length > 0 && (
        <section className="tb-container py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">Recent work</p>
              <h2 className="mt-2 text-3xl font-bold">Projects we have completed</h2>
            </div>
            <Link href="/portfolio" className="inline-flex items-center gap-1 text-sm font-bold text-blue-300 hover:text-blue-200">View case studies <ArrowRight size={15} /></Link>
          </div>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECT_PHOTOS.map((photo) => (
              <li key={photo.src} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} className="h-56 w-full object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                <div className="p-4"><p className="font-semibold">{photo.title}</p><p className="text-sm text-zinc-400">{photo.location}</p></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {CUSTOMER_REVIEWS.length > 0 && (
        <section className="border-y border-zinc-800 bg-zinc-900/40">
          <div className="tb-container py-14 sm:py-16">
            <h2 className="text-3xl font-bold">What customers say</h2>
            <ul className="mt-7 grid gap-4 md:grid-cols-3">
              {CUSTOMER_REVIEWS.map((review) => (
                <li key={`${review.name}-${review.service}`} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                  {review.rating && (
                    <div className="flex gap-0.5 text-amber-400" role="img" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: review.rating }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                  )}
                  <blockquote className="mt-3 leading-7 text-zinc-300">&ldquo;{review.quote}&rdquo;</blockquote>
                  <p className="mt-4 text-sm font-semibold">{review.name}{review.location ? `, ${review.location}` : ''}</p>
                  <p className="text-xs text-zinc-500">{review.service}</p>
                </li>
              ))}
            </ul>
            {GOOGLE_REVIEWS_URL && (
              <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-blue-300 hover:text-blue-200">Read our Google reviews <ArrowRight size={15} /></a>
            )}
          </div>
        </section>
      )}

      <section className="tb-container py-12 sm:py-14">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Brands we work with</h2>
        {brandLogos.length > 0 ? (
          <ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-6">
            {brandLogos.map((brand) => (
              <li key={brand.name}>
                <Image src={brand.logoUrl} alt={brand.name} width={120} height={40} unoptimized className="h-10 w-auto object-contain opacity-80" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-6 flex flex-wrap gap-3">
            {FALLBACK_BRANDS.map((name) => (
              <li key={name} className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">{name}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="tb-container py-14 sm:py-16">
          <h2 className="text-3xl font-bold">Why TecBunny</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"><h3 className="font-bold text-blue-300">Registered company</h3><p className="mt-2 text-zinc-400">TecBunny Solutions Pvt. Ltd. is incorporated in 2025. Our <Link href="/about/business-info" className="text-blue-300 hover:text-white">business information</Link> shows the CIN and GSTIN.</p></article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"><h3 className="font-bold text-blue-300">Local team</h3><p className="mt-2 text-zinc-400">We are based in Pernem and serve North Goa plus the Sawantwadi area near the Goa border, Monday to Saturday, 9:30 AM to 7:30 PM.</p></article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"><h3 className="font-bold text-blue-300">Clear paperwork</h3><p className="mt-2 text-zinc-400">You receive a written quote before work starts, a GST invoice and the relevant warranty details for the agreed work.</p></article>
          </div>
        </div>
      </section>

      <section className="tb-container py-14 sm:py-20">
        <h2 className="text-3xl font-bold">How it works</h2>
        <ol className="mt-7 grid gap-4 sm:grid-cols-5">
          {[
            ['Tell us what you need', 'Share the site, device or business problem and the outcome you want.'],
            ['We review the practical details', 'We confirm the visit time when you book and assess the relevant conditions.'],
            ['You receive a written quote', 'The scope and final price are confirmed before work starts.'],
            ['We complete the agreed work', 'We install, configure, repair or build the work you have approved.'],
            ['We hand over clearly', 'You receive practical guidance, the GST invoice and applicable warranty details.'],
          ].map(([step, detail], index) => (
            <li key={step} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"><span className="text-sm font-bold text-blue-400">0{index + 1}</span><p className="mt-3 font-semibold">{step}</p><p className="mt-2 text-sm leading-6 text-zinc-400">{detail}</p></li>
          ))}
        </ol>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="tb-container grid gap-6 py-14 sm:grid-cols-2">
          <div><h2 className="text-3xl font-bold">Built for local conditions</h2><p className="mt-3 leading-7 text-zinc-400">Monsoon humidity, salt air, laterite walls, power cuts and larger gardens can affect technology choices in Goa. We discuss those conditions when they matter to the work.</p></div>
          <div><h2 className="text-3xl font-bold">No inflated promises</h2><p className="mt-3 leading-7 text-zinc-400">We do not promise zero downtime, guaranteed search rankings or a fixed response time. If something needs a site check or provider confirmation, we say so.</p></div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="tb-container grid gap-6 py-14 sm:grid-cols-[1fr_auto] sm:items-center">
          <div><h2 className="text-3xl font-bold">Tell us what you need</h2><p className="mt-3 text-zinc-400">We can help you choose the practical next step for your home or business.</p></div>
          <Link href="/contact?intent=service_request&source=homepage_final" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 font-bold hover:bg-blue-500">Request a quote</Link>
        </div>
      </section>
    </div>
  );
}
