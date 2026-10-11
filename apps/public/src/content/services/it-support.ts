import type { ServiceContent } from './types';

export const itSupportService: ServiceContent = {
  slug: 'it-support',
  path: '/services/it-support',
  name: 'IT Support',
  title: 'IT Support in Goa | TecBunny',
  metaDescription:
    'Computer setup, repair, upgrades and practical IT support for homes and small businesses in North Goa and the Sawantwadi area.',
  promise:
    'We help you decide whether to repair, upgrade or replace a device, then explain the work clearly before it starts.',
  audience: [
    'Homes that need help setting up, repairing or improving a laptop or desktop computer.',
    'Small offices, shops and guesthouses that need working devices, printers, email and safer day-to-day IT habits.',
    'People who need a practical second opinion before spending on a repair, replacement or upgrade.',
  ],
  problems: [
    'A computer takes a long time to start, freezes during ordinary work or runs out of usable storage.',
    'A new laptop, desktop or accessory needs setup, data transfer or connection to existing equipment.',
    'Important files exist in only one place and there is no simple recovery plan after a loss, theft or failure.',
    'Updates, malware warnings, email or printer problems interrupt work and no one knows the safe next step.',
    'A small office needs regular preventive checks but does not need or want a large-company support contract.',
    'You are unsure whether a slow computer needs repair, an SSD or RAM upgrade, or replacement.',
  ],
  whatWeDo: [
    {
      title: 'Diagnose the problem before recommending a fix',
      paragraphs: [
        'We check the symptom, device condition and likely cause before recommending work. We explain whether repair, upgrade or replacement appears more practical for your situation.',
      ],
    },
    {
      title: 'Set up computers and everyday equipment',
      paragraphs: [
        'We help set up desktop and laptop computers, basic accessories, printers, email and the connections needed for ordinary work. We supply HP, Dell, Lenovo, ASUS, Gigabyte, Zebronics, EVM, SanDisk, Coconut Life and Enter products.',
      ],
    },
    {
      title: 'Improve a slow computer where it makes sense',
      paragraphs: [
        'A slow computer can be affected by storage, memory, startup software, updates, malware or an ageing operating system. An SSD can improve responsiveness on a compatible device, while RAM can help when too many tasks compete for memory.',
      ],
    },
    {
      title: 'Set up backups you can understand',
      paragraphs: [
        'We can help you set up a simple 3-2-1 backup approach: keep three copies of important data, on two different storage types, with one copy kept elsewhere. The right method depends on the data, connection and how often it changes.',
      ],
    },
    {
      title: 'Handle updates and security carefully',
      paragraphs: [
        'We can review operating-system updates, supported security software and basic account hygiene. We do not recommend pirated software; properly licensed software protects you from avoidable security and update problems.',
      ],
    },
    {
      title: 'Plan ongoing help for small businesses',
      paragraphs: [
        'A preventive visit can review device health, updates, backup status, storage capacity and common connection issues. Any recurring support scope is set out in writing; we confirm the visit time when you book rather than promise a response time.',
      ],
    },
  ],
  buyersGuide: [
    {
      title: 'Repair, upgrade or replace?',
      paragraphs: [
        'Ask what is causing the problem and whether the fix is likely to extend useful life. A hardware repair can make sense, but an older device may not support current software or may cost more to repair than it is worth.',
      ],
    },
    {
      title: 'Ask what happens to your data',
      paragraphs: [
        'Before work starts, identify files that matter and where they are stored. We discuss data risk and back up data where possible, but no repair can guarantee recovery from a failed storage device.',
      ],
    },
    {
      title: 'Choose support that you can maintain',
      paragraphs: [
        'For a small business, a useful support plan covers the devices and checks you actually need, not a long list of unclear promises. Ask what is included, what is excluded, how visits are booked and how replacement parts are handled.',
      ],
    },
    {
      title: 'Avoid the common shortcuts',
      paragraphs: [
        'Do not ignore low-storage warnings, use unlicensed software or rely on one copy of important files. Keep your device passwords private, install updates carefully and test that backups can actually be opened.',
      ],
    },
  ],
  pricing: {
    title: 'IT Support pricing',
    paragraphs: [
      'From Rs 14,999 for computer setup.',
      'Final price depends on your requirements and is confirmed in a written quote before work starts.',
      'First visit Rs 599 to assess the device and explain the problem. The solution is charged separately based on the work required.',
      'The Rs 599 visit charge is waived when you go ahead and the total hardware and service charge is more than Rs 1,499. Final price in a written quote.',
    ],
  },
  process: [
    {
      title: '1. Tell us the issue',
      paragraphs: ['You describe the device, the problem and any deadline. We confirm the visit time when you book.'],
    },
    {
      title: '2. We review the device or site',
      paragraphs: ['We check the practical cause, condition and data risk. You receive a clear explanation of the available next steps.'],
    },
    {
      title: '3. You receive a written quote',
      paragraphs: ['The quote confirms the proposed work and final price before work starts. You can decide whether to proceed.'],
    },
    {
      title: '4. We complete the agreed work',
      paragraphs: ['We carry out the agreed setup, repair or upgrade and keep you informed if the diagnosis changes the scope.'],
    },
    {
      title: '5. We hand over and explain',
      paragraphs: ['You receive practical handover information, including the work completed and relevant warranty details.'],
    },
  ],
  included: [
    'A practical review of the reported issue or requested setup.',
    'A written quote before chargeable work starts.',
    'An explanation of the agreed work and basic handover guidance.',
    'GST invoice and relevant equipment warranty information.',
  ],
  notIncluded: [
    'A guarantee that data can be recovered from a physically failed drive.',
    'Pirated software, licence circumvention or unsupported operating systems.',
    'Replacement parts, software licences or specialist recovery work unless stated in your written quote.',
    'A fixed response time or an unlimited support promise.',
  ],
  warranty: [
    'Equipment has the manufacturer warranty that applies to its brand and product. We handle brand warranty claims for equipment we supply.',
    'TecBunny workmanship warranty is 6 months.',
    'Torn or cut cables and physical damage are not covered by our workmanship warranty.',
    'We confirm the visit time when you book. We do not promise a fixed response time.',
  ],
  notRightFor: [
    'You need guaranteed data recovery from a physically failed or damaged storage device.',
    'You want unlicensed software or a shortcut around a software licence.',
    'You need a fixed response-time commitment that has not been agreed in writing.',
    'You expect a repair to make an unsupported or failing device new again.',
  ],
  faqs: [
    {
      question: 'Should I repair or replace my computer?',
      answer:
        'It depends on the fault, age, parts cost and whether the device still supports the software you need. We explain the practical options before you decide.',
    },
    {
      question: 'Can an SSD make my computer faster?',
      answer:
        'On a compatible device, an SSD can improve startup and everyday responsiveness. We check compatibility and the wider condition of the device before recommending it.',
    },
    {
      question: 'Will adding RAM help?',
      answer:
        'It can help when the device runs out of memory during normal use. We check the device’s supported memory and the actual cause of the slowdown first.',
    },
    {
      question: 'Can you back up my files?',
      answer:
        'We can help set up and test a backup approach. Keep more than one copy of important files, because a single drive or account is not a complete backup plan.',
    },
    {
      question: 'Do you use genuine software licences?',
      answer:
        'We recommend properly licensed software and do not suggest pirated copies. Licensing and any software cost are confirmed in the written quote where applicable.',
    },
    {
      question: 'Can you recover files from a failed hard drive?',
      answer:
        'We can assess the situation, but we do not promise recovery from a physically failed drive. Specialist recovery work, if needed, is separate from ordinary support.',
    },
    {
      question: 'What happens to my personal or business data during service?',
      answer:
        'We access only what is needed to diagnose or complete the agreed work. Tell us about sensitive data before work begins so we can discuss the safest practical approach.',
    },
    {
      question: 'Do you offer yearly IT support?',
      answer:
        'We can discuss a preventive support plan for a small business. The written plan defines the devices, checks, exclusions and how visits are arranged.',
    },
  ],
  areas:
    'We serve all of North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra, near the Goa border.',
  serviceDescription:
    'Computer setup, repair, upgrades, backup planning and practical IT support for homes and small businesses.',
};
