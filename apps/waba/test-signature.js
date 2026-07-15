const crypto = require('crypto');

const secret = 'bunny@6010'; // Your INFOBIP_HMAC_SECRET

// Example payload that Infobip might send
const payload = JSON.stringify({
  results: [
    {
      from: "1234567890",
      messageId: "test-msg-1",
      message: { text: "Hello Auto Responder!" }
    }
  ]
});

// Generate the HMAC signature
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

console.log('Payload:', payload);
console.log('\nGenerated Signature Header:');
console.log('x-hub-signature-256: sha256=' + signature);
