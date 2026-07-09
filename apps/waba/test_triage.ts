import { InboundTriageAgent } from './src/agents/InboundTriageAgent';

async function test() {
  const agent = new InboundTriageAgent();
  try {
    const res = await agent.execute({
      results: [{
        from: '919876543210',
        messageId: 'test-msg-1234-' + Date.now(), // Unique to avoid uniqueness constraint
        message: { text: 'Hi' }
      }]
    });
    console.log('Result:', res);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
