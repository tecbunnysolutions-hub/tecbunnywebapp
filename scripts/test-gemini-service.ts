import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateGeminiText } from '../src/lib/ai/gemini-service';

async function test() {
  try {
    const res = await generateGeminiText({
      prompt: 'Hello, reply with "Success!"',
    });
    console.log('Result:', res);
  } catch (error: any) {
    console.error('Failed:', error.message || error);
  }
}

test();
