import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { getLocationsForService } from '@/lib/locations';

interface ServiceLocationsProps {
  serviceUrl: string;
}

/**
 * "Service locations" internal-link block for parent service pages.
 * Renders nothing when the service has no location pages.
 */
export function ServiceLocations({ serviceUrl }: ServiceLocationsProps) {
  const locations = getLocationsForService(serviceUrl);
  if (locations.length === 0) return null;

  return (
    <section aria-label="Service locations" className="mx-auto max-w-6xl px-6 pb-16">
      <h2 className="mb-6 text-2xl font-bold text-zinc-100">Service Locations</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {locations.map((location) => (
          <Link
            key={location.url}
            href={location.url}
            className="group rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-blue-500/40 hover:bg-white/10"
          >
            <div className="flex items-center gap-2 text-lg font-semibold text-zinc-100 group-hover:text-blue-400">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {location.name}
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Serving {location.areas.join(', ')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
