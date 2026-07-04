import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { GoogleGenAI, Type } from '@google/genai';
import * as cheerio from 'cheerio';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Attempt to fetch the URL using standard browser headers
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch URL: ${fetchResponse.status} ${fetchResponse.statusText}`);
    }

    const html = await fetchResponse.text();

    // Use cheerio to load and strip unnecessary tags
    const $ = cheerio.load(html);
    $('script, style, svg, noscript, iframe, img').remove();
    const rawText = $('body').text().replace(/\s+/g, ' ').trim();

    if (rawText.length < 50) {
      throw new Error("Could not extract meaningful text. The site might be blocking server requests (e.g. CAPTCHA).");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        brand: { type: Type.STRING },
        modelNo: { type: Type.STRING },
        mrp: { type: Type.STRING },
        price: { type: Type.STRING },
        category: { type: Type.STRING },
        shortDescription: { type: Type.STRING },
        warrantyPeriod: { type: Type.STRING },
        warrantyType: { type: Type.STRING },
        additional1: { type: Type.STRING },
        additional2: { type: Type.STRING },
        additional3: { type: Type.STRING },
        seoTitle: { type: Type.STRING },
        seoDescription: { type: Type.STRING },
        htmlDescription: { type: Type.STRING }
      },
      required: ["title", "shortDescription", "seoTitle", "seoDescription", "htmlDescription"]
    };

    const prompt = `
      You are an expert e-commerce data extraction assistant and a world-class technical copywriter.
      Read the following raw text scraped from an e-commerce product webpage.
      Extract all the required fields into JSON format.
      For the 'htmlDescription', craft a stunning, well-structured product description using modern HTML tags (like <h3>, <ul>, <li>, <br/>, <strong>). Make sure it looks professional and highlights key features.
      If a field is not present or cannot be determined confidently, leave it empty or null.
      
      RAW WEBPAGE TEXT:
      ---------------------
      ${rawText.substring(0, 30000)}
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      }
    });

    if (!aiResponse.text) {
      throw new Error("AI returned empty response");
    }

    const result = JSON.parse(aiResponse.text);

    const supabase = await createServiceClient();

    let parsedPrice = 0;
    if (result.price) {
      const match = result.price.match(/[\d,.]+/);
      if (match) parsedPrice = parseFloat(match[0].replace(/,/g, ''));
    }
    let parsedMrp = parsedPrice * 1.2;
    if (result.mrp) {
      const match = result.mrp.match(/[\d,.]+/);
      if (match) parsedMrp = parseFloat(match[0].replace(/,/g, ''));
    }

    const baseHandleSegment = `url-${crypto.randomUUID().slice(0, 8)}`;
    const productPayload = {
      handle: `id-${baseHandleSegment}`,
      name: result.title || 'Scraped Product',
      title: result.title || 'Scraped Product',
      description: result.htmlDescription || result.shortDescription || '',
      price: parsedPrice,
      mrp: parsedMrp,
      category: result.category || 'General',
      brand: result.brand || null,
      status: 'active',
      product_type: 'physical',
      model_number: result.modelNo || null,
      specifications: {
        'Source URL': url,
        ...(result.warrantyPeriod && { 'Warranty Period': result.warrantyPeriod }),
        ...(result.warrantyType && { 'Warranty Type': result.warrantyType }),
        ...(result.additional1 && { 'Additional 1': result.additional1 }),
        ...(result.additional2 && { 'Additional 2': result.additional2 }),
        ...(result.additional3 && { 'Additional 3': result.additional3 })
      },
      short_description: result.shortDescription || null,
      tags: ['scraped-url'],
      is_active: true,
      stock_quantity: 1,
      ...(result.seoTitle && { seo_title: result.seoTitle }),
      ...(result.seoDescription && { seo_description: result.seoDescription })
    };

    const { data: insertedProduct, error: dbError } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database Error: ${dbError.message}`);
    }

    logger.info('url_scraper.success', { correlationId, url });
    return NextResponse.json({ success: true, product: insertedProduct });

  } catch (err: any) {
    logger.error('url_scraper.error', { correlationId, error: err.message });
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
