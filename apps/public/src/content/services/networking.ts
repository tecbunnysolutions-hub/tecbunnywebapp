import type { ServiceContent } from './types';

export const networkingService: ServiceContent = {
  slug: 'networking',
  path: '/services/networking',
  name: 'Networking',
  title: 'Networking in Goa | TecBunny',
  metaDescription:
    'Wi-Fi, cabling, router and network setup for homes and small businesses in North Goa and the Sawantwadi area.',
  promise:
    'We find out why the connection feels weak before recommending Wi-Fi, cabling or network equipment for your space.',
  audience: [
    'Homes and villas with weak Wi-Fi in bedrooms, gardens, upper floors or thick-walled rooms.',
    'Shops, offices and guesthouses that need a dependable local network for staff, guests and everyday devices.',
    'Small businesses that need clear passwords, separate guest access and an understandable network handover.',
  ],
  problems: [
    'Wi-Fi is strong near the router but weak or unreliable in other rooms.',
    'Laterite walls, distance, furniture, gardens or poor placement block or weaken the signal.',
    'A single router is being asked to cover a large property without a planned cable route or access-point position.',
    'Guest devices share the same network as staff or business equipment.',
    'Passwords, router settings and device connections are undocumented, making simple changes difficult.',
    'The local network is blamed for a slow connection when the internet plan or provider may be the limiting factor.',
  ],
  whatWeDo: [
    {
      title: 'Survey Wi-Fi coverage before choosing equipment',
      paragraphs: [
        'We review the layout, wall materials, device locations and current router position before recommending a fix. A survey helps distinguish a weak Wi-Fi signal from an internet-plan or provider issue.',
      ],
    },
    {
      title: 'Plan access points and cabling',
      paragraphs: [
        'A wired access point uses a network cable back to the main network and can provide more consistent coverage across a larger site. Mesh can be useful in the right setting, but each wireless hop can affect performance.',
      ],
    },
    {
      title: 'Install practical structured cabling',
      paragraphs: [
        'Cat6 cabling is a common choice for modern local networks and can support a wired backhaul for access points. We assess routes, walls, outdoor exposure and equipment locations before confirming the work.',
      ],
    },
    {
      title: 'Set up routers, switches and access controls',
      paragraphs: [
        'We configure the agreed router, switches and Wi-Fi settings, then use stronger passwords and sensible administrator access. We supply D-Link and TP-Link networking equipment and explain which details you should keep after handover.',
      ],
    },
    {
      title: 'Separate guest and staff use',
      paragraphs: [
        'A separate guest network can keep visitor devices away from staff computers and other internal equipment. The exact setup depends on the selected router or access points and what your site needs.',
      ],
    },
    {
      title: 'Review connection resilience honestly',
      paragraphs: [
        'A second internet line can be an option for some sites that need another connection available when the first one is down. It does not make a slow provider plan faster, and internet speed still depends on the plan and provider.',
      ],
    },
  ],
  buyersGuide: [
    {
      title: 'Identify whether the problem is Wi-Fi or internet service',
      paragraphs: [
        'Test near the router and in the problem area before buying a repeater or new router. If speed is slow everywhere, the internet plan or provider may be the constraint rather than the Wi-Fi layout.',
      ],
    },
    {
      title: 'Prefer a planned wired backhaul for larger spaces',
      paragraphs: [
        'For a villa, thick-walled home, shop or office, access points connected by cable are often more predictable than relying on repeated wireless hops. Mesh may still fit some layouts, but it should follow a survey rather than guesswork.',
      ],
    },
    {
      title: 'Ask how guest access is separated',
      paragraphs: [
        'Guest Wi-Fi should be separated from staff devices where the equipment supports it. Ask who will hold administrator access, how the password is changed and how the network is documented at handover.',
      ],
    },
    {
      title: 'Avoid common coverage mistakes',
      paragraphs: [
        'Do not hide the only router in a cupboard, place it beside large metal objects or expect one unit to cover every garden and floor. Do not buy extenders before checking where the signal becomes weak and why.',
      ],
    },
  ],
  pricing: {
    title: 'Networking pricing',
    paragraphs: [
      'Quote after site visit.',
      'Site visit Rs 599. Waived when you go ahead and the total hardware and service charge is more than Rs 1,499. Final price in a written quote.',
      'The final quote depends on the site layout, cable routes, equipment locations and network requirements.',
    ],
  },
  process: [
    {
      title: '1. Describe the coverage issue',
      paragraphs: ['You tell us where the connection fails, what devices are affected and how the network is used. We confirm the visit time when you book.'],
    },
    {
      title: '2. We review the site',
      paragraphs: ['We assess wall materials, layout, current equipment, coverage and cable routes. You receive a practical explanation of the likely cause.'],
    },
    {
      title: '3. You receive a written quote',
      paragraphs: ['The quote confirms the recommended approach, work and final price before work starts. You can ask for changes before confirming.'],
    },
    {
      title: '4. We install and configure',
      paragraphs: ['We install the agreed cabling or equipment, configure the network and test the expected locations where practical.'],
    },
    {
      title: '5. We hand over the network',
      paragraphs: ['You receive the network details, practical password guidance and an explanation of the agreed guest or staff arrangement.'],
    },
  ],
  included: [
    'A review of the relevant layout, existing equipment and coverage issue.',
    'Installation and configuration included in your written quote.',
    'Network and Wi-Fi setup for the agreed equipment.',
    'A practical handover covering passwords and agreed network access.',
  ],
  notIncluded: [
    'A promise that an internet plan or provider connection will become faster.',
    'An unlimited Wi-Fi range or uninterrupted internet service.',
    'Provider-side changes, permissions or billing unless stated in the written quote.',
    'A guarantee that every device will perform the same way in every location.',
  ],
  warranty: [
    'Equipment has the manufacturer warranty that applies to its brand and product. We handle brand warranty claims for equipment we supply.',
    'TecBunny workmanship warranty is 6 months.',
    'Torn or cut cables and physical damage are not covered by our workmanship warranty.',
    'We confirm the visit time when you book. We do not promise a fixed response time.',
  ],
  notRightFor: [
    'You need a slow internet plan to become faster without changing the plan or provider.',
    'You expect one wireless router to cover every large or thick-walled property without a survey.',
    'You need guaranteed zero downtime or uninterrupted Wi-Fi.',
    'You do not have permission for the necessary cabling or equipment placement.',
  ],
  faqs: [
    {
      question: 'Why is Wi-Fi weak in some rooms?',
      answer:
        'Walls, distance, furniture, interference and router placement can all affect it. Laterite walls and larger gardens can make one router unsuitable for the whole property, so we assess the actual layout.',
    },
    {
      question: 'Do I need mesh or wired access points?',
      answer:
        'It depends on the layout and cable routes. Wired access points are often more predictable for larger or thick-walled spaces, while mesh can suit some layouts when planned carefully.',
    },
    {
      question: 'Will new Wi-Fi make my internet plan faster?',
      answer:
        'No. It can improve local coverage and remove network bottlenecks, but the speed of the internet service still depends on your plan and provider.',
    },
    {
      question: 'Can you set up separate guest Wi-Fi?',
      answer:
        'Yes, where the selected equipment supports it. A guest network can keep visitor devices separate from staff computers and other internal equipment.',
    },
    {
      question: 'Is Cat6 cabling right for my site?',
      answer:
        'Cat6 is a common choice for modern local networks and wired access-point backhaul. We confirm suitable cable routing and equipment needs after reviewing the site.',
    },
    {
      question: 'Can a second internet line prevent outages?',
      answer:
        'It can provide another connection option for a suitable site, but it does not guarantee uninterrupted service. The design depends on the connections, equipment and how the site uses them.',
    },
    {
      question: 'Will you share the Wi-Fi password after setup?',
      answer:
        'Yes. We hand over the relevant network details and explain basic password management. Keep administrator access limited to people who need it.',
    },
    {
      question: 'Can you fix a provider connection problem?',
      answer:
        'We can test the local network and identify likely local issues. The provider controls the internet connection and plan, so provider-side repair or speed changes remain outside our control.',
    },
  ],
  areas:
    'We serve all of North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra, near the Goa border.',
  serviceDescription:
    'Wi-Fi surveys, cabling, router, switch, access-point and local-network setup for homes and small businesses.',
};
