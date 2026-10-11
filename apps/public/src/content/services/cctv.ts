import type { ServiceContent } from './types';

export const cctvService: ServiceContent = {
  slug: 'cctv-security',
  path: '/services/cctv-security',
  name: 'CCTV',
  title: 'CCTV Installation in Goa | TecBunny',
  metaDescription:
    'CCTV planning, installation, repair and handover for homes and small businesses in North Goa and the Sawantwadi area.',
  promise:
    'We plan CCTV around the places you need to see, explain the trade-offs clearly, and hand over a system you can use.',
  audience: [
    'Homes, villas and apartments that need clear coverage of gates, entrances, parking, gardens or common areas.',
    'Shops, offices and workshops that need to review activity, deliveries and entry points.',
    'Guesthouses and small hospitality properties that need practical coverage without placing cameras in private spaces.',
  ],
  problems: [
    'A gate, side passage or parking area is not visible from where you live or work.',
    'An existing camera shows a face as a blur because it is too far away, badly placed or facing backlight.',
    'Footage stops recording without anyone noticing until it is needed.',
    'Rain, salt air, loose connectors or weak adapters cause outdoor cameras to drop out.',
    'Family or staff need remote viewing, but the app is unsafe or access is unclear.',
    'You need a record of deliveries or activity but do not know how much storage to allow.',
  ],
  whatWeDo: [
    {
      title: 'Plan camera positions before installation',
      paragraphs: [
        'We start with the entrances, paths, counters and other places that matter to you. We look for usable views rather than simply adding cameras.',
        'Height, direction and light affect whether a camera captures a useful image. We avoid pointing a camera straight into a bright entrance, vehicle headlamps or a reflective surface where practical.',
      ],
    },
    {
      title: 'Choose an analog HD or IP setup that fits the site',
      paragraphs: [
        'Analog HD can work with usable coaxial cabling; IP cameras send video over a network and can suit flexible placement, power over Ethernet or higher-detail coverage. We are authorised to supply CP PLUS and Hikvision and also supply Dahua.',
      ],
    },
    {
      title: 'Match resolution and storage to the job',
      paragraphs: [
        'A 2MP camera can be enough for a broad overview. A 4MP or higher camera can show more detail, but higher detail can also use more storage and needs good placement to help.',
      ],
    },
    {
      title: 'Install cabling and outdoor connections for local conditions',
      paragraphs: [
        'Goa monsoon rain, humidity, salt air and laterite walls all affect how cables and joints should be handled. We route cables carefully, use drip loops where an outdoor cable enters an enclosure, and avoid leaving exposed joins where practical.',
      ],
    },
    {
      title: 'Set up recording, remote viewing and access',
      paragraphs: [
        'We configure the recorder, add the cameras, and set up the viewing app on the devices you identify during handover. We explain how to find live video and recorded clips.',
      ],
    },
    {
      title: 'Improve power protection where it is needed',
      paragraphs: [
        'A power cut can stop cameras and recording unless the system has suitable backup. UPS runtime depends on the actual load, so we discuss the equipment and expected runtime rather than promising a fixed number of hours.',
      ],
    },
    {
      title: 'Repair and check existing systems',
      paragraphs: [
        'We can diagnose common camera, cable, recorder, storage and power faults. We explain the likely cause and provide a written quote before work starts.',
      ],
    },
  ],
  buyersGuide: [
    {
      title: 'Start with the decision you need the footage to support',
      paragraphs: [
        'Ask what you need to see at each location: a broad view of activity, a face at a gate, a vehicle entering, or work at a counter. A camera that sees a large area may not provide identification detail from far away.',
        'Walk the site at the time when the problem happens. Strong daylight at a doorway and vehicle headlights at night can change what a camera can capture.',
      ],
    },
    {
      title: 'Ask how storage has been calculated',
      paragraphs: [
        'Storage in GB = bitrate in Mbps x 10.8 x days x cameras; one Mbps of video is about 10.8 GB per day. For example, four cameras at an assumed 2 Mbps each for 15 days need about 1,296 GB before overhead.',
        'This is only a planning example. Actual bitrate changes with the camera, codec, scene, resolution, frame rate and motion, so we confirm it at the site visit.',
      ],
    },
    {
      title: 'Compare night vision, not only megapixels',
      paragraphs: [
        'Infrared can provide a black-and-white image in low light, while colour night viewing may need ambient light or a suitable camera. A wider lens covers more area; a narrower lens can show more detail in one direction.',
      ],
    },
    {
      title: 'Plan ownership, privacy and maintenance',
      paragraphs: [
        'Decide who can watch, download and change settings, then remove access when a staff member leaves. Cameras must not cover neighbours’ private spaces or areas such as bathrooms and changing rooms; confirm requirements with your building owner or relevant authority.',
      ],
    },
    {
      title: 'Avoid common installation mistakes',
      paragraphs: [
        'Do not place every camera at the highest possible point: a very high angle can make faces difficult to recognise. Do not assume Wi-Fi is reliable outdoors or hide joints where they cannot be checked.',
      ],
    },
  ],
  pricing: {
    title: 'CCTV setup pricing',
    paragraphs: [
      'From Rs 19,999 for CCTV setup.',
      'Final price depends on your requirements and is confirmed in a written quote before work starts.',
      'The site, cable paths, power condition, camera positions and recording needs affect the final quote.',
    ],
  },
  process: [
    {
      title: '1. Tell us about the site',
      paragraphs: [
        'You describe the areas you want to cover, the problem you are trying to solve and any existing system. We confirm a suitable visit time when you book.',
      ],
    },
    {
      title: '2. We review the location',
      paragraphs: [
        'We check camera positions, cable routes, lighting, power and practical access. You receive a recommendation based on the site rather than a generic camera count.',
      ],
    },
    {
      title: '3. You receive a written quote',
      paragraphs: [
        'The quote sets out the proposed work and final price before work starts. You can ask questions or change the scope before confirming.',
      ],
    },
    {
      title: '4. We install and configure',
      paragraphs: [
        'We install the agreed setup, configure recording and set up access for the people you identify. We keep you informed if site conditions require a change to the agreed approach.',
      ],
    },
    {
      title: '5. We hand over the system',
      paragraphs: [
        'You receive an explanation of everyday viewing and playback, access details, and the warranty information that applies to the supplied equipment and workmanship.',
      ],
    },
  ],
  included: [
    'Site-specific planning before the work is confirmed.',
    'Installation and configuration included in your written quote.',
    'Recording and viewing-app setup for the agreed system.',
    'A practical handover explaining live view, playback and access.',
    'GST invoice and warranty details for the agreed work.',
  ],
  notIncluded: [
    'Unlimited backup time during power cuts; UPS runtime depends on the installed load.',
    'Permission from a landlord, housing society, building owner or authority.',
    'Coverage of neighbours’ private spaces or private areas such as bathrooms and changing rooms.',
  ],
  warranty: [
    'Equipment has the manufacturer warranty that applies to its brand and product. We handle brand warranty claims for equipment we supply.',
    'TecBunny workmanship warranty is 6 months.',
    'Torn or cut cables and physical damage are not covered by our workmanship warranty.',
    'We confirm the visit time when you book. We do not promise a fixed response time.',
  ],
  notRightFor: [
    'You need a guarantee that CCTV prevents theft or captures every event.',
    'You want cameras aimed at neighbours’ private spaces.',
    'You need monitored security, emergency response or legal advice.',
    'You expect a fixed backup duration without assessing the load.',
  ],
  faqs: [
    {
      question: 'Should I choose analog HD or IP cameras?',
      answer:
        'Analog HD can suit a straightforward setup or usable coaxial cabling. IP cameras can suit flexible network-based installations; the right choice depends on the site, power, cable routes and view needed.',
    },
    {
      question: 'How much storage do I need?',
      answer:
        'Storage depends on camera count, bitrate, retained days and recording mode. Use bitrate in Mbps x 10.8 x days x cameras for planning; we confirm the estimate at the site visit.',
    },
    {
      question: 'Can I view CCTV from my phone?',
      answer:
        'Yes, where the selected system supports it. We set up the app for agreed users at handover; keep access limited and change default passwords.',
    },
    {
      question: 'Will CCTV work during a power cut?',
      answer:
        'Only with suitable backup power. Runtime depends on the load of the cameras, recorder and network equipment, so we do not promise a fixed duration without assessing the setup.',
    },
    {
      question: 'Can outdoor cameras handle Goa monsoon weather?',
      answer:
        'They need careful placement, cable routing and weatherproofed connections. Rain, humidity and salt air can affect equipment over time, so regular checks remain important.',
    },
    {
      question: 'Where should cameras be placed?',
      answer:
        'Start with gates, entrances, parking, cash or delivery points. We assess height, light, glare and subject distance so the view is useful.',
    },
    {
      question: 'Do you repair existing CCTV systems?',
      answer:
        'Yes. We diagnose camera, cable, recorder, storage and power issues where possible, then give a written quote before work starts.',
    },
    {
      question: 'Can I point a camera towards the road or a neighbour’s property?',
      answer:
        'Cameras must not cover neighbours’ private spaces. Limit road-facing or shared-area views to what you need and confirm requirements with your building owner or relevant authority.',
    },
  ],
  areas:
    'We serve all of North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra, near the Goa border.',
  serviceDescription:
    'CCTV planning, installation, configuration, repair and handover for homes and small businesses.',
};
