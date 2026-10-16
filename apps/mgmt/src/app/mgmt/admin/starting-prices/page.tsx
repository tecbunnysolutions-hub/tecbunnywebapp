import type { Metadata } from 'next';

import StartingPricesEditor from './StartingPricesEditor';

export const metadata: Metadata = {
  title: 'Starting Prices | Admin Management',
  description: 'Edit the starting prices shown on the public website.',
};

export default function Page() {
  return <StartingPricesEditor />;
}
