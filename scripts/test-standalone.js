import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const apiKey = process.env.SARVAM_API_KEY;
  console.log('Using API Key:', apiKey ? apiKey.substring(0, 8) + '...' : 'undefined');

  const prompt = `You are an expert e-commerce copywriter.
Create a beautifully formatted HTML description fragment for the product ZEBRONICS Zeb-Comfort Wired USB Mouse, 3-Button, 1000 DPI Optical Sensor.
Include:
- Styled headers using accent color #d9534f
- An unordered list of features (from \\nKey features to cover:\\n  - 3-Button design\\n  - 1000 DPI optical sensor)
- A summary card containing the GST note: <p style="font-size: 0.78rem; color: #555; margin-top: 0.5rem;">📋 <em>GST Reference – HSN Code: 84716060 | Applicable GST rate may vary.</em></p>
Input Info:
Category: Computers & Accessories > Accessories
Brand: ZEBRONICS
Model Number: Zeb-Comfort
Output ONLY the clean HTML fragment.`;

  const payload = {
    model: 'sarvam-30b',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.55,
    max_tokens: 2048,
    reasoning_effort: null, // Disable reasoning
  };

  try {
    const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey || '',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response Status:', res.status);
    const bodyText = await res.text();
    console.log('Response Body:', bodyText);
  } catch (err) {
    console.error('Error:', err.message || err);
  }
}

run();
