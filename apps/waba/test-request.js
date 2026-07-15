const crypto = require('crypto');

const secret = 'bunny@6010'; 
const payloadString = JSON.stringify({
  results: [
    {
      from: "1234567890",
      messageId: "test-msg-1",
      message: { text: "Hello Auto Responder!" }
    }
  ]
});

const signature = crypto
  .createHmac('sha256', secret)
  .update(payloadString)
  .digest('hex');

const headerValue = 'sha256=' + signature;

fetch('http://localhost:3000/api/webhook/whatsapp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-hub-signature-256': headerValue
  },
  body: payloadString
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(console.log)
.catch(console.error);
