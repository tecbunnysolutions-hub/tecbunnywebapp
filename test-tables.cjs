const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.+?)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.+?)"/);

async function inspectSchema() {
  const url = urlMatch[1];
  const key = keyMatch[1];
  const res = await fetch(url + '/rest/v1/', {
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key
    }
  });
  const data = await res.json();
  
  console.log('--- PRODUCTS PROPERTIES ---');
  if (data.definitions && data.definitions.products) {
    console.log(JSON.stringify(data.definitions.products.properties, null, 2));
  } else {
    console.log('Products definition not found.');
  }

  console.log('\n--- OTP VERIFICATIONS PROPERTIES ---');
  if (data.definitions && data.definitions.otp_verifications) {
    console.log(JSON.stringify(data.definitions.otp_verifications.properties, null, 2));
  } else {
    console.log('otp_verifications definition not found.');
  }
}

inspectSchema();
