import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { GoogleGenAI, Type } from '@google/genai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-superadmin-username, x-superadmin-password',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const usernameHeader = request.headers.get('x-superadmin-username') || '';
    const passwordHeader = request.headers.get('x-superadmin-password') || '';

    const expectedUsername = process.env.SUPERADMIN_USER_ID || 'Shubham6010';
    const expectedPassword = process.env.SUPERADMIN_PASSWORD || 'Bunny@6010';

    if (usernameHeader !== expectedUsername || passwordHeader !== expectedPassword) {
      return NextResponse.json(
        { error: 'Forbidden: Invalid Superadmin credentials.' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { rawText } = body;

    if (!rawText) {
      return NextResponse.json({ error: 'rawText is required' }, { status: 400, headers: corsHeaders });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error('ai_scraper.missing_api_key', { correlationId });
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500, headers: corsHeaders });
    }

    const ai = new GoogleGenAI({ apiKey });

    // We define a strict JSON schema for the response
    const schema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The full product name/title"
        },
        brand: {
          type: Type.STRING,
          description: "The brand of the product"
        },
        modelNo: {
          type: Type.STRING,
          description: "The model number or name, if available"
        },
        mrp: {
          type: Type.STRING,
          description: "The Original Price or M.R.P. Keep the currency symbol, e.g., ₹2,490"
        },
        price: {
          type: Type.STRING,
          description: "The current Sale Price. Keep the currency symbol, e.g., ₹760"
        },
        category: {
          type: Type.STRING,
          description: "The product category breadcrumbs, e.g., Electronics > Audio > Headphones"
        },
        shortDescription: {
          type: Type.STRING,
          description: "A very compelling 1-2 sentence short description summarizing the product."
        },
        warrantyPeriod: {
          type: Type.STRING,
          description: "The duration of the warranty (e.g., 1 Year, 6 Months). Leave blank if not found."
        },
        warrantyType: {
          type: Type.STRING,
          description: "The type of warranty (e.g., Manufacturer, Seller). Leave blank if not found."
        },
        additional1: {
          type: Type.STRING,
          description: "A key feature or specification of the product."
        },
        additional2: {
          type: Type.STRING,
          description: "Another key feature or specification of the product."
        },
        additional3: {
          type: Type.STRING,
          description: "A third key feature or specification of the product."
        }
      },
      required: ["title", "shortDescription"]
    };

    const prompt = `
      You are an expert e-commerce data extraction assistant.
      Read the following raw text from an e-commerce product webpage.
      Extract all the required fields into JSON format.
      If a field is not present or cannot be determined confidently, leave it empty or null.
      
      RAW WEBPAGE TEXT:
      ---------------------
      ${rawText.substring(0, 30000)} // Limiting to 30k chars to avoid token limits
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      }
    });

    if (!response.text) {
      throw new Error("AI returned empty response");
    }

    const result = JSON.parse(response.text);
    
    logger.info('ai_scraper.success', { correlationId });
    return NextResponse.json({ success: true, data: result, correlationId }, { headers: corsHeaders });

  } catch (err: any) {
    logger.error('ai_scraper.error', { correlationId: 'unknown', error: err.message, stack: err.stack });
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
