import Link from 'next/link';

import { ENTITY } from '@/lib/entity';

/**
 * Server-rendered buying guide + FAQ for /products.
 *
 * Purpose (SEO/AEO/GEO): the catalogue grid above is interactive and thin on
 * extractable answers, so this section provides question-style headings with
 * concise direct answers, decision support (comparison table, best-for lists),
 * credible external citations, and FAQPage JSON-LD that mirrors the visible FAQs.
 *
 * Claim governance: no unverified partnership, certification, or compliance
 * claims, ratings, or reviews — scripts/validate-seo-contract.mjs greps for
 * them. Keep statements aligned with src/lib/entity.ts and use the generic
 * wording from @tecbunny/core/verified-credentials.
 */

const PRODUCT_FAQS = [
  {
    question: 'Does TecBunny install the CCTV systems it sells?',
    answer:
      'Yes. Every camera, recorder, and accessory in this catalogue can be installed and configured by TecBunny\u2019s physical security team across Goa and Maharashtra, including cabling, remote-viewing setup, and handover training.',
  },
  {
    question: 'Are the products in this catalogue genuine?',
    answer:
      'Yes. Equipment is sourced through genuine enterprise channels, and applicable manufacturer warranty terms are listed on each product page. You can register your purchase on our warranty activation page after delivery.',
  },
  {
    question: 'Do you deliver and install outside Goa?',
    answer:
      'Installation and AMC support cover Goa and Maharashtra. Equipment-only orders to other states can be arranged on request \u2014 contact our team with your location and order list for a delivery quote.',
  },
  {
    question: 'How do I get a quote for a bulk or office order?',
    answer:
      'Share your requirement through the contact page or book a free site assessment. We return an itemised quote covering hardware, cabling, installation, and optional AMC support, usually within one working day.',
  },
  {
    question: 'What are the payment, shipping, and return options?',
    answer:
      'We accept standard online and bank-transfer payments. Shipping timelines and return windows are published in our shipping and return policy pages, and order-specific terms are confirmed on your invoice.',
  },
] as const;

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://www.tecbunny.com/products#faq',
  mainEntity: PRODUCT_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export function ProductsSeoContent() {
  return (
    <section
      aria-labelledby="products-buying-guide"
      className="relative mx-auto max-w-7xl px-6 pb-24 sm:px-8 text-zinc-300"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 sm:p-10 space-y-12">
        {/* Key takeaway — direct answer block for AI extraction */}
        <div className="space-y-4">
          <h2 id="products-buying-guide" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            What should you know before buying CCTV and IT hardware from TecBunny?
          </h2>
          <p className="text-base leading-relaxed max-w-3xl">
            <strong className="text-white">Key takeaway:</strong> {ENTITY.name} sells genuine CCTV cameras,
            recorders, computers, networking gear, and IT accessories at the live prices shown above, and
            installs and supports everything it sells across {ENTITY.serviceAreas.join(' and ')} from its
            headquarters in {ENTITY.headquarters}. If you know what you need, order directly from the
            catalogue; if you are unsure, use the guide below or{' '}
            <Link href="/assessment" className="text-primary hover:underline">
              book a free site assessment
            </Link>
            .
          </p>
        </div>

        {/* Q1: what is sold */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            What CCTV and IT hardware does TecBunny sell?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-3xl">
            The catalogue covers the core equipment needed to secure and run a home, office, or commercial
            site. Current stock and pricing always reflect the live list above.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 max-w-3xl text-sm leading-relaxed list-disc pl-5">
            <li>CCTV cameras — dome, bullet, PTZ, and outdoor weather-rated models</li>
            <li>Recorders and storage — NVR/DVR units, surveillance hard drives, PoE switches</li>
            <li>Computers and laptops — desktops, workstations, and upgrades for offices</li>
            <li>IT accessories — monitors, keyboards, cables, UPS units, and networking accessories</li>
          </ul>
        </div>

        {/* Q2: how to choose */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            How do you choose the right CCTV system for your property?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-3xl">
            Work through these five steps in order — they match how our installation team scopes a site:
          </p>
          <ol className="list-decimal pl-5 space-y-2 max-w-3xl text-sm leading-relaxed">
            <li>
              <strong className="text-white">Count coverage points.</strong> Walk the property and note every
              entrance, corridor, cash counter, and blind spot that needs a camera.
            </li>
            <li>
              <strong className="text-white">Pick resolution per zone.</strong> 2 MP is enough for corridors;
              use 4 MP or higher where faces or number plates must be identifiable.
            </li>
            <li>
              <strong className="text-white">Decide storage days.</strong> Multiply camera count by days of
              retention you need; 15–30 days is typical for homes and small businesses.
            </li>
            <li>
              <strong className="text-white">Choose wired or wireless</strong> using the comparison table below.
            </li>
            <li>
              <strong className="text-white">Plan remote viewing.</strong> Confirm the recorder supports a
              mobile app and that your internet upload speed can handle the streams.
            </li>
          </ol>
          <p className="text-sm leading-relaxed max-w-3xl text-zinc-400">
            For multi-brand systems, prefer cameras and recorders that follow{' '}
            <a
              href="https://www.onvif.org/profiles/"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline"
            >
              ONVIF interoperability profiles
            </a>
            , so equipment from different manufacturers works on one recorder.
          </p>
        </div>

        {/* Q3: comparison table */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            Wired vs wireless CCTV: which should you buy?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-3xl">
            <strong className="text-white">Short answer:</strong> choose wired (PoE) for permanent
            installations and businesses; choose wireless only for rented spaces or single-camera setups where
            cabling is impractical.
          </p>
          <div className="overflow-x-auto max-w-3xl">
            <table className="w-full text-sm border border-zinc-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-zinc-900/60 text-left text-white">
                  <th className="px-4 py-3 font-semibold">Factor</th>
                  <th className="px-4 py-3 font-semibold">Wired (PoE)</th>
                  <th className="px-4 py-3 font-semibold">Wireless (Wi-Fi)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-4 py-3 text-zinc-400">Reliability</td>
                  <td className="px-4 py-3">Stable, immune to Wi-Fi congestion</td>
                  <td className="px-4 py-3">Drops when signal or bandwidth is weak</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-zinc-400">Power</td>
                  <td className="px-4 py-3">Single cable carries power and data</td>
                  <td className="px-4 py-3">Needs a power point or battery per camera</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-zinc-400">Best for</td>
                  <td className="px-4 py-3">Offices, shops, warehouses, new construction</td>
                  <td className="px-4 py-3">Rented homes, temporary sites, 1–2 cameras</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-zinc-400">Long-term cost</td>
                  <td className="px-4 py-3">Higher install effort, near-zero upkeep</td>
                  <td className="px-4 py-3">Cheap to start, battery and signal upkeep</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Q4: cost */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            How much does a CCTV or IT setup cost in Goa?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-3xl">
            Total cost depends on three variables: the number of cameras or devices, the storage retention
            you need, and cabling distance. Equipment prices are listed live on each product above;
            installation is quoted per site after a short assessment. For safety-critical or certified
            installations, look for equipment that meets the standards published by the{' '}
            <a
              href="https://www.bis.gov.in/"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline"
            >
              Bureau of Indian Standards
            </a>
            .
          </p>
        </div>

        {/* Q5: buy vs install — decision support */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            Should you buy equipment only or book professional installation?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl text-sm leading-relaxed">
            <div className="rounded-xl border border-zinc-800 p-5 space-y-2">
              <h3 className="font-semibold text-white">Buy equipment only if you&hellip;</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Are replacing a single camera or accessory on an existing system</li>
                <li>Have in-house IT staff comfortable with cabling and recorder setup</li>
                <li>Are a reseller or system integrator sourcing hardware</li>
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-800 p-5 space-y-2">
              <h3 className="font-semibold text-white">Book installation if you&hellip;</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Are securing a site for the first time or adding more than two cameras</li>
                <li>Need concealed cabling, weather sealing, or multi-floor coverage</li>
                <li>Want AMC support and a single point of contact for faults</li>
              </ul>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-3xl text-zinc-400">
            From our field work across Goa: coastal humidity corrodes outdoor connectors quickly, so we fit
            weather-rated housings and surge protection on exposed runs as standard. See{' '}
            <Link href="/services/physical-security" className="text-primary hover:underline">
              our physical security and CCTV service
            </Link>{' '}
            for what an installation includes.
          </p>
        </div>

        {/* FAQ — mirrors PRODUCT_FAQS JSON-LD above */}
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            Frequently asked questions
          </h2>
          <div className="space-y-5 max-w-3xl">
            {PRODUCT_FAQS.map((faq) => (
              <div key={faq.question} className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-semibold text-white">{faq.question}</h3>
                <p className="text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            More detail:{' '}
            <Link href="/info/policies/shipping" className="text-primary hover:underline">shipping policy</Link>
            {', '}
            <Link href="/info/policies/return" className="text-primary hover:underline">return policy</Link>
            {', '}
            <Link href="/activate-warranty" className="text-primary hover:underline">warranty activation</Link>
            {', or '}
            <Link href="/contact" className="text-primary hover:underline">contact our team</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
