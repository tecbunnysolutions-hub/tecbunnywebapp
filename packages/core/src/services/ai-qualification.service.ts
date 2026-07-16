import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@tecbunny/database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface AIQualificationResult {
  budget: number;
  timeline: string;
  city: string;
  business_type: string;
  requirement: string;
  quantity: number;
  lead_score: number;
  heat_level: 'HOT' | 'WARM' | 'COLD' | 'DEAD';
  missing_fields: string[];
  next_question: string | null;
}

export class AIQualificationService {
  /**
   * Evaluates a conversational message to extract lead qualification data.
   */
  static async evaluateConversation(
    conversationText: string, 
    existingData?: Partial<AIQualificationResult>
  ): Promise<AIQualificationResult | null> {
    
    const prompt = `
    You are an expert sales qualifier for an IT Infrastructure and CCTV company.
    Analyze the following conversation and extract these fields:
    - Budget (number in INR, if mentioned)
    - Timeline (e.g. 'Immediate', 'Next Month')
    - City
    - Business Type (e.g. 'Retail', 'Office', 'Home')
    - Requirement (e.g. '8 CCTV Cameras', 'Biometric Lock')
    - Quantity (number)

    Also, calculate a lead_score out of 100 based on the presence of these fields and urgency.
    Assign a heat_level: HOT (score > 80), WARM (50-80), COLD (20-49), DEAD (<20).
    Identify any 'missing_fields' from the list above.
    Generate a 'next_question' to ask the customer to fill in the missing fields (if any).

    Existing known data (do not override unless new info contradicts): 
    ${JSON.stringify(existingData || {})}

    Conversation:
    "${conversationText}"

    Output EXACTLY a JSON object with keys: budget, timeline, city, business_type, requirement, quantity, lead_score, heat_level, missing_fields, next_question.
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean up markdown formatting if present
      const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonString) as AIQualificationResult;
    } catch (error) {
      console.error('AI Qualification Error:', error);
      return null;
    }
  }

  /**
   * Applies the qualification result to a lead in the database.
   */
  static async applyQualificationToLead(supabase: ReturnType<typeof createClient>, leadId: string, qualResult: AIQualificationResult) {
    const { budget, timeline, city, business_type, requirement, quantity, lead_score, heat_level } = qualResult;
    
    const { error } = await supabase
      .from('sls_leads')
      .update({
        budget,
        timeline,
        city,
        business_type,
        requirement,
        quantity,
        lead_score,
        heat_level,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);
      
    if (error) throw error;
  }
}
