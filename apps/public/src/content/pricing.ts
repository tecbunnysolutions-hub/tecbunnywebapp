export type StartingPrice = {
  id: string;
  service: string;
  label: string;
  amount: number;
  summary: string;
  href: string;
};

// Keep in sync with the pricing sections in ./services/*.ts.
export const STARTING_PRICES: readonly StartingPrice[] = [
  {
    id: 'cctv-4-camera',
    service: 'CCTV',
    label: '4-camera CCTV setup',
    amount: 19999,
    summary: '4 cameras, DVR, 500GB HDD, 100m cable, SMPS, connectors, adaptor, PVC boxes, 2U rack, screws and installation.',
    href: '/services/cctv-security',
  },
  {
    id: 'repair-visit',
    service: 'Repairs',
    label: 'Computer repair first visit',
    amount: 599,
    summary: 'We assess the device and explain the problem. The repair is charged separately; the visit charge is waived when the total hardware and service charge is more than Rs 1,499.',
    href: '/services/it-support',
  },
  {
    id: 'custom-computer',
    service: 'Computers',
    label: 'Custom-built computer',
    amount: 14999,
    summary: 'Built around the work you need it for, with the final configuration confirmed in a written quote.',
    href: '/services/it-support',
  },
  {
    id: 'laptop',
    service: 'Laptops',
    label: 'Laptops',
    amount: 24999,
    summary: 'Laptops matched to your budget and use, with setup help available.',
    href: '/services/it-support',
  },
];

export const formatInr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
