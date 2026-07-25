type GeminiGenerateParams = {
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  reasoningEffort?: 'low' | 'medium' | 'high' | null;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

async function generateOpenAIText(prompt: string, options: { temperature?: number; maxOutputTokens?: number }): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxOutputTokens ?? 2000,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI returned empty response');
    return text.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateGeminiText({
  prompt,
  model = DEFAULT_GEMINI_MODEL,
  temperature = 0.4,
  maxOutputTokens = 600,
  reasoningEffort: _reasoningEffort = null,
}: GeminiGenerateParams): Promise<string> {
  // 1. Primary: Use OpenAI API if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateOpenAIText(prompt, { temperature, maxOutputTokens });
    } catch (err: any) {
      console.warn('[AI Service] OpenAI primary failed, falling back to direct Gemini API:', err?.message || err);
    }
  }

  // 2. Direct: Native Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No valid AI API key (OPENAI_API_KEY or GEMINI_API_KEY) is configured.');
  }
  const modelName = model.startsWith('models/') ? model.slice('models/'.length) : model;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  let response: Response;

  try {
    response = await fetch(`${GEMINI_BASE_URL}/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Request to AI service timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const rawBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${rawBody}`);
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('');

  if (!text) {
    throw new Error('AI returned empty response');
  }

  return text.trim();
}
