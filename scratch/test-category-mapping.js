import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function mapProductToCategory(name) {
  const lowercaseName = name.toLowerCase();

  // 1. Laptops, Desktops and Monitors (Must be high priority to avoid matching "SSD" in description)
  if (lowercaseName.includes('laptop') || lowercaseName.includes('notebook') || lowercaseName.includes('thinkpad') || lowercaseName.includes('macbook')) {
    return 'Computers & Accessories > Laptops > Traditional Laptops';
  }
  if (lowercaseName.includes('desktop') || lowercaseName.includes('all-in-one') || lowercaseName.includes('computer tower')) {
    return 'Computers & Accessories > Desktops > Tower Desktops';
  }
  if (lowercaseName.includes('monitor') || lowercaseName.includes('display') || lowercaseName.includes('screen')) {
    return 'Computers & Accessories > Monitors';
  }

  // 2. CCTV and Surveillance
  if (
    lowercaseName.includes('camera') || 
    lowercaseName.includes('cctv') || 
    lowercaseName.includes('dvr') || 
    lowercaseName.includes('nvr') || 
    lowercaseName.includes('dome') || 
    lowercaseName.includes('bullet') || 
    lowercaseName.includes('cp plus') || 
    lowercaseName.includes('hikvision')
  ) {
    if (lowercaseName.includes('setup') || lowercaseName.includes('kit') || lowercaseName.includes('bundle')) {
      return 'Electronics > Security & Surveillance > CCTV Systems';
    }
    if (lowercaseName.includes('dvr') || lowercaseName.includes('nvr')) {
      return 'Electronics > Security & Surveillance > Video Recorders';
    }
    if (lowercaseName.includes('cable') || lowercaseName.includes('modular rack') || lowercaseName.includes('rack') || lowercaseName.includes('co-axial') || lowercaseName.includes('smps 10 amp') || lowercaseName.includes('poe switch')) {
      return 'Electronics > Security & Surveillance > Security Accessories';
    }
    return 'Electronics > Security & Surveillance > Security Cameras';
  }

  // 3. Computer Components
  if (lowercaseName.includes('motherboard')) {
    return 'Computers & Accessories > Computer Components > Motherboards';
  }
  if (lowercaseName.includes('ram') || lowercaseName.includes('ddr3') || lowercaseName.includes('ddr4') || lowercaseName.includes('ddr5') || lowercaseName.includes('memory module')) {
    return 'Computers & Accessories > Computer Components > RAM';
  }
  if (lowercaseName.includes('cpu cooler') || lowercaseName.includes('cooler') || lowercaseName.includes('heatsink')) {
    return 'Computers & Accessories > Computer Components > Fans & Cooling';
  }
  if (lowercaseName.includes('smps') || lowercaseName.includes('power supply') || lowercaseName.includes('psu')) {
    return 'Computers & Accessories > Computer Components > Power Supplies';
  }

  // 4. Storage Devices
  if (lowercaseName.includes('ssd') || lowercaseName.includes('solid state drive') || lowercaseName.includes('m.2') || lowercaseName.includes('nvme')) {
    if (lowercaseName.includes('enclosure') || lowercaseName.includes('caddy')) {
      return 'Computers & Accessories > Storage Devices > Hard Drive Enclosures';
    }
    return 'Computers & Accessories > Storage Devices > Internal SSDs';
  }
  if (lowercaseName.includes('hdd') || lowercaseName.includes('hard drive') || lowercaseName.includes('hard disk')) {
    if (lowercaseName.includes('external') || lowercaseName.includes('portable')) {
      return 'Computers & Accessories > Storage Devices > External Hard Drives';
    }
    return 'Computers & Accessories > Storage Devices > Internal Hard Drives';
  }
  if (lowercaseName.includes('pen drive') || lowercaseName.includes('flash drive') || lowercaseName.includes('sandisk ultra') || lowercaseName.includes('otg') || lowercaseName.includes('cruzer') || lowercaseName.includes('blade')) {
    return 'Computers & Accessories > Storage Devices > USB Flash Drives';
  }
  if (lowercaseName.includes('sd card') || lowercaseName.includes('memory card') || lowercaseName.includes('microsd')) {
    return 'Computers & Accessories > Storage Devices > Memory Cards';
  }

  // 5. Networking Devices
  if (lowercaseName.includes('router') || lowercaseName.includes('wifi') || lowercaseName.includes('access point') || lowercaseName.includes('modem')) {
    return 'Computers & Accessories > Networking Devices > Routers';
  }
  if (lowercaseName.includes('switch') && (lowercaseName.includes('port') || lowercaseName.includes('poe') || lowercaseName.includes('gigabit'))) {
    return 'Computers & Accessories > Networking Devices > Network Switches';
  }
  if (lowercaseName.includes('cable') || lowercaseName.includes('cat6') || lowercaseName.includes('ethernet') || lowercaseName.includes('rj45')) {
    return 'Computers & Accessories > Accessories > Cables & Adapters';
  }

  // 6. Peripherals and Accessories
  if (lowercaseName.includes('keyboard')) {
    return 'Computers & Accessories > Input Devices > Keyboards';
  }
  if (lowercaseName.includes('mouse') || lowercaseName.includes('mice')) {
    return 'Computers & Accessories > Input Devices > Mice';
  }
  if (lowercaseName.includes('printer') || lowercaseName.includes('scanner')) {
    return 'Computers & Accessories > Printers & Scanners';
  }
  if (lowercaseName.includes('ups') || lowercaseName.includes('inverter') || lowercaseName.includes('battery backup') || lowercaseName.includes('apc')) {
    return 'Computers & Accessories > Power Accessories > Uninterruptible Power Supplies';
  }

  // 7. Generic Fallbacks based on common words
  if (lowercaseName.includes('connector') || lowercaseName.includes('adapter') || lowercaseName.includes('splitter')) {
    return 'Computers & Accessories > Accessories > Adapters';
  }

  return 'Computers & Accessories > Accessories > General Accessories';
}

async function testMapping() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category');

    if (error) throw error;

    console.log(`Mapping preview for ${products.length} products:\n`);
    products.forEach((p, idx) => {
      const newCat = mapProductToCategory(p.name);
      console.log(`${idx + 1}. [${p.category || 'None'}] -> [${newCat}]`);
      console.log(`   Name: ${p.name}`);
    });
  } catch (err) {
    console.error(err);
  }
}

testMapping();
