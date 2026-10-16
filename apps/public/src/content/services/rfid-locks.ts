import type { ServiceContent } from './types';

export const rfidLocksService: ServiceContent = {
  slug: 'rfid-locks',
  path: '/services/rfid-locks',
  name: 'RFID Locks',
  title: 'RFID Locks in Goa | TecBunny',
  metaDescription:
    'RFID lock planning, installation and access-control setup for homes and small businesses in North Goa and the Sawantwadi area.',
  promise:
    'We help you replace unmanaged keys with practical access control while keeping emergency exit and day-to-day use in view.',
  audience: [
    'Offices and shops that need to add, remove or replace staff access without collecting every key.',
    'Guesthouses, hostels and PGs that need a clear lost-card process and practical access arrangements.',
    'Homes and small properties that want a controlled entrance with suitable power and override planning.',
  ],
  problems: [
    'Keys are shared, copied or not returned when staff, tenants or guests leave.',
    'You need to stop a lost card from working without changing a physical lock.',
    'A door needs controlled entry but must still provide a safe emergency exit.',
    'A power cut could change how the selected lock behaves and nobody has planned an override.',
    'You want entry records but are unsure whether the selected system can store and retrieve them.',
    'The door, frame, latch or wiring is not suitable for the lock type you had in mind.',
  ],
  whatWeDo: [
    {
      title: 'Review the door and its safe use',
      paragraphs: [
        'We check the door material, frame, locking point, power path and how people use the entrance. The chosen lock must suit the physical door as well as the access method.',
      ],
    },
    {
      title: 'Explain card and credential choices',
      paragraphs: [
        '125 kHz proximity cards are common and can suit simple access needs. 13.56 MHz cards can be harder to clone, but no card system is unhackable and safe use still depends on how cards and administrator access are managed.',
      ],
    },
    {
      title: 'Choose the lock behaviour carefully',
      paragraphs: [
        'An electromagnetic lock generally releases when power is lost, often called fail-open. An electric strike is usually fail-secure, meaning it stays locked on power loss; the right choice depends on the door and emergency requirements.',
      ],
    },
    {
      title: 'Set up users and a lost-card process',
      paragraphs: [
        'For a compatible system, we add the agreed cards or credentials and explain who can manage them. A lost card should be deactivated and a replacement issued, rather than relying on everyone to remember who has it.',
      ],
    },
    {
      title: 'Plan backup power and mechanical override',
      paragraphs: [
        'Power backup and a mechanical override can be options where they suit the door and selected hardware. We document the expected behaviour in the written quote so you know what happens during a power cut.',
      ],
    },
    {
      title: 'Configure logs where the system supports them',
      paragraphs: [
        'Some access-control systems can record entry events, while simpler standalone locks may not. We confirm whether the proposed system supports logs and how they can be reviewed before you choose it.',
      ],
    },
  ],
  buyersGuide: [
    {
      title: 'Start with the door, not the reader',
      paragraphs: [
        'A smart-looking reader cannot compensate for an unsuitable door, weak frame or wrong lock arrangement. Ask how the lock will fit, how the door releases and what happens if power is unavailable.',
      ],
    },
    {
      title: 'Plan emergency exit first',
      paragraphs: [
        'RFID locks on exit routes must release in an emergency. We do not provide legal or fire-code advice, so confirm the required arrangement with your building owner or relevant authority before work begins.',
      ],
    },
    {
      title: 'Match the credential to the risk',
      paragraphs: [
        '125 kHz cards are common for ordinary access, while 13.56 MHz cards can be harder to clone. Neither removes the risk of card sharing, tailgating or weak administrator-password practices.',
      ],
    },
    {
      title: 'Ask how access is managed after handover',
      paragraphs: [
        'Decide who can add or remove cards, who holds mechanical override keys and how lost cards are recorded. If you need entry logs, ask to confirm that the selected system supports them and how long records are retained.',
      ],
    },
  ],
  pricing: {
    title: 'RFID lock pricing',
    paragraphs: [
      'Quote after site visit.',
      'Site visit Rs 599. Waived when you go ahead and the total hardware and service charge is more than Rs 1,499. Final price in a written quote.',
      'The final quote depends on the door, lock type, power path, emergency-release arrangement and access needs.',
    ],
  },
  process: [
    {
      title: '1. Tell us about the entrance',
      paragraphs: ['You describe the door, users and access problem. We confirm the visit time when you book.'],
    },
    {
      title: '2. We assess the door and requirements',
      paragraphs: ['We review the fitting, power, override and emergency-release needs. You receive a practical recommendation for that entrance.'],
    },
    {
      title: '3. You receive a written quote',
      paragraphs: ['The quote confirms the proposed hardware, work and final price before work starts. You can review the access behaviour before deciding.'],
    },
    {
      title: '4. We install and configure',
      paragraphs: ['We fit the agreed system, configure supported cards or users and test the agreed day-to-day operation.'],
    },
    {
      title: '5. We hand over access',
      paragraphs: ['You receive an explanation of using cards, managing lost credentials and the documented power or override arrangement.'],
    },
  ],
  included: [
    'A site-specific review of the door, frame, access need and practical power path.',
    'Installation and configuration included in your written quote.',
    'Basic card or credential setup for the agreed compatible system.',
    'A handover explanation covering normal entry, lost cards and the agreed override arrangement.',
  ],
  notIncluded: [
    'Legal, fire-code or building-compliance advice.',
    'A claim that the selected system is unhackable or that card sharing cannot happen.',
    'A guarantee that a standalone lock includes entry logs.',
    'Building-owner permissions or changes to the door beyond the written quote.',
  ],
  warranty: [
    'Equipment has the manufacturer warranty that applies to its brand and product. We handle brand warranty claims for equipment we supply.',
    'TecBunny workmanship warranty is 6 months.',
    'Torn or cut cables and physical damage are not covered by our workmanship warranty.',
    'We confirm the visit time when you book. We do not promise a fixed response time.',
  ],
  notRightFor: [
    'You need an exit route to stay locked during an emergency.',
    'You need legal or fire-code advice instead of a technical installation.',
    'You expect a card system to stop sharing, tailgating or every unauthorised entry by itself.',
    'You need entry logs from a system that does not support them.',
  ],
  faqs: [
    {
      question: 'What happens if someone loses an RFID card?',
      answer:
        'For a compatible system, the card can be deactivated and a replacement issued. Decide who has authority to manage cards and keep a simple record of issued credentials.',
    },
    {
      question: 'What happens during a power cut?',
      answer:
        'It depends on the selected lock, backup power and override arrangement. An electromagnetic lock generally releases on power loss, while an electric strike is usually fail-secure; we document the expected behaviour before work starts.',
    },
    {
      question: 'Are 13.56 MHz cards safer than 125 kHz cards?',
      answer:
        '13.56 MHz cards can be harder to clone. No card system is unhackable, and access also depends on managing cards, administrator access and how people enter the door.',
    },
    {
      question: 'Can RFID locks be used on an emergency exit?',
      answer:
        'An RFID lock on an exit route must release in an emergency. Confirm the required arrangement with your building owner or relevant authority; we do not provide legal or fire-code advice.',
    },
    {
      question: 'Can I see who entered the building?',
      answer:
        'Only if the selected access-control system supports entry logs. We confirm that capability and the practical way to review records before you choose the setup.',
    },
    {
      question: 'Do I need a mechanical key as backup?',
      answer:
        'A mechanical override can be useful where it suits the door and selected hardware. We discuss whether it is appropriate and how the keys should be controlled.',
    },
    {
      question: 'Can I use one card for every person?',
      answer:
        'It is better to give each person their own credential where access control matters. Shared cards make it difficult to remove access or understand a record of use.',
    },
    {
      question: 'Will an RFID lock fit any door?',
      answer:
        'No. Door material, frame condition, latch arrangement, power and intended use affect the suitable hardware. We assess these points during the visit.',
    },
  ],
  areas:
    'We serve all of North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra, near the Goa border.',
  serviceDescription:
    'RFID lock and access-control planning, installation, card management and handover for homes and small businesses.',
};
