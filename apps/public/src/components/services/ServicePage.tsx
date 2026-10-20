import Link from 'next/link';
import { CheckCircle2, MessageCircle } from 'lucide-react';

import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { SiteVisitButton } from '@/components/services/SiteVisitButton';
import type { ServiceContent } from '@/content/services';
import { formatInr } from '@/content/pricing';
import { getStartingPrices } from '@/lib/starting-prices';

const siteUrl = 'https://www.tecbunny.com';
const whatsappHref = 'https://wa.me/919604136010';

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function RecentWork() {
  return null;
}

export async function ServicePage({ content }: { content: ServiceContent }) {
  const prices = (await getStartingPrices()).filter((price) => content.priceIds?.includes(price.id));
  const pageUrl = `${siteUrl}${content.path}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: `${content.name} services`,
      description: content.serviceDescription,
      url: pageUrl,
      provider: { '@id': `${siteUrl}/#localbusiness` },
      areaServed: ['North Goa', 'Sawantwadi area, Sindhudurg district'],
      ...(prices.length > 0 && {
        offers: prices.map((price) => ({
          '@type': 'Offer',
          name: price.label,
          priceCurrency: 'INR',
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: price.amount,
            priceCurrency: 'INR',
          },
          url: pageUrl,
        })),
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];

  return (
    <main className="bg-zinc-950 text-white">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Services', url: `${siteUrl}/services` },
          { name: content.name, url: pageUrl },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <section className="border-b border-zinc-800 bg-[radial-gradient(circle_at_80%_0%,rgba(37,99,235,.22),transparent_36%)]">
        <div className="tb-container py-14 sm:py-20">
          <Link href="/services" className="text-sm font-semibold text-blue-300 hover:text-white">
            ← All services
          </Link>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold sm:text-5xl">{content.name} in Goa</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">{content.promise}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400"
            >
              <MessageCircle size={18} /> WhatsApp us
            </a>
            <SiteVisitButton
              service={content.name}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 font-bold hover:border-blue-400"
            />
          </div>
          <p className="mt-4 text-sm text-zinc-400">Message us on WhatsApp or book a site visit. We confirm the visit time when you book.</p>
        </div>
      </section>

      <section className="tb-container py-12 sm:py-16">
        <h2 className="text-3xl font-bold">Who this is for</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {content.audience.map((item) => (
            <li key={item} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="tb-container py-12 sm:py-16">
          <h2 className="text-3xl font-bold">Problems we solve</h2>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {content.problems.map((problem) => (
              <li key={problem} className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-blue-400" size={20} />
                <span>{problem}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DetailSection heading="What we do" details={content.whatWeDo} />
      <DetailSection heading="Buyer’s guide" details={content.buyersGuide} alternate />

      <section className="tb-container py-12 sm:py-16">
        <h2 className="text-3xl font-bold">Packages and pricing</h2>
        <div className="mt-7 max-w-3xl rounded-2xl border border-blue-500/40 bg-blue-950/30 p-6">
          <h3 className="text-xl font-bold">{content.pricing.title}</h3>
          {prices.map((price) => (
            <p key={price.id} className="mt-3 leading-7 text-zinc-300">
              <strong className="text-white">{price.label}: from {formatInr(price.amount)}.</strong> {price.summary}
            </p>
          ))}
          {content.pricing.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-7 text-zinc-300">{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="tb-container py-12 sm:py-16">
          <h2 className="text-3xl font-bold">How it works</h2>
          <ol className="mt-7 grid gap-4 md:grid-cols-5">
            {content.process.map((step) => (
              <li key={step.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-bold text-blue-300">{step.title}</h3>
                {step.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-6 text-zinc-300">{paragraph}</p>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tb-container grid gap-6 py-12 sm:grid-cols-2 sm:py-16">
        <ListSection heading="Included" items={content.included} />
        <ListSection heading="Not included" items={content.notIncluded} />
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="tb-container grid gap-8 py-12 sm:grid-cols-2 sm:py-16">
          <ListSection heading="Warranty and support" items={content.warranty} />
          <ListSection heading="When we’re not the right choice" items={content.notRightFor} />
        </div>
      </section>

      <section className="tb-container py-12 sm:py-16">
        <h2 className="text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-7 grid gap-4">
          {content.faqs.map((faq) => (
            <details key={faq.question} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <summary className="cursor-pointer font-bold">{faq.question}</summary>
              <p className="mt-4 max-w-4xl leading-7 text-zinc-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="tb-container py-12 sm:py-16">
          <h2 className="text-3xl font-bold">Areas we serve</h2>
          <p className="mt-5 max-w-3xl leading-7 text-zinc-300">{content.areas}</p>
        </div>
      </section>

      <RecentWork />

      <section className="tb-container py-12 sm:py-16">
        <div className="rounded-2xl border border-blue-500/40 bg-blue-950/30 p-7 sm:p-10">
          <h2 className="text-3xl font-bold">Talk through your site</h2>
          <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
            Tell us what you want to see and where. We will help you choose the practical next step.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400">
              <MessageCircle size={18} /> WhatsApp us
            </a>
            <SiteVisitButton
              service={content.name}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-600 px-5 font-bold hover:border-blue-400"
            />
          </div>
          <p className="mt-4 text-sm text-zinc-400">Message us on WhatsApp or book a site visit. We confirm the visit time when you book.</p>
        </div>
      </section>
    </main>
  );
}

function DetailSection({
  heading,
  details,
  alternate = false,
}: {
  heading: string;
  details: ServiceContent['whatWeDo'];
  alternate?: boolean;
}) {
  return (
    <section className={alternate ? 'border-y border-zinc-800 bg-zinc-900/40' : undefined}>
      <div className="tb-container py-12 sm:py-16">
        <h2 className="text-3xl font-bold">{heading}</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {details.map((detail) => (
            <article key={detail.title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-xl font-bold">{detail.title}</h3>
              {detail.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-7 text-zinc-300">{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ListSection({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold">{heading}</h2>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 leading-7 text-zinc-300">
            <CheckCircle2 className="mt-1 shrink-0 text-blue-400" size={18} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
