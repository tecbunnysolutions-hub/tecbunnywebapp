import type { Metadata } from 'next';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Get Your Free Infrastructure Guide | TecBunny',
  description:
    'Tell us about your CCTV, Networking, or Smart Automation needs and get an instant technical guide plus a callback from our team.',
};

export default function LeadCapturePage() {
  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pt-0 pb-16 sm:pt-0 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-sm font-semibold text-blue-400">
              <span>Free Technical Guide</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-tech leading-tight">
              Get Your Property&apos;s <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Infrastructure Guide
              </span>
            </h1>

            <p className="text-zinc-400 text-lg font-light leading-relaxed max-w-2xl">
              Share your details and we&apos;ll instantly email you a technical guide for CCTV, Networking, or Smart
              Automation, plus a callback from our engineering team within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <LeadCaptureForm />
        </div>
      </section>
    </div>
  );
}
