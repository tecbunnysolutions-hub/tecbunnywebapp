type GeminiGenerateParams = {
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  reasoningEffort?: 'low' | 'medium' | 'high' | null;
};

const SARVAM_BASE_URL = 'https://api.sarvam.ai/v1/chat/completions';
const DEFAULT_SARVAM_MODEL = 'sarvam-30b'; // Recommended for general tasks

export async function generateGeminiText({
  prompt,
  model = DEFAULT_SARVAM_MODEL,
  temperature = 0.4,
  maxOutputTokens = 600,
  reasoningEffort = null,
}: GeminiGenerateParams): Promise<string> {
  const apiKey = process.env.SARVAM_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY or API_KEY is not set');
  }

  // Ensure we use a Sarvam model instead of a Gemini model when called by existing pages
  const actualModel = model.includes('gemini') ? DEFAULT_SARVAM_MODEL : model;

  const payload = {
    model: actualModel,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature,
    max_tokens: maxOutputTokens,
    reasoning_effort: reasoningEffort,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  let response: Response;

  try {
    response = await fetch(SARVAM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Request to Sarvam AI timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const rawBody = await response.text();
    throw new Error(`Sarvam API error: ${response.status} - ${rawBody}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Sarvam returned empty response');
  }

  return text.trim();
}
