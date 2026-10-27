import type { Metadata } from 'next';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Get Your Free Infrastructure Guide | TecBunny',
  description:
    'Tell us about your CCTV, Networking, or Smart Automation needs and get an instant technical guide plus a callback from our team.',
  robots: { index: false, follow: false },
};

export default function LeadCapturePage() {
  return (
    <div className="relative min-h-screen bg-card text-muted-foreground selection:bg-primary/20 selection:text-primary overflow-hidden pt-0 sm:pt-0 tb-page-bottom">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--overlay))_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-primary/5 blur-[180px]" />
      </div>

      <section className="relative tb-subpage-hero border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4.5 py-1.5 text-sm font-semibold text-primary">
              <span>Free Technical Guide</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl font-tech leading-tight">
              Get Your Property&apos;s <br />
              <span className=" text-primary">
                Infrastructure Guide
              </span>
            </h1>

            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl">
              Share your details and we&apos;ll instantly email you a technical guide for CCTV, Networking, or Smart
              Automation, plus a callback from our engineering team within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="tb-section-space">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <LeadCaptureForm />
        </div>
      </section>
    </div>
  );
}
