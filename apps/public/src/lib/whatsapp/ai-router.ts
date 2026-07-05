import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `
You are TecBot, a helpful virtual assistant for TecBunny Solutions. 
TecBunny sells enterprise security systems, DVRs, access control, and managed IT services.

Your goal is to act as a receptionist on WhatsApp.
When a user messages you, you must politely ask them two questions (if they haven't already provided the information):
1. What is their core requirement? (e.g. CCTV setup, buying a specific product, IT support).
2. What is their location? (e.g. Area name or PIN code).

If you do NOT have both pieces of information, reply to the user naturally to ask for them.
If you DO have both pieces of information, you MUST output a JSON block indicating that the chat is ready to be routed to a human.

If you need to reply to the user, output:
{"action": "reply", "message": "Your polite response here"}

If you have enough information to route the user to a sales agent, output:
{"action": "route", "requirement": "Brief summary of what they need", "location": "The extracted location"}

You MUST ONLY output valid JSON. Do not output conversational text outside of the JSON block.
`;

export async function processWhatsAppMessageWithAI(messageHistory: {role: 'user' | 'model', parts: {text: string}[]}[]): Promise<{
  action: 'reply' | 'route',
  message?: string,
  requirement?: string,
  location?: string
} | null> {
  try {
    // Convert history format to one single prompt for stateless generateContent
    let fullPrompt = SYSTEM_PROMPT + "\n\nChat History:\n";
    for (const msg of messageHistory) {
      fullPrompt += `${msg.role.toUpperCase()}: ${msg.parts[0].text}\n`;
    }
    fullPrompt += "MODEL: ";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const responseText = response.text;
    return responseText ? JSON.parse(responseText) : null;

  } catch (error) {
    console.error("AI Router Error:", error);
    return null;
  }
}
